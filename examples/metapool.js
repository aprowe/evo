/* **********************************************
 * This example breeds a pool to achieve the best 
 * Parameters for breeding a pool on the XOR problem.
 * See XOR.js for the XOR network pool           
 *********************************************/


var evo = require('../evo.js');

var smallpool = function(g){
	copy = g.slice(0).reverse();
	return evo.pool({
		n_genes: 10, // Number of genes of each object
		size: 100,     // Size of pool
		cross_rate: Math.abs(copy.pop())/10,
		mutate_rate: Math.abs(copy.pop())/10,
		mutate_amount: Math.abs(copy.pop()),
		autospawn: true,
		ratios: {
			top:    Math.abs(copy.pop()),
			cross:  Math.abs(copy.pop()),
			mutate: Math.abs(copy.pop()),
			fresh:  Math.abs(copy.pop()),
			meld: Math.abs(copy.pop()),
			random: Math.abs(copy.pop())
		},
		on_spawn: function(genes){
			var net = evo.network('feedforward', genes, {
				output_nodes: 1,
				hidden_nodes: 2, 
				input_nodes: 2
			});
			return net;
		},
		on_run: function(net){
			net.score += net.calc([ 0,  0]) > 0.5 ? 1 : 0;
			net.score += net.calc([ 1,  1]) > 0.5 ? 1 : 0;
			net.score += net.calc([ 1,  0]) < 0.5 ? 1 : 0;
			net.score += net.calc([ 0,  1]) < 0.5 ? 1 : 0;
		},
	});
};

var metapool = evo.pool({
	n_genes: 9, // Number of genes of each object
	size: 100,     // Size of pool

	cross_rate: 0.14,
	mutate_rate: 0.05,
	mutate_amount: 1.0,
	autospawn: true,

	ratios: {
		top:    0.23,
		cross:  2.02,
		mutate: 0.71,
		meld:   0.75,
		fresh:  0.18,
		random: 0.10
	},
	on_spawn: function(genes) {
		return smallpool(genes);
	},
	on_run: function(pool) {
		pool.run(function(){return this.generation > 300 || this.average > 3.5});
		pool.score = -pool.generation
	},
	on_breed: function(){
		console.log("Gen "+this.generation+": "+this.average);
	}

});

// metapool.run(1)