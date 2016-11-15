## Network Class

class Network
  constructor: (@weights, @config)->
    if typeof @config.output_fn == 'function'
      @output_fn = @config.output_fn

    else if @config.output_fn == 'linear'
      @output_fn = evo.util.linear

    else if @config.output_fn == 'step'
      @output_fn = evo.util.step

    else
      @output_fn = evo.util.tanh

  calc: (input)->
