from django.http.response import HttpResponse
from rest_framework.generics import ListAPIView
from django_comment_client.utils import JsonResponse

from openedx.core.djangoapps.content.course_overviews.models import CourseOverview
from openedx.core.lib.api.view_utils import view_auth_classes


@view_auth_classes(is_authenticated=False)
class CourseListView(ListAPIView):
    """
    The docs goes here.
    """

    queryset = CourseOverview.objects.values("id", "enrollment_end")

    def get(self, request, *args, **kwargs):
        """
        Return a dict of courses and their enrollments end dates.
        """
        courses_dict = {}
        for course in self.queryset.all():
            courses_dict[unicode(course["id"])] = str(course["enrollment_end"])
        return JsonResponse(data=courses_dict)
