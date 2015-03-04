var evo = require('../evo');

var genes = [ 1.0,   1.0, 
              1.0,   1.0, 
		      1.9,    -1, 
		        0,     1 ];

var config = {
	output_nodes: 1,
	hidden_nodes: 2, 
	input_nodes: 2
};

var net = evo.network('feedforward', genes, config)

var p = [];
p[0] = net.calc([ 0,  0]) > 0 ? 1 : 0;
p[1] = net.calc([ 0,  1]) > 0 ? 1 : 0;
p[2] = net.calc([ 1,  1]) > 0 ? 1 : 0;
p[3] = net.calc([ 1,  0]) > 0 ? 1 : 0;

console.log(p);