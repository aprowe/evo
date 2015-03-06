
var evo = require('../evo.js');

var pool = evo.pool({
	n_genes: 10, // Number of genes of each object
	size: 400,     // Size of pool

	cross_rate: 0.10,
	mutate_rate: 0.7,
	mutate_amount: 1.85,

	ratios: {
		top:    1.00,
		cross:  0.33,
		mutate: 2.00,
		fresh:  0.20,
		meld:   0.75,
		random: 1.25,
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
	// console.log(this.average);
});

pool.on('run', 	function(){
	var net = this.spawn()

	// Max score is 4 if it correctly classifies all points
	net.score += net.calc([-1, -1]) > 0 ? 1 : 0;
	net.score += net.calc([ 1,  1]) > 0 ? 1 : 0;
	net.score += net.calc([ 1, -1]) < 0 ? 1 : 0;
	net.score += net.calc([-1,  1]) < 0 ? 1 : 0;

	this.report(net)
});

// Run 300 generations
// pool.run(300);


// Run until function returns true
pool.run(function(){
	return this.average > 3.50
});

console.log('Took ' + pool.generation + " generations to reach a score of " + pool.average);
