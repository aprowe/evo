
var evo = require('../evo.js');

var pool = evo.pool({
	n_genes: 10, // Number of genes of each object
	size: 400,     // Size of pool

	ratios: {
		top:    0.25,
		cross:  0.20,
		mutate: 0.40,
		meld: 0.1,
		fresh:  0.05
	}

});

pool.seed = function(){
	return evo.util.sample('abcdefghijklmnopqrstuvwxyz');
}

pool.mutate = function(genes) {
	var g = [];
	for (var i = 0; i < genes.length; i++) {
		g.push(genes[i]);
		if (Math.random() < this.config.mutate_rate){
			return evo.util.sample('abcdefghijklmnopqrstuvwxyz');
		}
	}
	return g;
}

// Show the average each generation
pool.on('breed', function(){
	console.log(this.average);
});

pool.on('run', 	function(){
	var genes = this.next();
	var score = 0;

	for (var i = 0; i < genes.length-1; i++) {
		score += genes[i] == genes[i+1];
	}

	pool.report(genes, score);
});

// Run 300 generations
pool.run(10);

console.log('Took ' + this.generation + " generations to reach a score of " + this.average);
console.log(pool.best())

