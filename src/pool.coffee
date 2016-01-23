## Pool Class
evo.pool = (config)->
    config = evo.util.extend evo.config.pool, config
    return new Pool(config)

class Pool extends Base
    constructor: (@config)->

        ## Current generation of the pool
        @generation = 0

        ## List of genes waiting to be tested
        @genes = []


        ## Initialize pool with fresh genes
        @genes.push @_freshGenes() for i in [1..@config.size]

        ## Keep track of the current average
        @average = 0

        ## Object of the last pool
        @_prevGenes = @genes[..]

        ## List of gene objects that have been tested
        @_scoredGenes = []

    #######################
    ## Public Methods
    #######################

    ## Construct a Member object
    constructMember: (genes=null)->

        ## Start with a user specified object
        member = @trigger 'member', genes

        #return null if no
        return null if not member?

        ## Add the evo object
        member._evo = {}

        ## Add the genes object
        member._evo.genes = genes

        ## Initialize score
        member._evo.score = 0

        ## Give it a pool report function
        member._evo.report = => @report member

        return member

    ## Retrieve the next genome in the list,
    # Breeding a generation if necessary
    nextGenes: ->
        if @genes.length == 0
            if @_scoredGenes.length > 0
                @_generate()
            else
                return @_freshGenes()

        @genes.pop()

    ##Retrieve the next constructed member
    nextMember: ->
      @constructMember @nextGenes()

    ## Reports back genes to the pool
    # genes is either a genome or a object
    # containing the genes, i.e. a spawned object
    report: (genes, score=0)->
        ## If genes is an object
        if genes._evo?
            score = genes._evo.score
            genes = genes._evo.genes

        ## Push a simple object to the _scoredGenes
        @_scoredGenes.push
            genes: genes
            score: score

    ## Run a simulation while a condition returns false
    run: (stop_fn)->
        if typeof stop_fn is 'number'
            for i in [1..stop_fn]
                @_runOnce()

        else if typeof stop_fn is 'function'
            while stop_fn.call(this)
                @_runOnce()

        else if typeof @config.on_stop is 'function'
            while @trigger 'stop'
                _runOnce()

        else throw "Stopping number or function not supplied"

        @trigger 'finish'

    ## Return the best of the last generation bred
    bestGenes: (number)->
        return @_prevGenes[0] if not number?
        return @_prevGenes[0..number-1]

    ## Load genes into the pool
    loadGenes: (genes)->

        ## Load genes into the pool
        @genes = genes[..]

        ## Clear the scored Genes
        @_scoredGenes = []

    #######################
    ## Private Methods
    #######################

    ## -------------------------------
    ## Methods for generating genomes
    ## -------------------------------

    ## Create a fresh random set of genes
    _freshGenes: -> (evo.util.random() * @config.mutate_amount for i in [1..@config.genes])

    ## Clone a genome gene for gene
    _cloneGenes: (genes) -> genes[..]

    ## Clone a genome with the chance for muations
    _mutateGenes: (genes) ->
        new_genes = []

        for g, i in genes
            new_genes[i] = genes[i]

            if Math.random() < @config.mutate_rate
                new_genes[i] += evo.util.random() * @config.mutate_amount

        return new_genes

    ## Cross two genomes into one
    _crossGenes: (genes1, genes2) ->
        new_genes = []

        flip = false
        for g, i in genes1
            flip = !flip if Math.random() < @config.cross_rate
            new_genes.push (if flip then genes1[i] else genes2[i])

        return new_genes

    ## Average two gene sets together
    _averageGenes: (genes1, genes2)->
        new_genes = []

        for g, i in genes1
            new_genes.push (genes1[i] + genes2[i])/2

        return new_genes

    ## Run one organism
    _runOnce: ->
      ## If autospawn is on and there is a spawn function,
      # Run the method with a spawn object
      member = @nextMember() || @nextGenes()
      score = @trigger 'run', member
      if member._evo?
        @report member
      else if typeof score != "undefined"
        @report member, score
      else
        throw "score was not returned in run function"

    ## Average the score of a list of scored genes
    _mean: (pool)->
        avg = 0
        avg += a.score for a in pool
        avg /= pool.length

    ## Calculates the next generation based on the _scoredGenes,
    # And inserts it into the pool object
    _generate: ()->

        ## Normalize them ratios
        ratios = evo.util.normalize(@config.ratios)

        ## Ensure the pool is empty
        @genes = []

        ## Store the average
        @average = @_mean @_scoredGenes

        ## Sort the _scoredGenes by score
        @_scoredGenes = @_scoredGenes.sort (a,b)-> a.score - b.score

        ## add the top scoring genes
        top_pool = @_scoredGenes.reverse()[0..@config.ratios.top * @config.size]

        ## Amount remaining to breed
        size = @config.size # - top_pool.length
        size = 0 if size < 1

        ## Add top entries from breed pool
        for a in top_pool
            @genes.push @_cloneGenes(a.genes)

        if ratios.mutate > 0
            ## Add mutated entries
            for i in [1..ratios.mutate*size]
                @genes.push @_mutateGenes(evo.util.sample(top_pool).genes)

        if ratios.cross > 0
            ## Add Crossed entries
            for i in [1..ratios.cross*size]
                g1 = evo.util.sample(top_pool).genes
                g2 = evo.util.sample(top_pool).genes
                @genes.push @_crossGenes(g1, g2)

        if ratios.average > 0
            ## Add Melded entries
            for i in [1..ratios.meld*size]
                g1 = evo.util.sample(top_pool).genes
                g2 = evo.util.sample(top_pool).genes
                @genes.push @_averageGenes(g1, g2)

        if ratios.random > 0
            ## Add random survivors
            for i in [1..ratios.random*size]
                @genes.push @_cloneGenes(evo.util.sample(@_scoredGenes).genes)

        ## Fill the rest with fresh genetics
        @genes.push @_freshGenes() while @genes.length <= size

        ## Increment the generation count
        @generation++

        ## Save a static copy of the pool for reference
        ## Round all Genes to two places
        @_prevGenes = @genes[..]

        ## Shuffle the pool to get fresh matches
        @genes = evo.util.shuffle @genes

        # Trigger the breed callback
        @trigger 'breed'

        ## Clear the breed pool for the next generation
        @_scoredGenes = []
