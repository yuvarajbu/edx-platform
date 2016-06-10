"""
Tests of the populate_model management command.
"""

import textwrap
import os.path

from django.utils import timezone
from django.utils.six import BytesIO

from django.test import TestCase
from django.contrib.auth.models import User
from django.core.management.base import CommandError
from django.db import models

from config_models.management.commands import populate_model
from config_models.models import ConfigurationModel
from config_models.utils import deserialize_json


class ExampleDeserializeConfig(ConfigurationModel):
    """
    Test model for testing deserialization of ``ConfigurationModels`` with keyed configuration.
    """
    KEY_FIELDS = ('name',)

    name = models.TextField()
    int_field = models.IntegerField(default=10)

    def __unicode__(self):
        return "ExampleDeserializeConfig(enabled={}, name={}, int_field={})".format(
            self.enabled, self.name, self.int_field
        )


class DeserializeJSONTests(TestCase):
    """
    Tests of deserializing the JSON representation of ConfigurationModels.
    """
    def setUp(self):
        super(DeserializeJSONTests, self).setUp()
        self.test_username = 'test_worker'
        User.objects.create_user(username=self.test_username)

    def test_deserialize_models(self):
        """
        Tests the "happy path", where 2 instances of the test model should be created.
        A valid username is supplied for the operation.
        """
        start_date = timezone.now()
        fixture_path = os.path.join(os.path.dirname(__file__), 'data', 'data.json')
        with open(fixture_path) as data:
            deserialize_json(data, self.test_username)

        self.assertEquals(2, len(ExampleDeserializeConfig.objects.all()))

        betty = ExampleDeserializeConfig.current('betty')
        self.assertTrue(betty.enabled)
        self.assertEquals(5, betty.int_field)
        self.assertGreater(betty.change_date, start_date)
        self.assertEquals(self.test_username, betty.changed_by.username)

        fred = ExampleDeserializeConfig.current('fred')
        self.assertFalse(fred.enabled)
        self.assertEquals(10, fred.int_field)
        self.assertGreater(fred.change_date, start_date)
        self.assertEquals(self.test_username, fred.changed_by.username)

    def test_bad_username(self):
        """
        Tests the error handling when the specified user does not exist.
        """
        test_json = textwrap.dedent("""
            {
                "model": "config_models.exampledeserializeconfig",
                "data": [{"name": "dino"}]
            }
            """)
        with self.assertRaisesRegexp(Exception, "User matching query does not exist"):
            deserialize_json(BytesIO(test_json), "unknown_username")

    def test_invalid_json(self):
        """
        Tests the error handling when there is invalid JSON.
        """
        test_json = textwrap.dedent("""
            {
                "model": "config_models.exampledeserializeconfig",
                "data": [{"name": "dino"
            """)
        with self.assertRaisesRegexp(Exception, "JSON parse error"):
            deserialize_json(BytesIO(test_json), self.test_username)

    def test_invalid_model(self):
        """
        Tests the error handling when the configuration model specified does not exist.
        """
        test_json = textwrap.dedent("""
            {
                "model": "xxx.yyy",
                "data":[{"name": "dino"}]
            }
            """)
        with self.assertRaisesRegexp(Exception, "No installed app"):
            deserialize_json(BytesIO(test_json), self.test_username)


class PopulateModelTestCase(TestCase):
    """
    Tests of populate model management command.
    """
    def setUp(self):
        super(PopulateModelTestCase, self).setUp()
        self.file_path = os.path.join(os.path.dirname(__file__), 'data', 'data.json')
        self.test_username = 'test_management_worker'
        User.objects.create_user(username=self.test_username)

    def test_run_command(self):
        """
        Tests the "happy path", where 2 instances of the test model should be created.
        A valid username is supplied for the operation.
        """
        _run_command(file=self.file_path, username=self.test_username)
        self.assertEquals(2, len(ExampleDeserializeConfig.objects.all()))

        betty = ExampleDeserializeConfig.current('betty')
        self.assertEquals(self.test_username, betty.changed_by.username)

        fred = ExampleDeserializeConfig.current('fred')
        self.assertEquals(self.test_username, fred.changed_by.username)

    def test_no_user_specified(self):
        """
        Tests that a username must be specified.
        """
        with self.assertRaisesRegexp(CommandError, "A valid username must be specified"):
            _run_command(file=self.file_path)

    def test_bad_user_specified(self):
        """
        Tests that a username must be specified.
        """
        with self.assertRaisesRegexp(Exception, "User matching query does not exist"):
            _run_command(file=self.file_path, username="does_not_exist")

    def test_no_file_specified(self):
        """
        Tests the error handling when no JSON file is supplied.
        """
        with self.assertRaisesRegexp(CommandError, "A file containing JSON must be specified"):
            _run_command(username=self.test_username)

    def test_bad_file_specified(self):
        """
        Tests the error handling when the path to the JSON file is incorrect.
        """
        with self.assertRaisesRegexp(CommandError, "File does/not/exist.json does not exist"):
            _run_command(file="does/not/exist.json", username=self.test_username)


def _run_command(*args, **kwargs):
    """Run the management command to deserializer JSON ConfigurationModel data. """
    command = populate_model.Command()
    return command.handle(*args, **kwargs)
