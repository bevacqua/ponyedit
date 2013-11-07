'use strict';

module.exports = function (grunt) {
    grunt.initConfig({
        jshint: {
            src: ['src/**/*.js']
        },
        watch: {
            livereload: {
                options: {
                    livereload: true
                },
                files: [
                    'src/**/*.{html,css,js}'
                ]
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.registerTask('default', ['jshint', 'watch']);
};
