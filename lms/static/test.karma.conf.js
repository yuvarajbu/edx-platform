// Common JavaScript tests, using RequireJS.
//
//
// To run all the tests and print results to the console:
//
//   karma start common/static/test.requirejs.karma.conf.js
//
//
// To run the tests for debugging:
//
//   karma start common/static/test.requirejs.karma.conf.js --browsers=BROWSER --single-run=false
//
//
// To run the tests with coverage and junit reports:
//
//   karma start common/static/test.requirejs.karma.conf.js --browsers=BROWSER --reporters=coverage,junit
//
// where `BROWSER` could be Chrome or Firefox.
//
//

/**
 * Customize the name attribute in xml testcase element
 * @param {Object} browser
 * @param {Object} result
 * @return {String}
 */
function junitNameFormatter(browser, result) {
    return result.suite[0] + ": " + result.description;
}


/**
 * Customize the classname attribute in xml testcase element
 * @param {Object} browser
 * @param {Object} result
 * @return {String}
 */
function junitClassNameFormatter(browser, result) {
    return "Javascript." + browser.name.split(" ")[0];
}


/**
 * Return array containing default and user supplied reporters
 * @param {Object} config
 * @return {Array}
 */
function reporters(config) {
    var defaultReporters = ['dots', 'junit'];
    if (config.coverage) {
        defaultReporters.push('coverage')
    }
    return defaultReporters;
}


/**
 * Split a filepath into basepath and filename
 * @param {String} filepath
 * @return {Object}
 */
function getBasepathAndFilename(filepath) {
    if(!filepath) {
        // these will configure the reporters to create report files relative to this karma config file
        return {
            dir: undefined,
            file: undefined
        };
    }

    var file = filepath.replace(/^.*[\\\/]/, ''),
        dir = filepath.replace(file, '');

    return {
        dir: dir,
        file: file
    }
}


/**
 * Return coverage reporter settings
 * @param {String} config
 * @return {Object}
 */
function coverageSettings(config) {
    var path = getBasepathAndFilename(config.coveragereportpath);
    return {
        dir: path.dir,
        subdir: '.',
        reporters:[
            {type: 'cobertura', file: path.file},
            {type: 'text-summary'}
        ]
    };
}


/**
 * Return junit reporter settings
 * @param {String} config
 * @return {Object}
 */
function junitSettings(config) {
    var path = getBasepathAndFilename(config.junitreportpath);
    return {
        outputDir: path.dir,
        outputFile: path.file,
        suite: 'javascript', // suite will become the package name attribute in xml testsuite element
        useBrowserName: false,
        nameFormatter: junitNameFormatter,
        classNameFormatter: junitClassNameFormatter
    };
}


