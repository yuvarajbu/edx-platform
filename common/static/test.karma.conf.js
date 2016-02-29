// Common JavaScript tests, using RequireJS.
//
//
// To run all the tests and print results to the console:
//
//   karma start common/static/test.karma.conf.js
//
//
// To run the tests for debugging: Debugging can be done in any browser but Chrome's developer console is best.
//
//   karma start common/static/test.karma.conf.js --browsers=BROWSER --single-run=false
//
//
// To run the tests with coverage and junit reports:
//
//   karma start common/static/test.karma.conf.js --browsers=BROWSER --coverage --junitreportpath=<xunit_report_path> --coveragereportpath=<report_path>
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
        frameworks: ['jasmine'],


        // list of files / patterns to load in the browser
        files: [
            // include vendor files
            'js/vendor/jquery.min.js',
            'js/vendor/jquery.leanModal.js',
            'js/vendor/jasmine-jquery.js',
            'js/vendor/jasmine-imagediff.js',
            'js/vendor/jquery.truncate.js',
            'js/vendor/mustache.js',
            'js/vendor/underscore-min.js',
            'js/vendor/underscore.string.min.js',
            'js/vendor/backbone-min.js',
            'js/vendor/jquery.timeago.js',
            'js/vendor/URI.min.js',
            'coffee/src/ajax_prefix.js',
            'js/test/add_ajax_prefix.js',
            'js/test/i18n.js',
            'coffee/src/jquery.immediateDescendents.js',

            // include src js
            //- js/xblock
            //- js/src
            //- coffee/src
            //- js/capa/src

            { pattern: 'js/xblock/**/*.js', included: true },
            { pattern: 'js/src/**/*.js', included: true },
            { pattern: 'coffee/src/**/*.js', included: true },
            { pattern: 'js/capa/src/**/*.js', included: true },

            // include spec js
            //- coffee/spec
            //- js/spec
            //- js/capa/spec

            { pattern: 'coffee/spec/**/*.js', included: true },
            { pattern: 'js/spec/**/*.js', included: true },
            { pattern: 'js/capa/spec/**/*.js', included: true },

            // include fixtures
            //- js/fixtures
            //- js/capa/fixtures
            //- common/templates

            { pattern: 'js/fixtures/**/*.html', included: false },
            { pattern: 'js/capa/fixtures/**/*.html', included: false },
            { pattern: 'common/templates/**/*.underscore', included: false },

            'test_config.js'
        ],


        // list of files to exclude
        exclude: [
        ],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'js/xblock/**/*.js': ['coverage'],
            'js/src/**/*.js': ['coverage'],
            'coffee/src/**/*.js': ['coverage'],
            'js/capa/src/**/*.js': ['coverage']
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
