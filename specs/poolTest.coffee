
n_genes = 10
size = 400

config = 
    n_genes: n_genes
    size: size

    cross_rate: 0.10
    mutate_rate: 0.7
    mutate_amount: 1.85

    autospawn: true

    ratios: 
        top:    1.10
        cross:  1.10
        mutate: 1.10
        fresh:  1.10
        meld:   1.10
        random: 1.10

    on_spawn: (genes)-> {}

    on_run: (spawn)-> 
    	spawn.score = Math.random()

describe 'Pool Basics', ->
	it "Creates The right number of organisms", ->
		pool = evo.pool config
		pool.run 1
		expect pool.pool.length
			.toBe size	

	it "Organisms have the right number of genes", ->
		pool = evo.pool config
		pool.run 1
		expect pool.pool[0].length
			.toBe n_genes