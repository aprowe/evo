
var evo = require('../evo.js');

var pool = evo.pool({
	n_genes: 10, // Number of genes of each object
	size: 400,     // Size of pool

	cross_rate: 0.05,
	mutate_rate: 0.05,
	mutate_amount: 1.0,

	ratios: {
		top:    0.25,
		cross:  0.25,
		mutate: 0.25,
		fresh:  0.25
	}

});

pool.on ('spawn', function(genes){
	var net = evo.network('feedforward', genes, {
		output_nodes: 1,
		hidden_nodes: 2, 
		input_nodes: 2
	});

	return net;
});

// Show the average each generation
pool.on('breed', function(){
	console.log(this.average);
});

pool.on('run', 	function(){
	var net = this.spawn()

	// Max score is 4 if it correctly classifies all points
	net.score += net.calc([-1, -1]) > 0 ? 1 : 0;
	net.score += net.calc([ 1,  1]) > 0 ? 1 : 0;
	net.score += net.calc([ 1, -1]) < 0 ? 1 : 0;
	net.score += net.calc([-1,  1]) < 0 ? 1 : 0;

	net.report()
});

// pool.run isn't asynchronous, but we can do this anyway
pool.on('finish', function() {
	console.log('Took ' + this.generation + " generations to reach a score of " + this.average);
});

// Run 300 generations
// pool.run(300);

// Run until function returns true
pool.run(function(){
	return this.average > 3.50
})

console.log(pool.pool)

