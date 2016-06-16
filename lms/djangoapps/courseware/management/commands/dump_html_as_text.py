from django.core.management.base import BaseCommand
from xmodule.modulestore.django import modulestore
from xmodule.html_module import HtmlDescriptor
import lxml.html
import lxml.html.clean
import logging
import unicodecsv

log = logging.getLogger(__name__)

cleaner = lxml.html.clean.Cleaner(style=True, comments=True)

class Command(BaseCommand):

    def handle(self, *args, **options):
        modules = self.get_html_text()
        with open("/tmp/modules.csv", 'w') as csv_file:
            writer = unicodecsv.writer(csv_file)
            writer.writerows(modules)


    def get_html_text(self):
        html_modules = [["text", "location", "course_key"]]
        for course in modulestore().get_course_summaries():
            for item in modulestore().get_items(course.id):
                if isinstance(item, HtmlDescriptor):
                    try:
                        html_string = item.data
                        html_string = cleaner.clean_html(html_string)
                        document = lxml.html.document_fromstring(html_string)
                    except Exception as err:
                        pass

                    raw_text_content = document.text_content()\

                    text_content = raw_text_content.strip().replace('\n', ' ').replace('\r', '')

                    html_modules.append(
                        [text_content, unicode(item.location), unicode(item.location.course_key)]
                    )
        return html_modules


