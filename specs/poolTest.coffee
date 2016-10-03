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
  population = evo.population config
  population.on 'member', (genes)-> {a: 'a'}
  member = population.nextMember()

  it 'will use that method to create a member', ->
    expect(member.a).toEqual('a')

  it 'will have an object named _evo within it', ->
    expect(member._evo).toBeDefined()
    expect(member._evo.genes).toBeDefined()
    expect(member._evo.score).toBeDefined()
    expect(member._evo.report).toBeDefined()

describe 'Given a method to run a simulation', ->

  it 'will stop after a certain amount if stopping number is supplied', ->
    population = evo.population config
    numberRun = 0
    population.on 'run', -> numberRun++
    population.run(10)
    expect(numberRun).toEqual(10)

  describe 'When a member constructor member is NOT supplied', ->
    it 'will run it with genes as a supplied parameter', ->
      population = evo.population config
      g = {}
      population.on 'run', (genes)-> g=genes
      population.run(10);
      expect(g.length).toEqual(n_genes)

 describe 'When a member constructor member is supplied', ->

   it 'runs with a new member as a supplied parameter', ->
     population = evo.population config
     g = {}
     population.on 'member', (genes)-> g = {name:"testName"}
     population.run(10)
     population.on 'run', (genes)-> g=genes
     expect(g.name).toEqual("testName")

  describe 'When a stop method is provided', ->
    it 'stops when the function returns true', ->
      population = evo.population config
      m = 0
      population.on 'run', ->  m++
      population.run(-> m < 4)
      # population.run(-> m < 5)
      expect(m).toBe(4)


describe 'When calling nextGenes', ->
  it 'will return a list of genes', ->
    population = evo.population config
    genes = population.nextGenes()
    expect(genes.length).toEqual(n_genes)


describe 'Pool Population', ->
 	it "Creates The right number of genes", ->
    population = evo.population(config)
    population.on 'run', ->0.5
    expect(population.genes.length).toBe size

    population.run(1)
    expect(population.genes.length).toBe size-1

    population.run(size)
    expect(population.genes.length).toBe size

  it "Gene sets have the right number of genes", ->
    population = evo.population(config)
    expect(population.genes[0].length).toBe n_genes



describe "When running a simulation", ->
  it "Keeps a history of previous averages", ->
    population = evo.population config
    population.on "run", (genes)-> 0.5
    population.run(size)
    expect(population.average).toBe(0.5)
    expect(population._history[0]).toBe(0.5)
    population.run(size * 9)
    expect(population._history.length).toBe(population.generation)

  it "increments generation count after all members tested", ->
    population = evo.population config
    population.on "run", (genes)-> 0.5

    expect(population.generation).toBe(0)

    population.run size
    expect(population.generation).toBe(1)

    population.run size+1 ## TODO Why is it like this
    expect(population.generation).toBe(2)

    population.run size+1
    expect(population.generation).toBe(3)



describe "Run Configuration object", ->
  it "Will run a specific amount of iterations", ->
    population = evo.population config
    population.on "run", ->0.5
    run_config =
      iterations: 1234

    population.run run_config
    expect(population.iteration).toBe(1234)

  it "will run a specific amount of generations", ->
    population = evo.population config
    population.on "run", ->0.5
    run_config =
      generations: 111

    population.run run_config
    expect(population.generation).toBe(111)

  it "will stop when a specific max score is reached", ->
    population = evo.population config
    population.on "run", (g)->g[0]
    run_config =
      score: 2.0

    population.run run_config
    expect(population.average).toBeGreaterThan(2.0)

  it "will stop when a while function returns false", ->
    population = evo.population config
    population.on "run", (g)->g[0]

    i = 0
    run_config =
      while: -> i++ < 145

    population.run run_config
    expect(i).toBe(146)

  it "will autodetect when score is optimized", ->
    population = evo.population config

    population.on "run", (genes)->
      return -Math.abs(genes[0]);

    run_config =
      auto_stop: true
      generations: 100

    population.run run_config
    expect(population.average).toBeLessThan(0.1)

  it "will autodetect when score is not improving", ->
    population = evo.population config

    i = 0
    population.on "run", (genes)->
      return i++

    run_config =
      auto_stop: true
      generations: 100

    population.run run_config
    expect(population.generation).toBe(100)

  it "Can call subsequent run calls for generations", ->
    population = evo.population config

    population.on "run", (genes)->0.0

    run_config =
      generations: 100

    population.run run_config
    expect(population.generation).toBe(100)

    population.run run_config
    expect(population.generation).toBe(200)

  it "Can call subsequent run calls for iterations", ->
    population = evo.population config

    population.on "run", (genes)->0.0

    run_config =
      iterations: 100

    population.run run_config
    expect(population.iteration).toBe(100)

    population.run run_config
    expect(population.iteration).toBe(200)
