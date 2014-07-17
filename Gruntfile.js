module.exports = function (grunt) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // configurable paths
    var pathConfig = {
        app : 'app',
        dist : 'dist',
        tmp : '.tmp'
    };

    grunt.initConfig({
        paths : pathConfig,
        watch : {
            test : {
                files : [
                    '**/*.js',
                    '!node_modules/**/*.*',
                ],
                tasks : ['jshint:test', 'mochaTest:test']
            }
        },
        open: {
            server : {
                path : 'http://127.0.0.1:8889/debug?port=5859',
                app : 'Google Chrome Canary'
            }
        },
        clean : {
            dist : ['<%= paths.dist %>']
        },
        bump : {
            options : {
                files : ['package.json', '<%= paths.app %>/manifest.json', 'bower.json'],
                updateConfigs : [],
                commit : true,
                commitMessage : 'Release v%VERSION%',
                commitFiles : ['-a'],
                createTag : true,
                tagName : 'v%VERSION%',
                tagMessage : 'Version %VERSION%',
                push : false
            }
        },
        nodemon : {
            dev : {
                script : 'app.js',
                options : {
                    nodeArgs : ['--debug=5859'],
                    env : {
                        PORT : '1337'
                    }
                }
            }
        },
        concurrent : {
            server : {
                tasks : ['nodemon:dev', 'node-inspector', 'open'],
                options : {
                    logConcurrentOutput: true
                }
            }
        },
        'node-inspector' : {
            custom : {
                options : {
                    'web-port' : 8889,
                    'web-host' : 'localhost',
                    'debug-port' : 5859,
                    'save-live-edit' : true,
                    'stack-trace-limit' : 4
                }
            }
        },
        mochaTest : {
            test : {
                options : {
                    reporter : 'spec'
                },
                src : ['test/**/*.js']
            }
        },
        jshint : {
            options : {
                jshintrc : '.jshintrc',
                ignores : ['**/node_modules/**/*.js']
            },
            test : ['**/*.js']
        },
        copy : {
            production : {
                files : [{
                    expand : true,
                    dest : '<%= paths.dist %>',
                    src : [
                        '**/*',
                        '!.git/*',
                        '!.domino*',
                        '!.editorconfig',
                        '!.git*',
                        '!.travis.yml',
                        '!.jshintrc',
                        '!Gruntfile.js',
                    ]
                }]
            }
        }
    });

    grunt.registerTask('miao', function () {

        grunt.log.write('grunt.log.write');
        grunt.verbose.write('grunt.verbose.write');
        grunt.log.writeln('grunt.log.writeln');
        grunt.verbose.writeln('grunt.verbose.writeln');


        grunt.log.error('grunt.log.error');
        grunt.log.error();
        grunt.log.ok('grunt.log.ok');
        grunt.log.subhead('grunt.log.subhead');
    });

    grunt.registerTask('server', [
        'concurrent:server'
    ]);

    grunt.registerTask('server:test', [
        'watch'
    ]);

    grunt.registerTask('test:travis', [
        'jshint:test',
        'mochaTest:test'
    ]);

    grunt.registerTask('build:production', [
        'clean:dist',
        'copy:production'
    ]);

    grunt.registerTask('build:staging', [
        'clean:dist',
        'copy:production'
    ]);

    grunt.registerTask(['update'], [
        'bump-only:patch',
        'changelog',
        'bump-commit'
    ]);

    grunt.registerTask('default', []);
};
