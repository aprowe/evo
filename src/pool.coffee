## Pool Class

evo.pool = (config)->
    config = evo.util.extend evo.config.pool, config
    return new Pool(config)

class Pool extends Base
    constructor: (@config)->

        ## Current generation of the pool
        @generation = 0

        ## List of genes waiting to be tested
        @pool = []

        ## List of gene objects that have been tested
        @breedpool = []

        ## Initialize pool with fresh genes
        @pool.push @fresh() for i in [1..@config.size]

        ## Object of the last pool
        @prev_pool = @pool[..]

        ## Keep track of the current average
        @average = 0


    ## -------------------------------
    ## Methods for generating genomes
    ## -------------------------------

    ## Function for each gene in a genome
    seed: -> evo.util.random()*@config.mutate_amount 

    ## Create a fresh random genome 
    fresh: -> (@seed() for i in [1..@config.n_genes])

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

    ## Construct a Spawn object
    spawn: (genes=null)->
        ## Get the genes
        genes = @next() unless genes?

        ## Start with a user specified object
        spec = @trigger 'spawn', genes

        throw "Spawn trigger did not return an object" if not spec?

        ## Add the genes object
        spec.genes = genes

        ## Initialize score
        spec.score = 0

        ## Give it a pool report function
        spec.report_to_pool = => @report spec

        return spec

    ## Retrieve the next genome in the list,
    # Breeding a generation if necessary
    next: ->
        if @pool.length == 0
            if @breedpool.length > 0
                @generate() 
            else
                return @fresh()

        @pool.pop()

    ## Reports back genes to the pool
    # genes is either a genome or a object
    # containing the genes, i.e. a spawned object
    report: (genes, score=0)->
        ## If genes is an object
        if genes.score? and genes.genes?
            score = genes.score
            genes = genes.genes

        ## Push a simple genome object
        @breedpool.push 
            genes: genes
            score: score


    ## Run a simulation while a condition returns false
    run: (stop_fn)->

        if typeof stop_fn is 'number'
            ## Default function is generation count
            max = stop_fn + @generation
            @config.on_stop = ->
                @generation >= max

        else if typeof stop_fn is 'function'
            @config.on_stop = stop_fn

        ## Run the simulation
        while not @trigger 'stop'

            ## If autospawn is on and there is a spawn function, 
            # Run the method with a spawn object
            if @config.autospawn and @config.on_spawn?
                spawn = @spawn()
                @trigger 'run', spawn
                @report spawn

            ## If autospawn is on but no spawn function exists, 
            # run the simulation 
            else if @config.autospawn
                genes = @next()
                score = @trigger 'run', genes
                @report genes, score

            ## If no spawn and no autospawn, Let the user handle simulations
            else
                @trigger 'run'

        @trigger 'finish'

    ## Average the score of a list of genome objects
    mean: (pool)->
        avg = 0
        avg += a.score for a in pool
        avg /= pool.length

    ## Calculates the next generation based on the breedpool,
    # And inserts it into the pool object
    generate: ()->

        ## Normalize them ratios
        ratios = evo.util.normalize(@config.ratios)

        ## Ensure the pool is empty
        @pool = []

        ## Store the average
        @average = @mean @breedpool

        ## Sort the breedpool by score
        @breedpool = @breedpool.sort (a,b)-> a.score - b.score

        ## add the top scoring genes
        top_pool = @breedpool.reverse()[0..@config.ratios.top * @config.size]

        ## Amount remaining to breed
        size = @config.size # - top_pool.length
        size = 0 if size < 1

        ## Add top entries from breed pool
        for a in top_pool
            @pool.push @clone(a.genes)

        if ratios.mutate > 0
            ## Add mutated entries
            for i in [1..ratios.mutate*size]
                @pool.push @mutate(evo.util.sample(top_pool).genes)

        if ratios.cross > 0
            ## Add Crossed entries
            for i in [1..ratios.cross*size]
                g1 = evo.util.sample(top_pool).genes
                g2 = evo.util.sample(top_pool).genes
                @pool.push @cross(g1, g2)

        if ratios.meld > 0
            ## Add Melded entries
            for i in [1..ratios.meld*size]
                g1 = evo.util.sample(top_pool).genes
                g2 = evo.util.sample(top_pool).genes
                @pool.push @meld(g1, g2)

        if ratios.random > 0
            ## Add random survivors
            for i in [1..ratios.random*size]
                @pool.push @clone(evo.util.sample(@breedpool).genes)

        ## Fill the rest with fresh genetics
        @pool.push @fresh() while @pool.length <= size

        ## Increment the generation count
        @generation++

        ## Save a static copy of the pool for reference
        ## Round all Genes to two places
        @prev_pool = @pool[..]

        ## Shuffle the pool to get fresh matches
        @pool = evo.util.shuffle @pool            

        # Trigger the breed callback
        @trigger 'breed'

        ## Clear the breed pool for the next generation
        @breedpool = [] 

    ## Return the best of the last generation bred
    best: (number)->
        return @prev_pool[0] if not number?
        return @prev_pool[0..number-1]

    ## Load genes into the pool
    load: (genes)->

        ## Load genes into the pool
        @pool = genes[..]

        ## Clear the Breed pool
        @breedpool = []

