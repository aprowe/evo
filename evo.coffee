##
# evo.js v0.1.0
# Genetic Algorithm Calculator with ANN
# Copyright (c) 2015 Alex Rowe <aprowe@ucsc.edu>
# Licensed MIT
##

root = if window? then window else this

((factory)-> 

    # Node
    if typeof exports == 'object'
        module.exports = factory.call root 

    # AMD
    else if typeof define == 'function' and define.amd 
        define -> factory.call root

    # Browser globals (root is window)
    else 
        root.evo = factory.call root

)(->

    evo = {}
    ## Default Configuration Object
    evo.config = 
        pool:

            ## Number of Genes in a genetic object
            n_genes: 200

            ## The frequency of "twists" in two parents genes
            cross_rate: 0.05

            ## The frequency of mutations in a parent gene
            mutate_rate: 0.05

            ## The amount a mutatated gene can deviate from its original value
            mutate_amount: 1.0

            ## The initial pool size
            size: 100

            ## Enable Auto spawn
            autospawn: false

            ## Ratios each generation will compromise
            ratios:

                ## The "surviving" percentage from the last generation
                top:    0.25

                ## The mutating percentage
                mutate: 0.25

                ## The percentage created from crossing parents
                cross:  0.25

                ## The percentage random survivors
                random: 0.10

                ## The percentage made from melding two parent
                meld:   0.00

                ## The percentage of new genomes
                fresh:  0.15

            on_breed: ->
                
            on_spawn: undefined

            on_run: ->

            on_finish: ->

        network: 
            output_fn: 'tanh'

            output_nodes: 2

            hidden_layers: 2
            
            hidden_nodes: 2

            input_nodes: 2

    ## Configuration function to set defaults
    evo.configure = (config)->
        evo.config = evo.util.extend evo.config, config

    ## Utility Functions
    evo.util =
        
        random: (min = -1, max = 1)->
            (Math.random() * (max - min)) + min

        sin: (x, freq=1, phase=0)->
            Math.sin x * freq * 6.2832 + phase

        gaussian: (x,mu=0,sigma=1)->
            Math.exp -(mu-x)**2 * sigma

        linear: (x, m=1, b=0)-> 
            (x + b) * m

        flatten: (x)->
            return 1 if x > 1
            return -1 if x < -1
            return x

        tanh: (x)->
            if -3 > x or x > 3
                return evo.util.flatten x
            else
                x1 = Math.exp x
                x2 = Math.exp -x
                return (x1-x2)/(x1+x2)

        step: (x)->
            return -1 if (x < 0)
            return  1

        ## Pick a random element of an array
        sample: (array)->
            array[Math.floor(Math.random() * array.length)]

        ## Shuffle an array
        # Idea taken from underscore
        shuffle: (array)->
            length = array.length
            shuffled = Array length
            for index in [0..length-1]
                rand = Math.floor(Math.random() * index)
                shuffled[index] = shuffled[rand] if rand != index
                shuffled[rand] = array[index]

            return shuffled

        ## clone an object
        clone: (obj)->
            return obj if null == obj or "object" != typeof obj
            copy = obj.constructor()
            for attr of obj
                copy[attr] = obj[attr] if obj.hasOwnProperty(attr)

            return copy

        ## Deep extend of an object
        extend: (destination, source)->
            destination = evo.util.clone(destination)
            return destination unless source?

            for property of source
                if source[property] and source[property].constructor and source[property].constructor == Object
                    destination[property] = destination[property] or {}
                    destination[property] = arguments.callee(destination[property], source[property])
                else
                    destination[property] = source[property]

            return destination

        ## Normalizes the values of an object
        normalize: (obj)->
            ## Compute sum
            sum = 0 
            sum += value for key, value of obj
            
            ratios = {}
            for key, value of obj
                value = 0 if not value
                ratios[key] = value/sum 

            return ratios


    ## Base Class
    class Base
        config: {}

        on: (name, fn)->
            @config['on_' + name] = fn
            return this

        trigger: (name, args=null) ->
            @config['on_'+name].call(this, args) if @config['on_' + name]?


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

        ## -------------------------------
        ## Methods for generating genomes
        ## -------------------------------

        ## Create a fresh random set of genes
        _freshGenes: -> (evo.util.random() * @config.mutate_amount for i in [1..@config.n_genes])

        ## Clone a genome gene for gene
        _cloneGenes: (genes) -> genes[..]

        ## Clone a genome with the chance for muations
        _mutate: (genes) ->
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
        _meldGenes: (genes1, genes2)->
            new_genes = []

            for g, i in genes1
                new_genes.push (genes1[i] + genes2[i])/2

            return new_genes

        ## Construct a Spawn object
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
                    @genes.push @_mutate(evo.util.sample(top_pool).genes)

            if ratios.cross > 0
                ## Add Crossed entries
                for i in [1..ratios.cross*size]
                    g1 = evo.util.sample(top_pool).genes
                    g2 = evo.util.sample(top_pool).genes
                    @genes.push @_crossGenes(g1, g2)

            if ratios.meld > 0
                ## Add Melded entries
                for i in [1..ratios.meld*size]
                    g1 = evo.util.sample(top_pool).genes
                    g2 = evo.util.sample(top_pool).genes
                    @genes.push @_meldGenes(g1, g2)

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

    ## Network Class

    class Network
        constructor: (@weights, @config)->
        calc: (input)->

    ## Factory Function
    evo.network = (type, genes, config)->
        config = evo.util.extend evo.config.network, config

        if type is 'feedforward'
            return new FeedForward(genes, config)
        else if type is 'cppn'
            return new Cppn(genes, config)
           
    ## Compositional Pattern Producing Network

    class Cppn extends Network
        @node_fn: [
            evo.util.gaussian
            evo.util.sin
            (x,m,b)-> evo.util.tanh evo.util.linear(x,m,b)
        ]

        get_fn: (gene)->
            index = Math.round(Math.abs(gene)*Cppn.node_fn.length) % Cppn.node_fn.length
            return Cppn.node_fn[index]

        ## Gene Structure
        constructor: (genes, @config)->
            @node_fn = []
            copy = genes[..]

            for i in [0..@config.hidden_layers-1]
                @node_fn[i] = []
                for j in [0..@config.hidden_nodes-1]
                    @node_fn[i].push @get_fn(copy.pop())


            @weights = copy[..]

        calc: (input)->
            # input.push 0 while input.length < @config.input
            layer_size = @config.hidden_nodes

            copy = @weights[..]

            hidden_weights = []

            for k in [0..@config.hidden_layers-1]
                hidden_weights[k] = []
                for i in [0..@config.hidden_nodes-1]
                    hidden_weights[k][i] = 0

            for x in input
                for i in [0..@config.hidden_nodes-1]
                    hidden_weights[0][i] += x * copy.pop()

            for k in [0..@config.hidden_layers-2]
                for i in [0..@config.hidden_nodes-1]

                    ## Threshold
                    # hidden_weights[k][i] += copy.pop()

                    ## Normalize
                    hidden_weights[k][i] = @node_fn[k][i](hidden_weights[k][i], copy.pop(), copy.pop())

                    continue unless k+1 < @config.hidden_layers
                    for j in [0..@config.hidden_nodes-1]
                        hidden_weights[k+1][j] += hidden_weights[k][i] * copy.pop()

            output = []
            for j in [0..@config.output_nodes-1]
                output[j] = 0
                for i in [0..@config.hidden_nodes-1]
                    # fn = @node_fn[@config.hidden_layers-1][i]
                    output[j] += hidden_weights[@config.hidden_layers-1][i] * copy.pop()

                output[j] = evo.util.tanh output[j]

            return output
            
    ## Classic Feed Forward Network

    class FeedForward extends Network

        constructor: (@weights, @config) ->
            if typeof @config.output_fn == 'function'
                @output_fn = @config.output_fn

            else if @config.output_fn == 'linear'
                @output_fn = evo.util.linear
                
            else if @config.output_fn == 'step'
                @output_fn = evo.util.step

            else
                @output_fn = evo.util.tanh

        calc: (input)->
            if input.length != @config.input_nodes
                throw Error("Inputs dont match. Expected: #{@config.input_nodes}, Received: #{input.length}")
            # input.push 0 while input.length < @config.input

            copy = @weights[..].reverse()
            hidden_weights = []
            hidden_weights[j] = 0 for j in [0..@config.hidden_nodes-1]

            output_weights = []
            output_weights[j] = 0 for j in [0..@config.output_nodes-1]


            for i in input
                for h, j in hidden_weights
                    hidden_weights[j] += i * copy.pop()

            for h, i in hidden_weights
                ## Threshold
                hidden_weights[i] += copy.pop()

                ## Normalize
                hidden_weights[i] = evo.util.tanh hidden_weights[i]

                for o, j in output_weights
                    output_weights[j] += hidden_weights[i] * copy.pop()

            for o, i in output_weights
                output_weights[i] = @output_fn output_weights[i]

            return output_weights[0] if output_weights.length == 1

            return output_weights



    return evo 
)

