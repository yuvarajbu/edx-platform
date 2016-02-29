(function(requirejs) {
    requirejs.config({
        baseUrl: '/base/',
        paths: {
            "moment": "common_static/js/vendor/moment.min"
        },
        shim: {
            "moment": {
                exports: "moment"
            }
        }
    });

}).call(this, RequireJS.requirejs);
