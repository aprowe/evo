## Compositional Pattern Producing Network

class Cppn extends Network
  @node_fn: [
    evo.util.gaussian
    evo.util.sin
    (x,m,b)-> evo.util.tanh evo.util.linear(x,m,b)
  ]

  get_fn: (gene)->
    index = Math.round(Math.abs(gene)*Cppn.node_fn.length) % Cppn.node_fn.length
    return Cppn.node_fn[index]

  ## Gene Structure
  constructor: (genes, @config)->
    @node_fn = []
    copy = genes[..]

    for i in [0..@config.hidden_layers-1]
      @node_fn[i] = []
      for j in [0..@config.hidden_nodes-1]
        @node_fn[i].push @get_fn(copy.pop())


    @weights = copy[..]
    super @weights, @config

  calc: (input)->
    # input.push 0 while input.length < @config.input
    layer_size = @config.hidden_nodes

    copy = @weights[..]

    hidden_weights = []

    for k in [0..@config.hidden_layers-1]
      hidden_weights[k] = []
      for i in [0..@config.hidden_nodes-1]
        hidden_weights[k][i] = 0

    for x in input
      for i in [0..@config.hidden_nodes-1]
        hidden_weights[0][i] += x * copy.pop()

    for k in [0..@config.hidden_layers-2]
      for i in [0..@config.hidden_nodes-1]

        ## Threshold
        # hidden_weights[k][i] += copy.pop()

        ## Normalize
        hidden_weights[k][i] = @node_fn[k][i](hidden_weights[k][i], copy.pop(), copy.pop())

        continue unless k+1 < @config.hidden_layers
        for j in [0..@config.hidden_nodes-1]
          hidden_weights[k+1][j] += hidden_weights[k][i] * copy.pop()

    output = []
    for j in [0..@config.output_nodes-1]
      output[j] = 0
      for i in [0..@config.hidden_nodes-1]
        # fn = @node_fn[@config.hidden_layers-1][i]
        output[j] += hidden_weights[@config.hidden_layers-1][i] * copy.pop()

      output[j] = @output_fn output[j]

    return output
