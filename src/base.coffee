## Base Class
class Base
  config: {}

  on: (name, fn)->
    @config['on_' + name] = fn
    return this

  trigger: (name, args=null) ->
    @config['on_'+name].call(this, args) if @config['on_' + name]?
