"""
Course API URLs
"""
from django.conf import settings
from django.conf.urls import patterns, url, include

from .views import CourseListView


urlpatterns = patterns(
    '',
    url(r'', CourseListView.as_view(), name="course-list"),
)
