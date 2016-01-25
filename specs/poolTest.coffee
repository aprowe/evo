n_genes = 10
size = 400

config =
  genes: n_genes
  size: size

  cross_rate: 0.10
  mutate_rate: 0.7
  mutate_amount: 1.85

  ratios:
    top:    0.1
    cross:  0.1
    mutate: 0.1
    fresh:  0.1
    meld:   0.1
    random: 0.1


describe 'Given a method to construct a member', ->
  pool = evo.pool config
  pool.on 'member', (genes)-> {a: 'a'}
  member = pool.nextMember()

  it 'will use that method to create a member', ->
    expect(member.a).toEqual('a')

  it 'will have an object named _evo within it', ->
    expect(member._evo).toBeDefined()
    expect(member._evo.genes).toBeDefined()
    expect(member._evo.score).toBeDefined()
    expect(member._evo.report).toBeDefined()

describe 'Given a method to run a simulation', ->

  it 'will stop after a certain amount if stopping number is supplied', ->
    pool = evo.pool config
    numberRun = 0
    pool.on 'run', -> numberRun++
    pool.run(10)
    expect(numberRun).toEqual(10)

  describe 'When a member constructor member is NOT supplied', ->
    it 'will run it with genes as a supplied parameter', ->
      pool = evo.pool config
      g = {}
      pool.on 'run', (genes)-> g=genes
      pool.run(10);
      expect(g.length).toEqual(n_genes)

 describe 'When a member constructor member is supplied', ->

   it 'runs with a new member as a supplied parameter', ->
     pool = evo.pool config
     g = {}
     pool.on 'member', (genes)-> g = {name:"testName"}
     pool.run(10)
     pool.on 'run', (genes)-> g=genes
     expect(g.name).toEqual("testName")

  describe 'When a stop method is provided', ->
    it 'stops when the function returns true', ->
      pool = evo.pool config
      m = 0
      pool.on 'run', ->  m++
      pool.run(-> m < 4)
      # pool.run(-> m < 5)
      expect(m).toBe(4)


describe 'When calling nextGenes', ->
  it 'will return a list of genes', ->
    pool = evo.pool config
    genes = pool.nextGenes()
    expect(genes.length).toEqual(n_genes)


describe 'Pool Population', ->
 	it "Creates The right number of genes", ->
    pool = evo.pool(config)
    pool.on 'run', ->0.5
    expect(pool.genes.length).toBe size

    pool.run(1)
    expect(pool.genes.length).toBe size-1

    pool.run(size)
    expect(pool.genes.length).toBe size

  it "Gene sets have the right number of genes", ->
    pool = evo.pool(config)
    expect(pool.genes[0].length).toBe n_genes



describe "When running a simulation", ->
  it "Keeps a history of previous averages", ->
    pool = evo.pool config
    pool.on "run", (genes)-> 0.5
    pool.run(size)
    expect(pool.average).toBe(0.5)
    expect(pool._history[0]).toBe(0.5)
    pool.run(size * 9)
    expect(pool._history.length).toBe(pool.generation)

  it "increments generation count after all members tested", ->
    pool = evo.pool config
    pool.on "run", (genes)-> 0.5

    expect(pool.generation).toBe(0)

    pool.run size
    expect(pool.generation).toBe(1)

    pool.run size+1 ## TODO Why is it like this
    expect(pool.generation).toBe(2)

    pool.run size+1
    expect(pool.generation).toBe(3)



describe "Run Configuration object", ->
  it "Will run a specific amount of iterations", ->
    pool = evo.pool config
    pool.on "run", ->0.5
    run_config =
      iterations: 1234

    pool.run run_config
    expect(pool.iteration).toBe(1234)

  it "will run a specific amount of generations", ->
    pool = evo.pool config
    pool.on "run", ->0.5
    run_config =
      generations: 111

    pool.run run_config
    expect(pool.generation).toBe(111)

  it "will stop when a specific max score is reached", ->
    pool = evo.pool config
    pool.on "run", (g)->g[0]
    run_config =
      score: 2.0

    pool.run run_config
    expect(pool.average).toBeGreaterThan(2.0)

  it "will stop when a while function returns false", ->
    pool = evo.pool config
    pool.on "run", (g)->g[0]

    i = 0
    run_config =
      while: -> i++ < 145

    pool.run run_config
    expect(i).toBe(146)

  it "will autodetect when score is optimized", ->
    pool = evo.pool config

    pool.on "run", (genes)->
      return -Math.abs(genes[0]);

    run_config =
      auto_stop: true
      generations: 100

    pool.run run_config
    expect(pool.average).toBeLessThan(0.1)

  it "will autodetect when score is not improving", ->
    pool = evo.pool config

    i = 0
    pool.on "run", (genes)->
      return i++

    run_config =
      auto_stop: true
      generations: 100

    pool.run run_config
    expect(pool.generation).toBe(100)

  it "Can call subsequent run calls for generations", ->
    pool = evo.pool config

    pool.on "run", (genes)->0.0

    run_config =
      generations: 100

    pool.run run_config
    expect(pool.generation).toBe(100)

    pool.run run_config
    expect(pool.generation).toBe(200)

  it "Can call subsequent run calls for iterations", ->
    pool = evo.pool config

    pool.on "run", (genes)->0.0

    run_config =
      iterations: 100

    pool.run run_config
    expect(pool.iteration).toBe(100)

    pool.run run_config
    expect(pool.iteration).toBe(200)
