
config =
  genes: 10
  size: 400

  cross_rate: 0.10
  mutate_rate: 0.7
  mutate_amount: 1.85

  ratios:
    top:    1.00
    cross:  0.33
    mutate: 2.00
    fresh:  0.20
    meld:   0.75
    random: 1.25

  on_member: (genes)->
    evo.network 'feedforward', genes,
      output_nodes: 1
      hidden_nodes: 2
      input_nodes: 2

scoreNet = (net)->
  score = 0
  score += net.calc([-1, -1]) > 0 ? 1 : 0
  score += net.calc([ 1,  1]) > 0 ? 1 : 0
  score += net.calc([ 1, -1]) < 0 ? 1 : 0
  score += net.calc([-1,  1]) < 0 ? 1 : 0
  return score


describe "Pool XOR Test", ->
  it "Trains a pool that can solve the XOR problem", ->

    pool = evo.pool config
    pool.on 'run', (spawn)->
      spawn._evo.score = scoreNet spawn

    # pool.run -> @average < 3.50 and @generation < 1000
    pool.run
      auto_stop: true
      generations: 100
      # score: 3.5

    expect(pool.average).toBeGreaterThan(3.5)
