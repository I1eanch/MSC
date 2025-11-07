from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Course, Module, Lesson, Enrollment, LessonProgress, 
    CourseProgress, Prerequisite
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']
        read_only_fields = ['id']


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = [
            'id', 'module', 'title', 'description', 'order', 'lesson_type',
            'video_url', 'video_duration', 'content', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ModuleSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    
    class Meta:
        model = Module
        fields = ['id', 'course', 'title', 'description', 'order', 'lessons', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class PrerequisiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prerequisite
        fields = [
            'id', 'course', 'prerequisite_type', 'prerequisite_course',
            'prerequisite_module', 'prerequisite_lesson', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class CourseListSerializer(serializers.ModelSerializer):
    instructor = UserSerializer(read_only=True)
    
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'instructor', 'status', 'thumbnail_url', 'created_at']
        read_only_fields = ['id', 'created_at']


class CourseDetailSerializer(serializers.ModelSerializer):
    instructor = UserSerializer(read_only=True)
    modules = ModuleSerializer(many=True, read_only=True)
    prerequisites = PrerequisiteSerializer(many=True, read_only=True)
    
    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description', 'instructor', 'status', 
            'thumbnail_url', 'modules', 'prerequisites', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class LessonProgressSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    
    class Meta:
        model = LessonProgress
        fields = [
            'id', 'user', 'lesson', 'lesson_title', 'is_viewed', 
            'watch_duration', 'watch_percentage', 'started_at', 
            'completed_at', 'last_accessed_at'
        ]
        read_only_fields = ['id', 'user', 'started_at', 'completed_at', 'last_accessed_at']


class CourseProgressSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    
    class Meta:
        model = CourseProgress
        fields = [
            'id', 'user', 'course', 'course_title', 'lessons_completed',
            'total_lessons', 'completion_percentage', 'started_at',
            'completed_at', 'last_accessed_at'
        ]
        read_only_fields = ['id', 'user', 'started_at', 'completed_at', 'last_accessed_at']


class EnrollmentSerializer(serializers.ModelSerializer):
    course = CourseListSerializer(read_only=True)
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Enrollment
        fields = [
            'id', 'user', 'course', 'status', 'enrolled_at',
            'started_at', 'completed_at'
        ]
        read_only_fields = ['id', 'enrolled_at', 'started_at', 'completed_at']


class EnrollmentDetailSerializer(serializers.ModelSerializer):
    course = CourseDetailSerializer(read_only=True)
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Enrollment
        fields = [
            'id', 'user', 'course', 'status', 'enrolled_at',
            'started_at', 'completed_at'
        ]
        read_only_fields = ['id', 'enrolled_at', 'started_at', 'completed_at']
