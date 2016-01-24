evoJS
=========
evoJS is a genetic and evolutionary algorithm tool, making it easy to incorporate evolutionary algorithms in your JavaScript.  

Installation
-------------
To install run `npm install evo-js`.

To run on a browser, include `evo.min.js` in your scripts. 

Basic Usage
---------
The tool is used through a `pool` object. Here is a simple example

```javascript
    // Instantiate a pool object
    var pool = evo.pool();

    // Define a method to evaluate genes and return the fitness
    // Genes comes as a long list of floats
    pool.on('run', function(genes){
        return evaluateGenes(genes); // Supply this method to evaluate the genes
    });

    // Run with a stopping criteria
    pool.run({generations: 10});

    // Get the best genes
    var result = pool.bestGenes();
```

Pool Configuration
----------
As an argument to `evo.pool` a configuration object can be passed to override the
defaults. Here are the defaults.
```javascript
    var config = {
        genes: 200, // Number of genes for each member
        size: 100, //  Number of members in the gene pool
        cross_rate: 0.05, // The frequency of gene "twists" in two parents genes
        mutate_rate: 0.05, // The frequency of mutations in a parent gene
        mutate_amount: 1.0, // The amount a mutated gene can deviate

        // Each generation is made from a mix of different breeding strategies
        // Ratios defines the ratio of each in the next generation
        ratios: {
            top:    0.25,    // Survivors last generation
            mutate: 0.25,    // Created by randomly altering genes
            cross:  0.25,    // Created from crossing parents
            random: 0.10,    // Random survivors
            average:0.05,    // Parents genes are averaged together
            fresh:  0.10    // Random gene sets
        }
    });

    var pool = evo.pool(config);
```

Stopping conditions
----------
As an argument to `pool.run` a configuration object can be passed to defined the
stopping conditions
```javascript
    var config = {
        iterations: 1000, // How many genes will be run
        generations: 100, // How many generations will be run
        score: 10.0,      // Minimum score to be reached (higher score is better)
        // A while function can be supplied
        // when false is returned sim stops
        while: function(){
            return true;
        }

        // If true, a method will be attempted to stop when the score
        // stops changing across generations
        auto_run: false
    });

    pool.run(config);
```

'Manual' simulations
----------
While pool provides the run method to run simulations, the gene pool can be accessed
manually for custom simulations.
```javascript
    pool = evo.pool()

    while(pool.generation < 100) {
        // Grab next genes
        var genes = pool.nextGenes();

        //Evaluate genes
        var score = evaluateGenes(genes);

        //Report genes back to pool
        pool.report(genes, score);
    }
```
When the gene pool is empty, a new generation will be created.

Member construction
----------
You may provide a member constructor to automate gene evaluation, and use a more
object oriented approach
```javascript
    pool = evo.pool()

    // Supply a 'constructor' to use the genes
    pool.on('member', function(genes){
        var member = {
            height: genes[0],
            width: genes[1]
        };
        return member;
    });

    // Run will now give your constructed member instead of a gene list
    pool.on('run', function(member){
        return member.height + member.width;
    });
```
