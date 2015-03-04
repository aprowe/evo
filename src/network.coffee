## Network Class

class Network
    constructor: (genes, @config)->
    calc: (input)->

## Factory Function
evo.network = (type, weights, config)->
    config = evo.util.extend evo.config.network, config

    if type is 'feedforward'
        return new FeedForward(weights, config)
    else if type is 'cppn'
        return new Cppn(weights, config)
       