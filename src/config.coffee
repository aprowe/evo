## Default Configuration Object
evo.config =
  pool:

    ## Number of Genes in a genetic object
    genes: 200

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
      average:   0.05

      ## The percentage of new genomes
      fresh:  0.10

    ## TODO
    run_conditions:
      ## Maximum generatios that will run
      generations: 1000

      ## Iterations that run will run
      iterations: undefined

      ## Minimum score to be reached by members
      score: Infinity

      ## Boolean to check if a minumum is reached
      auto_stop: false

      ## Minumum generations to run for auto_stop
      min_generations: 10

      ## Condition to be checked each time
      while: undefined

    on_breed: undefined

    on_member: undefined

    on_run: undefined

    on_finish: undefined

  network:
    output_fn: 'tanh'

    output_nodes: 2

    hidden_layers: 2

    hidden_nodes: 2

    input_nodes: 2
