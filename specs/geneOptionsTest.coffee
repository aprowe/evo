n_genes = 10
size = 10

config =
  gene_options: [
    {
      name: 'gene_1'
      min: 1
      max: 2
      precision: 2
      mutate_amount: 1
      mutate_rate: 2
    },
    {
      name: 'gene_set'
      min: 0
      max: 2
      precision: 2
      mutate_amount: 0.5
      mutate_rate: 0.5
      range: [4,8]
    }
  ]

  genes: n_genes
  size: size



describe "Gene Options", ->
  it "returns a dictionary of named genes", ->
    pool = evo.population config

    genes = pool.nextGeneDict()
    expect(genes._raw).toBeDefined()
    expect(genes['gene_1']).toBeDefined()
    expect(genes[0]).not.toBeDefined()
    expect(genes[1]).toBeDefined()

  it "can report gene dictionaries", ->
    pool = evo.population config

    ## Run one set
    genes = pool.nextGeneDict()
    pool.report genes, 0.5

    expect(pool.currentSize()).toBe(9)

    ## Go through a generation
    while pool.currentSize() < 10
      pool.report pool.nextGeneDict(), 0.5

    expect(pool.average).toBe(0.5)

  it "can have gene ranges", ->
    pool = evo.population config

    ## Run one set
    genes = pool.nextGeneDict()
    expect(genes.gene_set.length).toBe(5)
    expect(genes[4]).not.toBeDefined()
    expect(genes[8]).not.toBeDefined()
