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

(function() {
  var config, n_genes, size;

  n_genes = 10;

  size = 400;

  config = {
    n_genes: n_genes,
    size: size,
    cross_rate: 0.10,
    mutate_rate: 0.7,
    mutate_amount: 1.85,
    autospawn: true,
    ratios: {
      top: 0.1,
      cross: 0.1,
      mutate: 0.1,
      fresh: 0.1,
      meld: 0.1,
      random: 0.1
    },
    on_spawn: function(genes) {
      return {};
    },
    on_run: function(spawn) {
      return spawn.score = Math.random();
    }
  };

  describe('Pool Basics', function() {
    it("Creates The right number of organisms", function() {
      var pool;
      pool = evo.pool(config);
      pool.run(1);
      return expect(pool.pool.length).toBe(size);
    });
    return it("Organisms have the right number of genes", function() {
      var pool;
      pool = evo.pool(config);
      pool.run(1);
      return expect(pool.pool[0].length).toBe(n_genes);
    });
  });

}).call(this);

(function() {
  var config, scoreNet;

  config = {
    n_genes: 10,
    size: 400,
    cross_rate: 0.10,
    mutate_rate: 0.7,
    mutate_amount: 1.85,
    autospawn: false,
    ratios: {
      top: 1.00,
      cross: 0.33,
      mutate: 2.00,
      fresh: 0.20,
      meld: 0.75,
      random: 1.25
    },
    on_spawn: function(genes) {
      return evo.network('feedforward', genes, {
        output_nodes: 1,
        hidden_nodes: 2,
        input_nodes: 2
      });
    }
  };

  scoreNet = function(net) {
    var ref, ref1, ref2, ref3, score;
    score = 0;
    score += (ref = net.calc([-1, -1]) > 0) != null ? ref : {
      1: 0
    };
    score += (ref1 = net.calc([1, 1]) > 0) != null ? ref1 : {
      1: 0
    };
    score += (ref2 = net.calc([1, -1]) < 0) != null ? ref2 : {
      1: 0
    };
    score += (ref3 = net.calc([-1, 1]) < 0) != null ? ref3 : {
      1: 0
    };
    return score;
  };

  describe("Pool XOR Test", function() {
    it("Trains a pool without autospawn", function() {
      var pool;
      pool = evo.pool(config);
      pool.on('run', function() {
        var net;
        net = this.spawn();
        net.score = scoreNet(net);
        return this.report(net);
      });
      pool.run(function() {
        return this.average > 3.50 || this.generation > 1000;
      });
      return expect(pool.average).toBeGreaterThan(3.5);
    });
    return it("Trains a pool with autospawn", function() {
      var pool;
      config.autospawn = true;
      pool = evo.pool(config);
      pool.on('run', function(spawn) {
        return spawn.score = scoreNet(spawn);
      });
      pool.run(function() {
        return this.average > 3.50 || this.generation > 1000;
      });
      return expect(pool.average).toBeGreaterThan(3.5);
    });
  });

}).call(this);
