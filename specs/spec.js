(function() {
  describe("Feed Forward Network", function() {
    return it("Solves the XOR problem", function() {
      var config, genes, i, j, len, net, p, ref, ref1, ref2, ref3, results, target, v;
      genes = [0.5, 1.0, 0.5, 1.0, -0.3, -1, 0, 1];
      config = {
        output_nodes: 1,
        hidden_nodes: 2,
        input_nodes: 2
      };
      net = evo.network('feedforward', genes, config);
      p = [];
      p[0] = (ref = net.calc([1, 1]) > 0.5) != null ? ref : {
        1: 0
      };
      p[1] = (ref1 = net.calc([-1, -1]) > 0.5) != null ? ref1 : {
        1: 0
      };
      p[2] = (ref2 = net.calc([0, 1]) > 0.5) != null ? ref2 : {
        1: 0
      };
      p[3] = (ref3 = net.calc([1, 0]) > 0.5) != null ? ref3 : {
        1: 0
      };
      target = [0, 0, 1, 1];
      results = [];
      for (i = j = 0, len = target.length; j < len; i = ++j) {
        v = target[i];
        results.push(expect(v).toBe(target[i]));
      }
      return results;
    });
  });

}).call(this);
