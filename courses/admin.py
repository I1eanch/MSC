from django.contrib import admin
from .models import (
    Course, Module, Lesson, Enrollment, LessonProgress,
    CourseProgress, Prerequisite
)


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'instructor', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('title', 'description')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'order', 'created_at')
    list_filter = ('course', 'created_at')
    search_fields = ('title', 'description')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'module', 'lesson_type', 'order', 'created_at')
    list_filter = ('lesson_type', 'module__course', 'created_at')
    search_fields = ('title', 'description', 'content')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'status', 'enrolled_at')
    list_filter = ('status', 'enrolled_at')
    search_fields = ('user__username', 'course__title')
    readonly_fields = ('enrolled_at',)


@admin.register(LessonProgress)
class LessonProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'lesson', 'watch_percentage', 'is_viewed', 'completed_at')
    list_filter = ('is_viewed', 'completed_at')
    search_fields = ('user__username', 'lesson__title')
    readonly_fields = ('last_accessed_at',)


@admin.register(CourseProgress)
class CourseProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'completion_percentage', 'completed_at')
    list_filter = ('completion_percentage', 'completed_at')
    search_fields = ('user__username', 'course__title')
    readonly_fields = ('started_at', 'last_accessed_at')


@admin.register(Prerequisite)
class PrerequisiteAdmin(admin.ModelAdmin):
    list_display = ('course', 'prerequisite_type', 'created_at')
    list_filter = ('prerequisite_type', 'created_at')
    search_fields = ('course__title',)
    readonly_fields = ('created_at',)
