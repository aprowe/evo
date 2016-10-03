banner =  '/**\n'
banner += ' * evo.js v<%= pkg.version %>\n'
banner += ' * <%= pkg.description %>\n'
banner += ' * Copyright (c) 2016 Alex Rowe <aprowe@ucsc.edu>\n'
banner += ' * Licensed MIT\n'
banner += ' **/\n'

coffeebanner =  '##\n'
coffeebanner += '# evo.js v<%= pkg.version %>\n'
coffeebanner += '# <%= pkg.description %>\n'
coffeebanner += '# Copyright (c) 2016 Alex Rowe <aprowe@ucsc.edu>\n'
coffeebanner += '# Licensed MIT\n'
coffeebanner += '##\n'

module.exports = (grunt)->
  grunt.initConfig
    pkg: grunt.file.readJSON 'package.json'
    watch:
     concat:
      tasks: ['concat', 'coffee']
      files: ['src/*.coffee']

    concat:
     default:
      options:
       banner: coffeebanner
       process: (src, filepath) ->
        if filepath != 'src/head.coffee' && filepath != 'src/tail.coffee'
         lines = []
         src.split('\n').forEach (line) ->
          lines.push( (if line.length > 0 then '  ' else '') + line)
         src = lines.join('\n')
         src[src.length-1] = '\n'if src[src.length-1] != '\n'
        return src
      src: [
       'src/head.coffee',
       'src/api.coffee',
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

     banner:
      options:
       banner: banner
      files:
       'evo.min.js': 'evo.min.js'
       'evo.js': 'evo.js'

    coffee:
     default:
      files:
       'evo.js': 'evo.coffee'
     test:
      files:
       'specs/spec.js': 'specs/*.coffee'

    uglify:
     default:
      files:
       'evo.min.js': 'evo.js'

    jasmine:
     src: 'evo.js'
     options:
      specs: 'specs/*.js'

    execute:
     test:
      src: ['examples/*.js']

  grunt.loadNpmTasks('grunt-contrib-coffee')
  grunt.loadNpmTasks('grunt-contrib-concat')
  grunt.loadNpmTasks('grunt-contrib-uglify')
  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-execute')
  grunt.loadNpmTasks('grunt-contrib-jasmine')

  grunt.registerTask 'test', ['coffee:test', 'jasmine'] #'execute']
  grunt.registerTask 'compile', ['concat:default', 'coffee:default', 'uglify', 'concat:banner']
  grunt.registerTask 'default', ['compile', 'test']
