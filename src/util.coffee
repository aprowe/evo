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

