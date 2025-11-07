from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils import timezone

from .models import (
    Course, Module, Lesson, Enrollment, LessonProgress,
    CourseProgress, Prerequisite
)
from .serializers import (
    CourseListSerializer, CourseDetailSerializer, ModuleSerializer,
    LessonSerializer, EnrollmentSerializer, EnrollmentDetailSerializer,
    LessonProgressSerializer, CourseProgressSerializer, PrerequisiteSerializer
)


class CourseViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Course management
    
    List: GET /api/courses/ - List all published courses
    Create: POST /api/courses/ - Create a new course (admin only)
    Retrieve: GET /api/courses/{id}/ - Get course details
    Update: PUT /api/courses/{id}/ - Update course (admin only)
    Delete: DELETE /api/courses/{id}/ - Delete course (admin only)
    
    Custom actions:
    - POST /api/courses/{id}/enroll/ - Enroll in a course
    - GET /api/courses/{id}/is-user-enrolled/ - Check enrollment status
    - GET /api/courses/{id}/prerequisites-met/ - Check if prerequisites are met
    """
    queryset = Course.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CourseDetailSerializer
        return CourseListSerializer
    
    def get_queryset(self):
        """Filter courses based on user permissions"""
        if self.request.user.is_staff:
            return Course.objects.all()
        return Course.objects.filter(status='published')
    
    def perform_create(self, serializer):
        """Set the current user as instructor when creating a course"""
        serializer.save(instructor=self.request.user)
    
    def create(self, request, *args, **kwargs):
        """Override to ensure only staff can create courses"""
        if not request.user.is_staff:
            return Response(
                {'detail': 'Only staff members can create courses.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        """Override to ensure only staff can update courses"""
        if not request.user.is_staff:
            return Response(
                {'detail': 'Only staff members can update courses.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """Override to ensure only staff can delete courses"""
        if not request.user.is_staff:
            return Response(
                {'detail': 'Only staff members can delete courses.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=True, methods=['post'])
    def enroll(self, request, pk=None):
        """
        Enroll a user in a course
        POST /api/courses/{id}/enroll/
        """
        course = self.get_object()
        
        # Check prerequisites
        prerequisites = course.prerequisites.all()
        if prerequisites.exists():
            for prereq in prerequisites:
                if not self._check_prerequisite_met(request.user, prereq):
                    return Response(
                        {'detail': f'Prerequisite not met: {prereq.get_prerequisite_type_display()}'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
        
        enrollment, created = Enrollment.objects.get_or_create(
            user=request.user,
            course=course,
            defaults={'status': 'active', 'started_at': timezone.now()}
        )
        
        if not created:
            enrollment.status = 'active'
            enrollment.started_at = timezone.now()
            enrollment.save()
            return Response(
                {'detail': 'Already enrolled in this course'},
                status=status.HTTP_200_OK
            )
        
        # Create CourseProgress entry
        total_lessons = sum(module.lessons.count() for module in course.modules.all())
        CourseProgress.objects.get_or_create(
            user=request.user,
            course=course,
            defaults={'total_lessons': total_lessons}
        )
        
        serializer = EnrollmentSerializer(enrollment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    def is_user_enrolled(self, request, pk=None):
        """
        Check if user is enrolled in a course
        GET /api/courses/{id}/is-user-enrolled/
        """
        course = self.get_object()
        enrollment = Enrollment.objects.filter(
            user=request.user,
            course=course,
            status__in=['active', 'paused', 'completed']
        ).first()
        
        return Response({
            'is_enrolled': enrollment is not None,
            'enrollment_status': enrollment.status if enrollment else None
        })
    
    @action(detail=True, methods=['get'])
    def prerequisites_met(self, request, pk=None):
        """
        Check if user has met all prerequisites for a course
        GET /api/courses/{id}/prerequisites-met/
        """
        course = self.get_object()
        prerequisites = course.prerequisites.all()
        
        all_met = True
        unmet_prerequisites = []
        
        for prereq in prerequisites:
            if not self._check_prerequisite_met(request.user, prereq):
                all_met = False
                unmet_prerequisites.append({
                    'type': prereq.get_prerequisite_type_display(),
                    'description': self._get_prerequisite_description(prereq)
                })
        
        return Response({
            'all_met': all_met,
            'unmet_prerequisites': unmet_prerequisites
        })
    
    def _check_prerequisite_met(self, user, prerequisite):
        """Check if user has met a specific prerequisite"""
        if prerequisite.prerequisite_type == 'course':
            progress = CourseProgress.objects.filter(
                user=user,
                course=prerequisite.prerequisite_course,
                completion_percentage=100
            ).first()
            return progress is not None
        
        elif prerequisite.prerequisite_type == 'module':
            module = prerequisite.prerequisite_module
            total_lessons = module.lessons.count()
            if total_lessons == 0:
                return True
            completed = LessonProgress.objects.filter(
                user=user,
                lesson__module=module,
                watch_percentage=100
            ).count()
            return completed == total_lessons
        
        elif prerequisite.prerequisite_type == 'lesson':
            progress = LessonProgress.objects.filter(
                user=user,
                lesson=prerequisite.prerequisite_lesson,
                watch_percentage=100
            ).first()
            return progress is not None
        
        return False
    
    def _get_prerequisite_description(self, prerequisite):
        """Get a human-readable description of a prerequisite"""
        if prerequisite.prerequisite_type == 'course':
            return prerequisite.prerequisite_course.title
        elif prerequisite.prerequisite_type == 'module':
            return prerequisite.prerequisite_module.title
        elif prerequisite.prerequisite_type == 'lesson':
            return prerequisite.prerequisite_lesson.title
        return 'Unknown prerequisite'


class EnrollmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Enrollment management
    
    List: GET /api/enrollments/ - List user's enrollments
    Retrieve: GET /api/enrollments/{id}/ - Get enrollment details
    Update: PATCH /api/enrollments/{id}/ - Update enrollment status
    Delete: DELETE /api/enrollments/{id}/ - Unenroll from course
    
    Custom actions:
    - POST /api/enrollments/{id}/mark-started/ - Mark course as started
    - POST /api/enrollments/{id}/mark-completed/ - Mark course as completed
    """
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter enrollments to show only user's enrollments"""
        if self.request.user.is_staff:
            return Enrollment.objects.all()
        return Enrollment.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return EnrollmentDetailSerializer
        return EnrollmentSerializer
    
    def destroy(self, request, *args, **kwargs):
        """Allow users to unenroll"""
        enrollment = self.get_object()
        if enrollment.user != request.user and not request.user.is_staff:
            return Response(
                {'detail': 'You can only unenroll from your own courses.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=True, methods=['post'])
    def mark_started(self, request, pk=None):
        """Mark enrollment as started"""
        enrollment = self.get_object()
        enrollment.started_at = timezone.now()
        enrollment.save()
        serializer = self.get_serializer(enrollment)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_completed(self, request, pk=None):
        """Mark enrollment as completed"""
        enrollment = self.get_object()
        enrollment.status = 'completed'
        enrollment.completed_at = timezone.now()
        enrollment.save()
        
        # Update course progress
        progress = CourseProgress.objects.filter(
            user=enrollment.user,
            course=enrollment.course
        ).first()
        if progress:
            progress.completed_at = timezone.now()
            progress.save()
        
        serializer = self.get_serializer(enrollment)
        return Response(serializer.data)


class LessonProgressViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Lesson Progress tracking
    
    List: GET /api/lesson-progress/ - List user's lesson progress
    Create: POST /api/lesson-progress/ - Create lesson progress record
    Update: PUT /api/lesson-progress/{id}/ - Update lesson progress
    
    Custom actions:
    - POST /api/lesson-progress/{id}/update-watch-progress/ - Update video watch progress
    - POST /api/lesson-progress/{id}/mark-completed/ - Mark lesson as completed
    """
    queryset = LessonProgress.objects.all()
    serializer_class = LessonProgressSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter progress to show only user's progress"""
        if self.request.user.is_staff:
            return LessonProgress.objects.all()
        return LessonProgress.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        """Set the current user when creating progress"""
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def update_watch_progress(self, request, pk=None):
        """
        Update video watch progress
        POST /api/lesson-progress/{id}/update-watch-progress/
        Body: {
            "watch_duration": 120,
            "watch_percentage": 50
        }
        """
        progress = self.get_object()
        
        watch_duration = int(request.data.get('watch_duration', progress.watch_duration))
        watch_percentage = int(request.data.get('watch_percentage', progress.watch_percentage))
        
        progress.watch_duration = watch_duration
        progress.watch_percentage = min(100, max(0, watch_percentage))
        progress.is_viewed = progress.watch_percentage > 0
        
        if progress.started_at is None:
            progress.started_at = timezone.now()
        
        if progress.watch_percentage >= 100 and progress.completed_at is None:
            progress.completed_at = timezone.now()
        
        progress.save()
        
        # Update course progress
        self._update_course_progress(progress.lesson.module.course, progress.user)
        
        serializer = self.get_serializer(progress)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_completed(self, request, pk=None):
        """Mark lesson as completed"""
        progress = self.get_object()
        progress.watch_percentage = 100
        progress.completed_at = timezone.now()
        progress.is_viewed = True
        progress.save()
        
        # Update course progress
        self._update_course_progress(progress.lesson.module.course, progress.user)
        
        serializer = self.get_serializer(progress)
        return Response(serializer.data)
    
    def _update_course_progress(self, course, user):
        """Update course progress based on lesson completions"""
        course_progress = CourseProgress.objects.filter(
            user=user,
            course=course
        ).first()
        
        if not course_progress:
            return
        
        total_lessons = sum(module.lessons.count() for module in course.modules.all())
        completed_lessons = LessonProgress.objects.filter(
            user=user,
            lesson__module__course=course,
            watch_percentage=100
        ).count()
        
        course_progress.total_lessons = total_lessons
        course_progress.lessons_completed = completed_lessons
        course_progress.calculate_completion_percentage()
        
        if course_progress.completion_percentage >= 100:
            course_progress.completed_at = timezone.now()
        
        course_progress.save()


class CourseProgressViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for Course Progress tracking (Read-only)
    
    List: GET /api/course-progress/ - List user's course progress
    Retrieve: GET /api/course-progress/{id}/ - Get course progress details
    """
    serializer_class = CourseProgressSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter progress to show only user's progress"""
        if self.request.user.is_staff:
            return CourseProgress.objects.all()
        return CourseProgress.objects.filter(user=self.request.user)


class ModuleViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Module management
    
    List: GET /api/modules/?course={course_id} - List modules for a course
    Create: POST /api/modules/ - Create a new module (admin only)
    Retrieve: GET /api/modules/{id}/ - Get module details
    Update: PUT /api/modules/{id}/ - Update module (admin only)
    Delete: DELETE /api/modules/{id}/ - Delete module (admin only)
    """
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter modules by course if provided"""
        queryset = Module.objects.all()
        course_id = self.request.query_params.get('course')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        return queryset
    
    def create(self, request, *args, **kwargs):
        if not request.user.is_staff:
            return Response(
                {'detail': 'Only staff members can create modules.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)


class LessonViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Lesson management
    
    List: GET /api/lessons/?module={module_id} - List lessons for a module
    Create: POST /api/lessons/ - Create a new lesson (admin only)
    Retrieve: GET /api/lessons/{id}/ - Get lesson details
    Update: PUT /api/lessons/{id}/ - Update lesson (admin only)
    Delete: DELETE /api/lessons/{id}/ - Delete lesson (admin only)
    """
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter lessons by module if provided"""
        queryset = Lesson.objects.all()
        module_id = self.request.query_params.get('module')
        if module_id:
            queryset = queryset.filter(module_id=module_id)
        return queryset
    
    def create(self, request, *args, **kwargs):
        if not request.user.is_staff:
            return Response(
                {'detail': 'Only staff members can create lessons.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)


class PrerequisiteViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Prerequisite management
    
    List: GET /api/prerequisites/?course={course_id} - List prerequisites for a course
    Create: POST /api/prerequisites/ - Create a new prerequisite (admin only)
    Retrieve: GET /api/prerequisites/{id}/ - Get prerequisite details
    Update: PUT /api/prerequisites/{id}/ - Update prerequisite (admin only)
    Delete: DELETE /api/prerequisites/{id}/ - Delete prerequisite (admin only)
    """
    queryset = Prerequisite.objects.all()
    serializer_class = PrerequisiteSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter prerequisites by course if provided"""
        queryset = Prerequisite.objects.all()
        course_id = self.request.query_params.get('course')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        return queryset
    
    def create(self, request, *args, **kwargs):
        if not request.user.is_staff:
            return Response(
                {'detail': 'Only staff members can create prerequisites.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)
