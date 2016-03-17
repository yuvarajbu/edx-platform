"""
Comprehensive Theming support for Django's collectstatic functionality.
See https://docs.djangoproject.com/en/1.8/ref/contrib/staticfiles/
"""
import posixpath
import os.path
from django.conf import settings
from django.utils._os import safe_join
from django.contrib.staticfiles.storage import StaticFilesStorage, CachedFilesMixin
from django.contrib.staticfiles.finders import find
from django.utils.six.moves.urllib.parse import (  # pylint: disable=no-name-in-module, import-error
    unquote, urlsplit,
)

from pipeline.storage import PipelineMixin

from openedx.core.djangoapps.theming.helpers import (
    get_base_theme_dir,
    get_project_root_name,
    get_current_site_theme_dir,
    get_themes,
)


class ThemeStorage(StaticFilesStorage):
    """
    Comprehensive theme aware Static files storage.
    """
    # prefix for file path, this prefix is added at the beginning of file path before saving static files during
    # collectstatic command.
    # e.g. having "edx.org" as prefix will cause files to be saved as "edx.org/images/logo.png"
    # instead of "images/logo.png"
    prefix = None

    def __init__(self, location=None, base_url=None, file_permissions_mode=None,
                 directory_permissions_mode=None, prefix=None):

        self.prefix = prefix
        super(ThemeStorage, self).__init__(
            location=location,
            base_url=base_url,
            file_permissions_mode=file_permissions_mode,
            directory_permissions_mode=directory_permissions_mode,
        )

    def url(self, name):
        """
        Returns url of the asset, themed url will be returned if the asset is themed otherwise default
        asset url will be returned.

        Args:
            name: name of the asset, e.g. 'images/logo.png'

        Returns:
            url of the asset, e.g. '/static/red-theme/images/logo.png' if current theme is red-theme and logo
            is provided by red-theme otherwise '/static/images/logo.png'
        """
        prefix = ''
        theme_dir = get_current_site_theme_dir()

        # get theme prefix from site address if if asset is accessed via a url
        if theme_dir:
            prefix = theme_dir

        # get theme prefix from storage class, if asset is accessed during collectstatic run
        elif self.prefix:
            prefix = self.prefix

        # join theme prefix with asset name if theme is applied and themed asset exists
        if prefix and self.themed(name, prefix):
            name = os.path.join(prefix, name)

        return super(ThemeStorage, self).url(name)

    def themed(self, name, theme):
        """
        Returns True if given asset override is provided by the given theme otherwise returns False.
        Args:
            name: asset name e.g. 'images/logo.png'
            theme: theme name e.g. 'red-theme', 'edx.org'

        Returns:
            True if given asset override is provided by the given theme otherwise returns False
        """
        # in debug mode check static asset from within the project directory
        if settings.DEBUG:
            themes_location = get_base_theme_dir()
            # Nothing can be themed if we don't have a theme location or required params.
            if not all((themes_location, theme, name)):
                return False

            themed_path = "/".join([
                themes_location,
                theme,
                get_project_root_name(),
                "static/"
            ])
            name = name[1:] if name.startswith("/") else name
            path = safe_join(themed_path, name)
            return os.path.exists(path)
        # in live mode check static asset in the static files dir defined by "STATIC_ROOT" setting
        else:
            return self.exists(os.path.join(theme, name))


