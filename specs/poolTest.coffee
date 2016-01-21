n_genes = 10
size = 400

config =
    n_genes: n_genes
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
        pool = evo.pool(config);expect(pool.genes.length).toBe size

    it "Gene sets have the right number of genes", ->
        pool = evo.pool(config);expect(pool.genes[0].length).toBe n_genes
