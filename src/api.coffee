
evo.population = (config)->
  config = evo.util.extend evo.config.pool, config
  return new Pool(config)

## Factory Function
evo.network = (type, genes, config)->
  config = evo.util.extend evo.config.network, config

  if type is 'feedforward'
    return new FeedForward(genes, config)
  else if type is 'cppn'
    return new Cppn(genes, config)


## Configuration function to set defaults
evo.configure = (config)->
  evo.config = evo.util.extend evo.config, config
