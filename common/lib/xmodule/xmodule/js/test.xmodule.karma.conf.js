// Common JavaScript tests, using RequireJS.
//
//
// To run all the tests and print results to the console:
//
//   karma start common/lib/xmodule/xmodule/js/test.xmodule.karma.conf.js
//
//
// To run the tests for debugging: Debugging can be done in any browser but Chrome's developer console is best.
//
//   karma start common/lib/xmodule/xmodule/js/test.xmodule.karma.conf.js --browsers=BROWSER --single-run=false
//
//
// To run the tests with coverage and junit reports:
//
//   karma start common/lib/xmodule/xmodule/js/test.xmodule.karma.conf.js --browsers=BROWSER --coverage --junitreportpath=<xunit_report_path> --coveragereportpath=<report_path>
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

        client: {
            //captureConsole: false
        },

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],


        // list of files / patterns to load in the browser
        files: [
            // include vendor files
            'common_static/js/vendor/jquery.min.js',
            'common_static/js/vendor/jquery-ui.min.js',
            'common_static/js/vendor/jquery.ui.draggable.js',
            'common_static/js/vendor/jquery.cookie.js',
            'common_static/js/vendor/jasmine-jquery.js',
            'common_static/js/test/i18n.js',
            'common_static/coffee/src/ajax_prefix.js',
            'common_static/js/src/logger.js',
            'common_static/js/vendor/jasmine-imagediff.js',
            'common_static/js/vendor/require.js',
            'RequireJS-namespace-undefine.js',
            'common_static/js/vendor/json2.js',
            'common_static/js/vendor/underscore-min.js',
            'common_static/js/vendor/backbone-min.js',
            'common_static/js/vendor/jquery.leanModal.js',
            'common_static/js/vendor/CodeMirror/codemirror.js',
            'common_static/js/vendor/tinymce/js/tinymce/jquery.tinymce.min.js',
            'common_static/js/vendor/tinymce/js/tinymce/tinymce.full.min.js',
            'common_static/js/vendor/jquery.timeago.js',
            'common_static/js/vendor/sinon-1.17.0.js',
            'src/word_cloud/d3.min.js',
            'src/word_cloud/d3.layout.cloud.js',

            // no file exists with this name
            //'common_static/js/vendor/analytics.js',

            'common_static/js/test/add_ajax_prefix.js',
            'common_static/js/src/utility.js',
            'public/js/split_test_staff.js',
            'common_static/js/src/accessibility_tools.js',
            'common_static/js/vendor/moment.min.js',
            'spec/main_requirejs.js',

            'test_config.js',

            // include src js
            //- src/xmodule.js
            //- src

            { pattern: 'src/xmodule.js', included: true },
            { pattern: 'src/**/*.js', included: true },

            // include spec js
            // - spec/helper.js
            // - spec

            { pattern: 'spec/helper.js', included: true },
            { pattern: 'spec/**/*.js', included: true },

            // include fixtures
            //- fixtures

            { pattern: 'fixtures/**/*.*', included: false }
            //{ pattern: 'fixtures/**/*.underscore', included: false }
        ],


        // list of files to exclude
        exclude: [
            'spec/video/async_process_spec.js',
            //'spec/video/events_spec.js',
            //'spec/video/general_spec.js',
            'spec/video/html5_video_spec.js',
            'spec/video/initialize_spec.js',
            //'spec/video/iterator_spec.js',
            'spec/video/resizer_spec.js',
            'spec/video/sjson_spec.js',
            'spec/video/video_accessible_menu_spec.js',
            'spec/video/video_bumper_spec.js',
            'spec/video/video_caption_spec.js',
            'spec/video/video_context_menu_spec.js',
            'spec/video/video_control_spec.js',
            'spec/video/video_events_bumper_plugin_spec.js',
            'spec/video/video_events_plugin_spec.js',
            'spec/video/video_focus_grabber_spec.js',
            'spec/video/video_full_screen_spec.js',
            'spec/video/video_player_spec.js',
            'spec/video/video_play_pause_control_spec.js',
            'spec/video/video_play_placeholder_spec.js',
            'spec/video/video_play_skip_control_spec.js',
            'spec/video/video_poster_spec.js',
            'spec/video/video_progress_slider_spec.js',
            'spec/video/video_quality_control_spec.js',
            'spec/video/video_save_state_plugin_spec.js',
            'spec/video/video_skip_control_spec.js',
            'spec/video/video_speed_control_spec.js',
            'spec/video/video_storage_spec.js',
            'spec/video/video_volume_control_spec.js'
        ],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'src/**/*.js': ['coverage']
        },


        plugins: [
            'karma-chrome-launcher',
            'karma-coverage',
            'karma-firefox-launcher',
            'karma-jasmine',
            'karma-junit-reporter',
            'karma-spec-reporter'
        ],


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
