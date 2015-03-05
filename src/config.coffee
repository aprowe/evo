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

        on_breed: ->
            
        on_spawn: undefined

        on_run: ->

        on_finish: ->

    network: 
        hidden_layers: 2
        hidden_nodes: 4
        output_nodes: 3
        input_nodes: 2

evo.configure = (config)->
    evo.config = evo.util.extend evo.config, config
