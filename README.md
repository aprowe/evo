  Evo
=========

Evo is a genetic algorithm 'calculator', making it easy to incoporate evolutionary algorithms in your code.  
Wrapped in the library are simple ANN (Artificial Neural Network) and CPPN (Compositional Pattern Producing Network) 
classes that work easily with the genetic algorithm. 

Installation
-------------
Evo is compatible with both require.js and node.


Usage
---------
Getting started is easy:

```javascript
    // Instantiate a pool object
    var pool = evo.pool();

    // Get the next set of genes
    var genes = pool.next();  

    // Create a feed forward network
    var net = evo.network('feedforward', genes) 

    // Evaluate the network
    var output = net.calc([0,1,2]);
    
    // Assign a score to the output
    net.score = output[0] - output[1];
    
    // Report back to the pool
    pool.report(net);
```

Gradually, the gene pool will evolve to maxmize the score.
The magic happens in `pool.next` and `pool.report`. `pool.next()` will retrieve the next set of genes,
and when the pool is empty, it will breed all of the specimens you have reported back to the pool via `pool.report`.

###### Triggers
----------
We can monitor for when a generation is computed with the 'breed' trigger.

```javascript
    pool.on('breed', function(){
        console.log(this.generation); // Prints the number of generations computed
    });
```

###### Spawn Objects
For easy creation of objects using the genes, we can use the 'spawn' trigger. This lets you define a function to shortcut the creation of your genetic object.

```javascript
    pool.on('spawn', function(genes){
        var net = evo.network('cppn', genes);
        return net;
    });
```

The return value of this function will be returned when `pool.spawn` is called.
Now, we can do this: 

```javascript
    var net = pool.spawn();
    
    // Evaluate the network
    var output = net.calc([0,1,2]);
    
    // Assign a score to the output
    net.score = output[0] - output[1];
    
    // pool reference is now stored in net. 
    net.report();
```
   
More to Come
----------
evo is a just baby!
