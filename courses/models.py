from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone


class Course(models.Model):
    """Model for courses with video integration"""
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    ]
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    instructor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='courses_taught')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    thumbnail_url = models.URLField(blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title


class Module(models.Model):
    """Model for course modules/chapters"""
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='modules')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order', 'created_at']
        unique_together = ('course', 'order')
    
    def __str__(self):
        return f"{self.course.title} - {self.title}"


class Prerequisite(models.Model):
    """Model for course prerequisites"""
    PREREQUISITE_TYPES = [
        ('course', 'Complete Course'),
        ('module', 'Complete Module'),
        ('lesson', 'Complete Lesson'),
    ]
    
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='prerequisites')
    prerequisite_type = models.CharField(max_length=20, choices=PREREQUISITE_TYPES)
    prerequisite_course = models.ForeignKey(
        Course, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='required_for_courses'
    )
    prerequisite_module = models.ForeignKey(
        Module,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='required_for_courses'
    )
    prerequisite_lesson = models.ForeignKey(
        'Lesson',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='required_for_courses'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('course', 'prerequisite_type', 'prerequisite_course', 'prerequisite_module', 'prerequisite_lesson')
    
    def __str__(self):
        return f"{self.course.title} requires {self.prerequisite_type}"


class Lesson(models.Model):
    """Model for course lessons"""
    LESSON_TYPES = [
        ('video', 'Video'),
        ('text', 'Text'),
        ('quiz', 'Quiz'),
    ]
    
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    order = models.IntegerField(default=0)
    lesson_type = models.CharField(max_length=20, choices=LESSON_TYPES, default='video')
    
    # Video related fields
    video_url = models.URLField(blank=True, null=True)
    video_duration = models.IntegerField(default=0, help_text='Duration in seconds')
    
    # Text content
    content = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order', 'created_at']
        unique_together = ('module', 'order')
    
    def __str__(self):
        return f"{self.module.title} - {self.title}"


class Enrollment(models.Model):
    """Model for user enrollment in courses"""
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('dropped', 'Dropped'),
        ('paused', 'Paused'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='course_enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ('user', 'course')
        ordering = ['-enrolled_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.course.title}"


class LessonProgress(models.Model):
    """Model for tracking lesson progress"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='lesson_progress')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='progress')
    
    # Progress tracking
    is_viewed = models.BooleanField(default=False)
    watch_duration = models.IntegerField(default=0, help_text='Watch duration in seconds')
    watch_percentage = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    
    # Timestamps
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    last_accessed_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('user', 'lesson')
        ordering = ['-last_accessed_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.lesson.title}"
    
    def is_completed(self):
        """Check if lesson is completed (watched 100%)"""
        return self.watch_percentage >= 100


class CourseProgress(models.Model):
    """Model for tracking overall course progress"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='course_progress')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='progress')
    
    # Progress calculations
    lessons_completed = models.IntegerField(default=0)
    total_lessons = models.IntegerField(default=0)
    completion_percentage = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    
    # Timestamps
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    last_accessed_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('user', 'course')
        ordering = ['-last_accessed_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.course.title}: {self.completion_percentage}%"
    
    def calculate_completion_percentage(self):
        """Calculate and update completion percentage"""
        if self.total_lessons == 0:
            self.completion_percentage = 0
        else:
            self.completion_percentage = int((self.lessons_completed / self.total_lessons) * 100)
        return self.completion_percentage
    
    def is_completed(self):
        """Check if course is completed"""
        return self.completion_percentage >= 100
