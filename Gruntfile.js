'use strict';

module.exports = function (grunt) {
    grunt.initConfig({
        jshint: {
            options: {
                reporter: require('jshint-stylish')
            },
            src: ['src/ponyedit.js'],
            examples: ['web/assets/js/**/*.js']
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
                    'web/statics/js/example.min.js': ['web/assets/js/example.js'],
                    'web/statics/js/example.angular.min.js': ['web/assets/js/example.angular.js']
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
                    'web/statics/css/example.min.css': ['web/assets/css/example.css']
                }
            }
        },
        copy: {
            src: {
                files: {
                    'web/statics/js/angular.min.js': 'bower_components/angular/angular.min.js',
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
                files: [
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
        },
        shell: {
            'npm-publish': {
                command: 'npm publish'
            },
            'heroku-push': {
                command: 'git push heroku master'
            }
        }
    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('lint', ['jshint', 'csslint']);
    grunt.registerTask('default', ['lint']);
    grunt.registerTask('build', ['lint', 'clean', 'uglify', 'cssmin', 'copy']);
    grunt.registerTask('deploy', ['build', 'bump', 'shell:npm-publish', 'shell:heroku-push']);
    grunt.registerTask('heroku', ['build']);
};
