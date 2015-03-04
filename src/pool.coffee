## Pool Class

class Pool extends Base
    constructor: (@config)->

        ## Current generation of the pool
        @generation = 0

        ## List of genes waiting to be tested
        @pool = []

        ## List of gene objects that have been tested
        @breedpool = []

        ## Most recent spawn
        @last_genes = {}

        ## Initialize pool with fresh genes
        @pool.push @fresh() for i in [1..@config.size]

        ## Object of the last pool
        @prev_pool = @pool[..]

        ## Keep track of the current average
        @average = 0

    ## -------------------------------
    ## Methods for generating genomes
    ## -------------------------------

    ## Create a fresh random genome 
    fresh: -> (evo.util.random()*@config.mutate_amount for i in [1..@config.n_genes])

    ## Clone a genome gene for gene
    clone: (genes) -> genes[..]

    ## Clone a genome with the chance for muations
    mutate: (genes) ->
        new_genes = []

        for g, i in genes
            new_genes[i] = genes[i]

            if Math.random() < @config.mutate_rate
                new_genes[i] += evo.util.random() * @config.mutate_amount

        return new_genes

    ## Cross two genomes into one
    cross: (genes1, genes2) ->
        new_genes = []

        flip = false
        for g, i in genes1
            flip = !flip if Math.random() < @config.cross_rate
            new_genes.push (if flip then genes1[i] else genes2[i])

        return new_genes

    ## Average two gene sets together
    meld: (genes1, genes2)->
        new_genes = []

        for g, i in genes1
            new_genes.push (genes1[i] + genes2[i])/2

        return new_genes

    spawn: ->
        genes = @next()
        spec = @trigger 'spawn', genes
        spec.genes = genes
        spec.score = 0
        spec.report = => 
            @report spec
        return spec

    next: ->
        if @pool.length == 0
            if @breedpool.length > 0
                @generate() 
            else
                return @last = @fresh()

        @last = @pool.pop()

    report: (genes, score=0)->

        ## If genes is an object
        if genes.score? and genes.genes?
            score = genes.score
            genes = genes.genes

        ## If no genes are supplied, use the last spawned
        genes = @last_genes unless genes?

        ## Push a simple genome object
        @breedpool.push 
            genes: genes
            score: score

    mean: (pool)->
        avg = 0
        for a in pool
            avg += a.score
        avg /= pool.length

    ## Calculates the next generation based on the breedpool,
    # And inserts it into the pool object
    generate: ()->

        # Ensure the pool is empty
        @pool = []

        @average = @mean @breedpool

        ## Sort the breedpool by score
        @breedpool = @breedpool.sort (a,b)-> a.score - b.score

        ## add the top scoring genes
        top_pool = @breedpool.reverse()[0..@config.ratios.top * @config.size]

        ## Amount remaining to breed
        size = @config.size# - top_pool.length
        size = 0 if size < 1

        ## Add top entries from breed pool
        for a in top_pool
            @pool.push @clone(a.genes)

        ## add mutated entries
        for i in [1..@config.ratios.mutate*size]
            @pool.push @mutate(evo.util.sample(top_pool).genes)

        ## Add Crossed entries
        for i in [1..@config.ratios.cross*size]
            g1 = evo.util.sample(top_pool).genes
            g2 = evo.util.sample(top_pool).genes
            @pool.push @cross(g1, g2)

        ## Add Melded entries
        for i in [1..@config.ratios.meld*size]
            g1 = evo.util.sample(top_pool).genes
            g2 = evo.util.sample(top_pool).genes
            @pool.push @meld(g1, g2)

        ## Add random survivors
        for i in [1..@config.ratios.random*size]
            @pool.push @clone(evo.util.sample(@breedpool).genes)

        ## Fill the rest with fresh genetics
        while @pool.length < size
            @pool.push @fresh()

        ## Increment the generation count
        @generation++

        ## Save a static copy of the pool for reference
        ## Round all Genes to two places
        @prev_pool = @pool.map (g)->(g.map (d)->Math.round(d*100)/100)

        ## Shuffle the pool to get fresh matches
        @pool = evo.util.shuffle @pool            

        # Trigger the breed callback
        @trigger 'breed'

        ## Clear the breed pool for the next generation
        @breedpool = []


    load: (genes)->

        ## Load genes into the pool
        @pool = genes[..]

        ## Clear the Breed pool
        @breedpool = []

evo.pool = (config)->
    config = evo.util.extend evo.config.pool, config
    return new Pool(config)
