from django.test import TestCase
from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from datetime import timedelta

from .models import (
    Course, Module, Lesson, Enrollment, LessonProgress,
    CourseProgress, Prerequisite
)


class CourseModelTest(TestCase):
    """Test Course model"""
    
    def setUp(self):
        self.user = User.objects.create_user(username='instructor', password='pass123')
    
    def test_create_course(self):
        course = Course.objects.create(
            title='Python Basics',
            description='Learn Python',
            instructor=self.user,
            status='published'
        )
        self.assertEqual(course.title, 'Python Basics')
        self.assertEqual(course.instructor, self.user)
        self.assertEqual(course.status, 'published')
    
    def test_course_string_representation(self):
        course = Course.objects.create(
            title='Django Course',
            description='Learn Django',
            instructor=self.user
        )
        self.assertEqual(str(course), 'Django Course')


class ModuleModelTest(TestCase):
    """Test Module model"""
    
    def setUp(self):
        self.user = User.objects.create_user(username='instructor', password='pass123')
        self.course = Course.objects.create(
            title='Python Course',
            description='Learn Python',
            instructor=self.user
        )
    
    def test_create_module(self):
        module = Module.objects.create(
            course=self.course,
            title='Basics',
            order=1
        )
        self.assertEqual(module.course, self.course)
        self.assertEqual(module.title, 'Basics')
        self.assertEqual(module.order, 1)
    
    def test_module_ordering(self):
        module1 = Module.objects.create(course=self.course, title='Basics', order=1)
        module2 = Module.objects.create(course=self.course, title='Advanced', order=2)
        modules = Module.objects.filter(course=self.course)
        self.assertEqual(modules[0], module1)
        self.assertEqual(modules[1], module2)


class LessonModelTest(TestCase):
    """Test Lesson model"""
    
    def setUp(self):
        self.user = User.objects.create_user(username='instructor', password='pass123')
        self.course = Course.objects.create(
            title='Python Course',
            description='Learn Python',
            instructor=self.user
        )
        self.module = Module.objects.create(
            course=self.course,
            title='Basics',
            order=1
        )
    
    def test_create_video_lesson(self):
        lesson = Lesson.objects.create(
            module=self.module,
            title='Introduction',
            lesson_type='video',
            video_url='https://example.com/video.mp4',
            video_duration=600
        )
        self.assertEqual(lesson.title, 'Introduction')
        self.assertEqual(lesson.lesson_type, 'video')
        self.assertEqual(lesson.video_duration, 600)
    
    def test_create_text_lesson(self):
        lesson = Lesson.objects.create(
            module=self.module,
            title='Reading Material',
            lesson_type='text',
            content='Some text content'
        )
        self.assertEqual(lesson.lesson_type, 'text')
        self.assertEqual(lesson.content, 'Some text content')


class EnrollmentModelTest(TestCase):
    """Test Enrollment model"""
    
    def setUp(self):
        self.user = User.objects.create_user(username='student', password='pass123')
        self.instructor = User.objects.create_user(username='instructor', password='pass123')
        self.course = Course.objects.create(
            title='Python Course',
            description='Learn Python',
            instructor=self.instructor,
            status='published'
        )
    
    def test_create_enrollment(self):
        enrollment = Enrollment.objects.create(
            user=self.user,
            course=self.course,
            status='active'
        )
        self.assertEqual(enrollment.user, self.user)
        self.assertEqual(enrollment.course, self.course)
        self.assertEqual(enrollment.status, 'active')
    
    def test_enrollment_unique_constraint(self):
        Enrollment.objects.create(user=self.user, course=self.course)
        with self.assertRaises(Exception):
            Enrollment.objects.create(user=self.user, course=self.course)


