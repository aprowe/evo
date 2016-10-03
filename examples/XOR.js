/*
 * This example trains a neural network to solve the XOR problem
 */
var evo = require('evo-js');

var population= evo.population();

population.on('run', function(genes){
  // Create a neural network
  var net = evo.network('feedforward', genes, {
    output_nodes: 1,
    hidden_nodes: 2,
    input_nodes: 2
  });

  // Create a score based on the networks output
  var score = 0;
  score += net.calc([-1, -1]) > 0 ? 1 : 0;
  score += net.calc([ 1,  1]) > 0 ? 1 : 0;
  score += net.calc([ 1, -1]) < 0 ? 1 : 0;
  score += net.calc([-1,  1]) < 0 ? 1 : 0;
  return score;
});

// Run until score is 3.5 or greater
population.run({
  score: 3.5
});

console.log("Took " + population.generation + " generations to reach a score of " + population.average);
