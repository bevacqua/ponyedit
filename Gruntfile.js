'use strict';

module.exports = function (grunt) {
    grunt.initConfig({
        jshint: {
            options: {
                reporter: require('jshint-stylish')
            },
            src: ['src/ponyedit.js']
        },
        csslint: {
            src: {
                src: ['src/ponyedit.css']
            }
        },
        clean: {
            statics: ['web/statics']
        },
        uglify: {
            src: {
                files: {
                    'src/ponyedit.min.js': ['src/ponyedit.js'],
                    'web/statics/js/example.min.js': ['web/assets/js/**/*.js']
                }
            },
            bower: {
                files: {
                    'web/statics/js/eventemitter2.min.js': [
                        'bower_components/eventemitter2/lib/eventemitter2.js'
                    ]
                }
            }
        },
        cssmin: {
            src: {
                files: {
                    'src/ponyedit.min.css': ['src/ponyedit.css'],
                    'web/statics/css/example.min.css': ['web/assets/css/**/*.css']
                }
            }
        },
        copy: {
            src: {
                files: {
                    'web/statics/js/ponyedit.min.js': 'src/ponyedit.min.js',
                    'web/statics/css/ponyedit.min.css': 'src/ponyedit.min.css'
                }
            }
        },
        watch: {
            livereload: {
                options: {
                    livereload: true
                },
                files: [
                    'web/**/*.{jade,css,js}'
                ]
            }
        },
        bump: {
            options: {
                updateFiles: [
                    'package.json',
                    'bower.json'
                ],
                commitFiles: [
                    'package.json',
                    'bower.json',
                    'src/ponyedit.min.css',
                    'src/ponyedit.min.js'
                ],
                pushTo: 'origin' // push to heroku separately
            }
        }
    });
    grunt.loadNpmTasks('grunt-bump');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-csslint');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.registerTask('lint', ['jshint', 'csslint']);
    grunt.registerTask('default', ['lint']);
    grunt.registerTask('build', ['lint', 'clean', 'uglify', 'cssmin', 'copy']);
    grunt.registerTask('deploy', ['build', 'bump']);
    grunt.registerTask('heroku', ['build']);
};