module.exports = function(config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine', 'requirejs'],


        // list of files / patterns to load in the browser
        files: [
            // include vendor/lib js files but don't add a <script> tag for each
            //{ pattern: '../../common/static/js/+(test|vendor|src|xblock)/**/*.js', included: false },
            //{ pattern: '../../common/static/js/vendor/jasmine-jquery.js ', included: false },
            { pattern: 'xmodule_js/common_static/js/vendor/jquery.min.js ', included: false },
            { pattern: 'xmodule_js/common_static/js/vendor/jasmine-imagediff.js', included: false },
            { pattern: 'xmodule_js/common_static/js/vendor/requirejs/text.js ', included: false },
            { pattern: 'xmodule_js/common_static/js/vendor/jquery-ui.min.js', included: false },
            { pattern: 'xmodule_js/common_static/js/vendor/jquery.cookie.js', included: false },
            { pattern: 'xmodule_js/common_static/js/vendor/jquery.timeago.js ', included: false },
            { pattern: 'xmodule_js/common_static/js/vendor/flot/jquery.flot.js ', included: false },
            { pattern: 'xmodule_js/common_static/js/vendor/CodeMirror/codemirror.js', included: false },
            { pattern: 'xmodule_js/common_static/js/vendor/URI.min.js', included: false },
            { pattern: 'xmodule_js/common_static/js/vendor/jQuery-File-Upload/js/jquery.fileupload.js', included: false },
            { pattern: 'xmodule_js/common_static/js/vendor/jQuery-File-Upload/js/jquery.iframe-transport.js', included: false },
            { pattern: 'xmodule_js/common_static/js/vendor/url.min.js', included: false },
            { pattern: 'xmodule_js/common_static/js/vendor/sinon-1.17.0.js', included: false },
            { pattern: 'xmodule_js/common_static/js/vendor/underscore-min.js ', included: false },
            { pattern: 'xmodule_js/common_static/js/vendor/underscore.string.min.js', included: false },
            { pattern: 'xmodule_js/common_static/js/vendor/backbone-min.js ', included: false },
            { pattern: 'xmodule_js/common_static/js/vendor/backbone.paginator.min.js ', included: false },
            { pattern: 'xmodule_js/common_static/js/vendor/edxnotes/annotator-full.min.js', included: false },
            { pattern: 'xmodule_js/common_static/js/vendor/date.js ', included: false },
            { pattern: 'xmodule_js/common_static/js/vendor/moment.min.js ', included: false },
            { pattern: 'xmodule_js/common_static/js/vendor/moment-with-locales.min.js', included: false },
            { pattern: 'xmodule_js/common_static/js/vendor/slick.core.js ', included: false },
            { pattern: 'xmodule_js/common_static/js/vendor/slick.grid.js ', included: false },
            { pattern: 'xmodule_js/common_static/js/vendor/jquery.event.drag-2.2.js', included: false },
            { pattern: 'xmodule_js/common_static/js/test/i18n.js', included: false },
            { pattern: 'xmodule_js/common_static/js/src/**/*.js', included: false },
            { pattern: 'xmodule_js/common_static/js/xblock/**/*.js', included: false },
            { pattern: 'xmodule_js/common_static/coffee/src/ajax_prefix.js', included: false },
            { pattern: 'xmodule_js/common_static/coffee/src/jquery.immediateDescendents.js', included: false },
            { pattern: 'xmodule_js/common_static/coffee/src/xblock/**/*.js', included: false },
            { pattern: 'xmodule_js/common_static/common/js/utils/edx.utils.validate.js', included: false },
            // jasmine-jquery needs to be included in <script> tag so that helpers methods are available globally
            { pattern: 'xmodule_js/common_static/js/vendor/jasmine-jquery.js', included: true },
            // include more js
            { pattern: 'js/RequireJS-namespace-undefine.js', included: false },
            { pattern: 'coffee/src/instructor_dashboard/**/*.js', included: false },
            { pattern: 'xmodule_js/src/capa/**/*.js', included: false },
            { pattern: 'xmodule_js/src/video/**/*.js', included: false },
            { pattern: 'xmodule_js/src/xmodule.js', included: false },

            { pattern: 'http://cdn.mathjax.org/mathjax/2.5-latest/MathJax.js?config=TeX-MML-AM_HTMLorMML-full&delayStartupUntil=configured', included: false },



            //- js
            //- coffee/src

            //- common/js
            //- xmodule_js/common_static/coffee

            //- teams/js
            //- support/js

            // include every js
            { pattern: 'js/**/*.js', included: false },
            { pattern: 'coffee/src/**/*.js', included: false },

            { pattern: 'common/js/!(spec)/**/*.js', included: false },
            { pattern: 'xmodule_js/common_static/coffee/**/*.js', included: false },

            // include everything(.js, .underscore, .html)
            { pattern: 'teams/js/**/*.*', included: false },
            { pattern: 'support/js/**/*.*', included: false },

            //- js/spec
            //- teams/js/spec
            //- support/js/spec

            // include spec js
            //{ pattern: 'js/spec/**/*.js', included: false },
            //{ pattern: '../djangoapps/teams/static/teams/js/spec/**/*.js', included: false },
            //{ pattern: '../djangoapps/support/static/support/js/spec/**/*.js', included: false },


            //- js/fixtures
            //- js/fixtures/edxnotes
            //- js/fixtures/search
            //- js/fixtures/bookmarks

            //- templates/instructor/instructor_dashboard_2
            //- templates/dashboard
            //- templates/edxnotes
            //- templates/fields
            //- templates/student_account
            //- templates/student_profile
            //- templates/verify_student
            //- templates/file-upload.underscore
            //- templates/components/header
            //- templates/components/tabbed
            //- templates/components/card
            //- templates/financial-assistance/
            //- templates/search
            //- templates/discovery
            //- templates/bookmarks

            //- common/templates
            //- teams/templates
            //- support/templates


            // include fixtures
            { pattern: 'js/fixtures/**/*.*', included: false },

            //{ pattern: '../templates/**/*.*', included: false },
            { pattern: 'templates/instructor/instructor_dashboard_2/**/*.*', included: false },
            { pattern: 'templates/dashboard/**/*.*', included: false },
            { pattern: 'templates/edxnotes/**/*.*', included: false },

            { pattern: 'templates/fields/**/*.*', included: false },
            { pattern: 'templates/student_account/**/*.*', included: false },
            { pattern: 'templates/student_profile/**/*.*', included: false },
            { pattern: 'templates/verify_student/**/*.*', included: false },
            { pattern: 'templates/file-upload.underscore', included: false },
            { pattern: 'templates/components/header/**/*.*', included: false },
            { pattern: 'templates/components/tabbed/**/*.*', included: false },
            { pattern: 'templates/components/card/**/*.*', included: false },
            { pattern: 'templates/financial-assistance/**/*.*', included: false },
            { pattern: 'templates/search/**/*.*', included: false },
            { pattern: 'templates/discovery/**/*.*', included: false },
            { pattern: 'templates/bookmarks/**/*.*', included: false },


            { pattern: 'xmodule_js/common_static/common/templates/**/*.*', included: false },
            //{ pattern: '../djangoapps/teams/static/teams/templates/**/*.*', included: false },
            //{ pattern: '../djangoapps/support/static/support/templates/**/*.*', included: false },

            // include everything under common/js|templates but don't add a <script> tag for each
            //{ pattern: 'common/js/**/*.js', included: false },
            //{ pattern: 'common/templates/**/*.underscore', included: false },

            // include requirejs config for tests separately and add a <script> tag for it
            'js/spec/main.js'
        ],


        // list of files to exclude
        exclude: [
            //'common/js/spec/**/*.js',
            //'js/dashboard/track_events.js',
            //'js/spec/dashboard/track_events_spec.js'
        ],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
        },


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/
        //
        // karma-reporter
        reporters: reporters(config),


        coverageReporter: coverageSettings(config),


        junitReporter: junitSettings(config),


        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['Firefox'],


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity
    })
};
