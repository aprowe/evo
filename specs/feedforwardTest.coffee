describe "Feed Forward Network", ->
  it "Solves the XOR problem", ->

    genes = [ 0.5,   1.0,
         0.5,   1.0,
         -0.3,    -1,
          0,     1 ]

    config =
      output_nodes: 1
      hidden_nodes: 2
      input_nodes: 2

    net = evo.network 'feedforward', genes, config

    p = [];
    p[0] = net.calc([ 1,  1]) > 0.5 ? 1 : 0
    p[1] = net.calc([ -1,-1]) > 0.5 ? 1 : 0
    p[2] = net.calc([ 0,  1]) > 0.5 ? 1 : 0
    p[3] = net.calc([ 1,  0]) > 0.5 ? 1 : 0

    target = [0,0,1,1];

    expect(v).toBe target[i] for v, i in target