class LessonProgressModelTest(TestCase):
    """Test LessonProgress model"""
    
    def setUp(self):
        self.user = User.objects.create_user(username='student', password='pass123')
        self.instructor = User.objects.create_user(username='instructor', password='pass123')
        self.course = Course.objects.create(
            title='Python Course',
            description='Learn Python',
            instructor=self.instructor
        )
        self.module = Module.objects.create(course=self.course, title='Basics', order=1)
        self.lesson = Lesson.objects.create(
            module=self.module,
            title='Intro',
            lesson_type='video',
            video_duration=600
        )
    
    def test_create_lesson_progress(self):
        progress = LessonProgress.objects.create(
            user=self.user,
            lesson=self.lesson,
            watch_duration=300,
            watch_percentage=50
        )
        self.assertEqual(progress.user, self.user)
        self.assertEqual(progress.watch_percentage, 50)
        self.assertFalse(progress.is_completed())
    
    def test_lesson_completion(self):
        progress = LessonProgress.objects.create(
            user=self.user,
            lesson=self.lesson,
            watch_percentage=100
        )
        self.assertTrue(progress.is_completed())


class CourseProgressModelTest(TestCase):
    """Test CourseProgress model"""
    
    def setUp(self):
        self.user = User.objects.create_user(username='student', password='pass123')
        self.instructor = User.objects.create_user(username='instructor', password='pass123')
        self.course = Course.objects.create(
            title='Python Course',
            description='Learn Python',
            instructor=self.instructor
        )
    
    def test_create_course_progress(self):
        progress = CourseProgress.objects.create(
            user=self.user,
            course=self.course,
            total_lessons=5,
            lessons_completed=2
        )
        self.assertEqual(progress.total_lessons, 5)
        self.assertEqual(progress.lessons_completed, 2)
    
    def test_calculate_completion_percentage(self):
        progress = CourseProgress.objects.create(
            user=self.user,
            course=self.course,
            total_lessons=5,
            lessons_completed=2
        )
        percentage = progress.calculate_completion_percentage()
        self.assertEqual(percentage, 40)
    
    def test_course_not_completed(self):
        progress = CourseProgress.objects.create(
            user=self.user,
            course=self.course,
            total_lessons=5,
            lessons_completed=4
        )
        progress.calculate_completion_percentage()
        self.assertFalse(progress.is_completed())
    
    def test_course_completed(self):
        progress = CourseProgress.objects.create(
            user=self.user,
            course=self.course,
            total_lessons=5,
            lessons_completed=5
        )
        progress.calculate_completion_percentage()
        self.assertTrue(progress.is_completed())


