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
       