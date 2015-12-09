
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
        top:    0.1
        cross:  0.1
        mutate: 0.1
        fresh:  0.1
        meld:   0.1
        random: 0.1

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