class CourseAPITestCase(APITestCase):
    """Test Course API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.student = User.objects.create_user(username='student', password='pass123')
        self.instructor = User.objects.create_user(username='instructor', password='pass123')
        self.staff_user = User.objects.create_user(username='staff', password='pass123', is_staff=True)
        
        self.course = Course.objects.create(
            title='Python Course',
            description='Learn Python',
            instructor=self.instructor,
            status='published'
        )
        self.draft_course = Course.objects.create(
            title='Draft Course',
            description='Not published',
            instructor=self.instructor,
            status='draft'
        )
    
    def test_list_courses_unauthenticated(self):
        response = self.client.get('/api/courses/')
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])
    
    def test_list_published_courses(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.get('/api/courses/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should only see published course
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['title'], 'Python Course')
    
    def test_staff_sees_all_courses(self):
        self.client.force_authenticate(user=self.staff_user)
        response = self.client.get('/api/courses/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should see both published and draft
        self.assertEqual(len(response.data['results']), 2)
    
    def test_retrieve_course_detail(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.get(f'/api/courses/{self.course.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Python Course')
    
    def test_create_course_non_staff(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.post('/api/courses/', {
            'title': 'New Course',
            'description': 'Test'
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_create_course_staff(self):
        self.client.force_authenticate(user=self.staff_user)
        response = self.client.post('/api/courses/', {
            'title': 'New Course',
            'description': 'Test course',
            'status': 'published'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'New Course')
        self.assertEqual(response.data['instructor']['id'], self.staff_user.id)


class EnrollmentAPITestCase(APITestCase):
    """Test Enrollment API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.student = User.objects.create_user(username='student', password='pass123')
        self.student2 = User.objects.create_user(username='student2', password='pass123')
        self.instructor = User.objects.create_user(username='instructor', password='pass123')
        
        self.course = Course.objects.create(
            title='Python Course',
            description='Learn Python',
            instructor=self.instructor,
            status='published'
        )
        self.module = Module.objects.create(course=self.course, title='Basics', order=1)
        self.lesson = Lesson.objects.create(
            module=self.module,
            title='Intro',
            lesson_type='video',
            video_duration=600,
            order=1
        )
    
    def test_enroll_in_course(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.post(f'/api/courses/{self.course.id}/enroll/')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        enrollment = Enrollment.objects.get(user=self.student, course=self.course)
        self.assertEqual(enrollment.status, 'active')
    
    def test_double_enroll(self):
        self.client.force_authenticate(user=self.student)
        response1 = self.client.post(f'/api/courses/{self.course.id}/enroll/')
        response2 = self.client.post(f'/api/courses/{self.course.id}/enroll/')
        self.assertEqual(response1.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response2.status_code, status.HTTP_200_OK)
    
    def test_check_enrollment_status(self):
        self.client.force_authenticate(user=self.student)
        self.client.post(f'/api/courses/{self.course.id}/enroll/')
        
        response = self.client.get(f'/api/courses/{self.course.id}/is_user_enrolled/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['is_enrolled'])
        self.assertEqual(response.data['enrollment_status'], 'active')
    
    def test_list_enrollments(self):
        self.client.force_authenticate(user=self.student)
        self.client.post(f'/api/courses/{self.course.id}/enroll/')
        
        response = self.client.get('/api/enrollments/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['course']['title'], 'Python Course')


class LessonProgressAPITestCase(APITestCase):
    """Test Lesson Progress API endpoints and progress calculations"""
    
    def setUp(self):
        self.client = APIClient()
        self.student = User.objects.create_user(username='student', password='pass123')
        self.instructor = User.objects.create_user(username='instructor', password='pass123')
        
        self.course = Course.objects.create(
            title='Python Course',
            description='Learn Python',
            instructor=self.instructor,
            status='published'
        )
        self.module = Module.objects.create(course=self.course, title='Basics', order=1)
        self.lesson1 = Lesson.objects.create(
            module=self.module,
            title='Lesson 1',
            lesson_type='video',
            video_duration=600,
            order=1
        )
        self.lesson2 = Lesson.objects.create(
            module=self.module,
            title='Lesson 2',
            lesson_type='video',
            video_duration=600,
            order=2
        )
        
        # Enroll student
        self.enrollment = Enrollment.objects.create(
            user=self.student,
            course=self.course
        )
        self.course_progress = CourseProgress.objects.create(
            user=self.student,
            course=self.course,
            total_lessons=2
        )
    
    def test_create_lesson_progress(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.post('/api/lesson-progress/', {
            'lesson': self.lesson1.id,
            'is_viewed': False,
            'watch_duration': 0,
            'watch_percentage': 0
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_update_watch_progress(self):
        self.client.force_authenticate(user=self.student)
        progress = LessonProgress.objects.create(
            user=self.student,
            lesson=self.lesson1
        )
        
        response = self.client.post(
            f'/api/lesson-progress/{progress.id}/update_watch_progress/',
            {
                'watch_duration': 300,
                'watch_percentage': 50
            }
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['watch_percentage'], 50)
    
    def test_mark_lesson_completed(self):
        self.client.force_authenticate(user=self.student)
        progress = LessonProgress.objects.create(
            user=self.student,
            lesson=self.lesson1
        )
        
        response = self.client.post(f'/api/lesson-progress/{progress.id}/mark_completed/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['watch_percentage'], 100)
    
    def test_course_progress_updates_on_lesson_completion(self):
        """Test that course progress is updated when lessons are completed"""
        self.client.force_authenticate(user=self.student)
        
        # Create progress for lesson 1
        progress1 = LessonProgress.objects.create(user=self.student, lesson=self.lesson1)
        
        # Complete lesson 1
        response = self.client.post(f'/api/lesson-progress/{progress1.id}/mark_completed/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check course progress
        self.course_progress.refresh_from_db()
        self.assertEqual(self.course_progress.lessons_completed, 1)
        self.assertEqual(self.course_progress.completion_percentage, 50)
    
    def test_full_course_completion_calculation(self):
        """Test full course progress calculation with all lessons completed"""
        self.client.force_authenticate(user=self.student)
        
        # Create and complete lesson 1
        progress1 = LessonProgress.objects.create(user=self.student, lesson=self.lesson1)
        self.client.post(f'/api/lesson-progress/{progress1.id}/mark_completed/')
        
        # Create and complete lesson 2
        progress2 = LessonProgress.objects.create(user=self.student, lesson=self.lesson2)
        self.client.post(f'/api/lesson-progress/{progress2.id}/mark_completed/')
        
        # Check final course progress
        self.course_progress.refresh_from_db()
        self.assertEqual(self.course_progress.lessons_completed, 2)
        self.assertEqual(self.course_progress.completion_percentage, 100)
        self.assertTrue(self.course_progress.is_completed())


class PrerequisiteAPITestCase(APITestCase):
    """Test Prerequisite functionality"""
    
    def setUp(self):
        self.client = APIClient()
        self.student = User.objects.create_user(username='student', password='pass123')
        self.instructor = User.objects.create_user(username='instructor', password='pass123')
        self.staff = User.objects.create_user(username='staff', password='pass123', is_staff=True)
        
        # Create prerequisite course
        self.prereq_course = Course.objects.create(
            title='Prerequisite Course',
            description='Must complete first',
            instructor=self.instructor,
            status='published'
        )
        
        # Create main course
        self.main_course = Course.objects.create(
            title='Main Course',
            description='Requires prerequisite',
            instructor=self.instructor,
            status='published'
        )
        
        # Add prerequisite
        Prerequisite.objects.create(
            course=self.main_course,
            prerequisite_type='course',
            prerequisite_course=self.prereq_course
        )
    
    def test_cannot_enroll_without_prerequisite(self):
        """Test that user cannot enroll if prerequisite not met"""
        self.client.force_authenticate(user=self.student)
        response = self.client.post(f'/api/courses/{self.main_course.id}/enroll/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_can_enroll_with_prerequisite(self):
        """Test that user can enroll after completing prerequisite"""
        self.client.force_authenticate(user=self.student)
        
        # Complete prerequisite
        preq_progress = CourseProgress.objects.create(
            user=self.student,
            course=self.prereq_course,
            total_lessons=1,
            lessons_completed=1,
            completion_percentage=100
        )
        
        # Now should be able to enroll
        response = self.client.post(f'/api/courses/{self.main_course.id}/enroll/')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_prerequisites_met_endpoint(self):
        """Test the prerequisites-met endpoint"""
        self.client.force_authenticate(user=self.student)
        
        # Not met
        response = self.client.get(f'/api/courses/{self.main_course.id}/prerequisites_met/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['all_met'])
        self.assertEqual(len(response.data['unmet_prerequisites']), 1)
        
        # Complete prerequisite
        CourseProgress.objects.create(
            user=self.student,
            course=self.prereq_course,
            total_lessons=1,
            lessons_completed=1,
            completion_percentage=100
        )
        
        # Now should be met
        response = self.client.get(f'/api/courses/{self.main_course.id}/prerequisites_met/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['all_met'])
        self.assertEqual(len(response.data['unmet_prerequisites']), 0)


class CourseProgressAPITestCase(APITestCase):
    """Test Course Progress API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.student = User.objects.create_user(username='student', password='pass123')
        self.instructor = User.objects.create_user(username='instructor', password='pass123')
        
        self.course = Course.objects.create(
            title='Python Course',
            description='Learn Python',
            instructor=self.instructor,
            status='published'
        )
        
        self.course_progress = CourseProgress.objects.create(
            user=self.student,
            course=self.course,
            total_lessons=5,
            lessons_completed=2
        )
    
    def test_list_course_progress(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.get('/api/course-progress/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_retrieve_course_progress(self):
        self.client.force_authenticate(user=self.student)
        self.course_progress.calculate_completion_percentage()
        self.course_progress.save()
        response = self.client.get(f'/api/course-progress/{self.course_progress.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['completion_percentage'], 40)
