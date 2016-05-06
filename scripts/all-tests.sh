#!/usr/bin/env bash
set -e

###############################################################################
#
#   all-tests.sh
#
#   Execute tests for edx-platform. This script is designed to be the
#   entry point for various CI systems.
#
###############################################################################

# Violations thresholds for failing the build
export PYLINT_THRESHOLD=4175
export JSHINT_THRESHOLD=7550
export SAFELINT_THRESHOLDS='
    {
        "rules": {
            "javascript-concat-html": 313,
            "javascript-escape": 7,
            "javascript-interpolate": 71,
            "javascript-jquery-append": 120,
            "javascript-jquery-html": 311,
            "javascript-jquery-insert-into-target": 26,
            "javascript-jquery-insertion": 31,
            "javascript-jquery-prepend": 12,
            "mako-html-entities": 0,
            "mako-invalid-html-filter": 35,
            "mako-invalid-js-filter": 250,
            "mako-js-html-string": 0,
            "mako-js-missing-quotes": 0,
            "mako-missing-default": 249,
            "mako-multiple-page-tags": 0,
            "mako-unknown-context": 0,
            "mako-unparseable-expression": 0,
            "mako-unwanted-html-filter": 0,
            "python-close-before-format": 0,
            "python-concat-html": 28,
            "python-custom-escape": 13,
            "python-deprecated-display-name": 53,
            "python-interpolate-html": 68,
            "python-parse-error": 0,
            "python-requires-html-or-text": 0,
            "python-wrap-html": 289,
            "underscore-not-escaped": 709
        },
        "total": 2565
    }'
export SAFELINT_THRESHOLDS=${SAFELINT_THRESHOLDS//[[:space:]]/}

doCheckVars() {
    if [ -n "$CIRCLECI" ] ; then
        SCRIPT_TO_RUN=scripts/circle-ci-tests.sh

    elif [ -n "$JENKINS_HOME" ] ; then
        source scripts/jenkins-common.sh
        SCRIPT_TO_RUN=scripts/generic-ci-tests.sh
    fi
}

# Determine the CI system for the environment
doCheckVars

# Run appropriate CI system script
if [ -n "$SCRIPT_TO_RUN" ] ; then
    $SCRIPT_TO_RUN

    # Exit with the exit code of the called script
    exit $?
else
    echo "ERROR. Could not detect continuous integration system."
    exit 1
fi