class ComprehensiveThemingCachedFilesMixin(CachedFilesMixin):
    """
    Comprehensive theming aware CachedFilesMixin.
    """

    def url(self, name, force=False):
        """
        Returns themed url for the given asset.
        """
        theme_dir = get_current_site_theme_dir()
        if theme_dir and theme_dir not in name:
            # during server run, append theme name to the asset name if it is not already there
            # this is ensure that correct hash is created and default asset is not always
            # used to create hash of themed assets.
            name = os.path.join(theme_dir, name)
        parsed_name = urlsplit(unquote(name))
        clean_name = parsed_name.path.strip()
        asset_name = name
        if not self.exists(clean_name):
            # if themed asset does not exists then use default asset
            theme = name.split("/", 1)[0]
            # verify that themed asset was accessed
            if theme in [theme.theme_dir for theme in get_themes()]:
                asset_name = "/".join(name.split("/")[1:])

        return super(ComprehensiveThemingCachedFilesMixin, self).url(asset_name, force)

    def url_converter(self, name, template=None):
        """
        This is an override of url_converter from CachedFilesMixin.
        It just comments out two lines at the end of the method.

        The purpose of this override is to make converter method return absolute urls instead of relative urls.
        This behavior is necessary for theme overrides, as we get 404 on assets with relative urls on a themed site.
        """
        if template is None:
            template = self.default_template

        def converter(matchobj):
            """
            Converts the matched URL depending on the parent level (`..`)
            and returns the normalized and hashed URL using the url method
            of the storage.
            """
            matched, url = matchobj.groups()
            # Completely ignore http(s) prefixed URLs,
            # fragments and data-uri URLs
            if url.startswith(('#', 'http:', 'https:', 'data:', '//')):
                return matched
            name_parts = name.split(os.sep)
            # Using posix normpath here to remove duplicates
            url = posixpath.normpath(url)
            url_parts = url.split('/')
            parent_level, sub_level = url.count('..'), url.count('/')
            if url.startswith('/'):
                sub_level -= 1
                url_parts = url_parts[1:]
            if parent_level or not url.startswith('/'):
                start, end = parent_level + 1, parent_level
            else:
                if sub_level:
                    if sub_level == 1:
                        parent_level -= 1
                    start, end = parent_level, 1
                else:
                    start, end = 1, sub_level - 1
            joined_result = '/'.join(name_parts[:-start] + url_parts[end:])
            hashed_url = self.url(unquote(joined_result), force=True)

            # NOTE:
            # following two lines are commented out so that absolute urls are used instead of relative urls
            # to make themed assets work correctly.
            #
            # The lines are commented and not removed to make future django upgrade easier and
            # show exactly what is changed in this method override
            #
            # file_name = hashed_url.split('/')[-1:]
            # relative_url = '/'.join(url.split('/')[:-1] + file_name)

            # Return the hashed version to the file
            return template % unquote(hashed_url)

        return converter


class ThemePipelineMixin(PipelineMixin):
    """
    Mixin to make sure themed assets are also packaged and used along with non themed assets.
    if a source asset for a particular package is not present then the default asset is used.

    e.g. in the following package and for 'red-theme'
    'style-vendor': {
        'source_filenames': [
            'js/vendor/afontgarde/afontgarde.css',
            'css/vendor/font-awesome.css',
            'css/vendor/jquery.qtip.min.css',
            'css/vendor/responsive-carousel/responsive-carousel.css',
            'css/vendor/responsive-carousel/responsive-carousel.slide.css',
        ],
        'output_filename': 'css/lms-style-vendor.css'
    }
    'red-theme/css/vendor/responsive-carousel/responsive-carousel.css' will be used of it exists otherwise
    'css/vendor/responsive-carousel/responsive-carousel.css' will be used to create 'red-theme/css/lms-style-vendor.css'
    """
    packing = True

    def post_process(self, paths, dry_run=False, **options):
        """
        This post_process hook is used to package all themed assets.
        """
        if dry_run:
            return
        themes = get_themes()

        for theme in themes:
            css_packages = self.get_themed_packages(theme.theme_dir, settings.PIPELINE_CSS)
            js_packages = self.get_themed_packages(theme.theme_dir, settings.PIPELINE_JS)

            from pipeline.packager import Packager
            packager = Packager(storage=self, css_packages=css_packages, js_packages=js_packages)
            for package_name in packager.packages['css']:
                package = packager.package_for('css', package_name)
                output_file = package.output_filename
                if self.packing:
                    packager.pack_stylesheets(package)
                paths[output_file] = (self, output_file)
                yield output_file, output_file, True
            for package_name in packager.packages['js']:
                package = packager.package_for('js', package_name)
                output_file = package.output_filename
                if self.packing:
                    packager.pack_javascripts(package)
                paths[output_file] = (self, output_file)
                yield output_file, output_file, True

        super_class = super(ThemePipelineMixin, self)
        if hasattr(super_class, 'post_process'):
            for name, hashed_name, processed in super_class.post_process(paths.copy(), dry_run, **options):
                yield name, hashed_name, processed

    @staticmethod
    def get_themed_packages(prefix, packages):
        """
        Update paths with the themed assets,
        Args:
            prefix: theme prefix for which to update asset paths e.g. 'red-theme', 'edx.org' etc.
            packages: packages to update

        Returns: list of updated paths and a boolean indicating whether any path was path or not

        """
        themed_packages = {}
        for name in packages:
            # collect source file names for the package
            source_files = []
            for path in packages[name].get('source_filenames', []):
                # if themed asset exists use that, otherwise use default asset.
                if find(os.path.join(prefix, path)):
                    source_files.append(os.path.join(prefix, path))
                else:
                    source_files.append(path)

            themed_packages[name] = {
                'output_filename': os.path.join(prefix, packages[name].get('output_filename', '')),
                'source_filenames': source_files,
            }
        return themed_packages
