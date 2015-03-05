module.exports = (grunt) ->

    grunt.initConfig
        watch:
            concat:
                tasks: ['concat', 'coffee']
                files: ['src/*.coffee']


        concat:
            default:
                options:
                    process: (src, filepath) ->
                        if filepath != 'src/head.coffee' && filepath != 'src/tail.coffee'
                            lines = []
                            src.split('\n').forEach (line) ->
                                lines.push( (if line.length > 0 then '    ' else '') + line)
                            src = lines.join('\n')
                            src[src.length-1] = '\n'if src[src.length-1] != '\n'
                        return src
                src: [
                    'src/head.coffee',
                    'src/config.coffee',
                    'src/util.coffee',
                    'src/base.coffee',
                    'src/pool.coffee',
                    'src/network.coffee',
                    'src/cppn.coffee',
                    'src/feedforward.coffee',
                    'src/tail.coffee'
                ]
                dest: 'evo.coffee'

        coffee:
            test:
                compile:
                    files:
                        'specs/spec.js': 'specs/*.coffee'
            build:
                compile:
                    files:
                        'evo.js': 'evo.coffee'

        uglify:
            files:
                'evo.min.js': 'evo.js'

        jasmine:
            src: 'evo.js'
            options: 
                specs: 'specs/*.js'
                

    grunt.loadNpmTasks('grunt-contrib-coffee')
    grunt.loadNpmTasks('grunt-contrib-concat')
    grunt.loadNpmTasks('grunt-contrib-uglify')
    grunt.loadNpmTasks('grunt-contrib-watch')
    grunt.loadNpmTasks('grunt-contrib-jasmine')


    grunt.registerTask 'test', ['coffee:test', 'jasmine']
    grunt.registerTask 'compile', ['concat', 'coffee:build', 'uglify']
    grunt.registerTask 'default', ['compile', 'test']
