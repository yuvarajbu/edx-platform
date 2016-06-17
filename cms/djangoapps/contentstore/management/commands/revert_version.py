"""
Script for reverting a draft version of a course.
"""
from django.core.management.base import BaseCommand, CommandError
from xmodule.modulestore import ModuleStoreEnum
from xmodule.modulestore.django import modulestore
from opaque_keys import InvalidKeyError
from opaque_keys.edx.keys import CourseKey
from .prompt import query_yes_no
from .utils import get_course_versions

# To run from command line: ./manage.py cms revert_version course-v1:org+course+run


class Command(BaseCommand):
    """Revert a draft version of a course"""
    help = '''
    Reverts a draft version of a course". Takes two arguments:
    <course_id>: the course id of the course you want to revert the draft version.
    --commit: do revert version.

    If you do not specify '--commit', the command will print out what changes would be made.
    '''

    def add_arguments(self, parser):
        parser.add_argument('course_key', help="ID of the Course to revert version")
        parser.add_argument('--commit', action='store_true', help="Pull updated metadata from external IDPs")

    def handle(self, *args, **options):
        """Execute the command"""

        try:
            course_key = CourseKey.from_string(options['course_key'])
        except InvalidKeyError:
            raise CommandError("Invalid course key.")

        if not modulestore().get_course(course_key):
            raise CommandError("Course not found.")

        # for now only support on split mongo
        owning_store = modulestore()._get_modulestore_for_courselike(course_key)  # pylint: disable=protected-access
        if hasattr(owning_store, 'revert_version'):
            draft_version = get_course_versions(options['course_key'])['draft-branch']
            print "Course draft version : {0}".format(draft_version)

            if query_yes_no("Are you sure to revert draft version of the {0} course?".format(course_key), default="no"):
                # revert a draft version
                reverted_draft_version = owning_store.revert_version(
                    course_key, ModuleStoreEnum.UserID.mgmt_command, options['commit']
                )
                if options['commit']:
                    print "Dry run. Following would have been changed : "
                    print "Draft branch version {0} changed to previous draft branch version {1}".format(
                        draft_version, reverted_draft_version
                    )
                elif reverted_draft_version:
                    print "Success! Reverted the draft branch of the '{0}' course.\n".format(course_key)
                    print "Updated course draft version : {0}".format(reverted_draft_version)
                else:
                    print "Error! Could not revert the draft version of {0} course.".format(course_key)
        else:
            raise CommandError("The owning modulestore does not support this command.")
