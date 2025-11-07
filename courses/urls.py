from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CourseViewSet, EnrollmentViewSet, LessonProgressViewSet,
    CourseProgressViewSet, ModuleViewSet, LessonViewSet, PrerequisiteViewSet
)

router = DefaultRouter()
router.register(r'courses', CourseViewSet)
router.register(r'enrollments', EnrollmentViewSet, basename='enrollment')
router.register(r'lesson-progress', LessonProgressViewSet, basename='lesson-progress')
router.register(r'course-progress', CourseProgressViewSet, basename='course-progress')
router.register(r'modules', ModuleViewSet)
router.register(r'lessons', LessonViewSet)
router.register(r'prerequisites', PrerequisiteViewSet)

app_name = 'courses'

urlpatterns = [
    path('', include(router.urls)),
]
