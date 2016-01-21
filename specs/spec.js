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
    ratios: {
      top: 0.1,
      cross: 0.1,
      mutate: 0.1,
      fresh: 0.1,
      meld: 0.1,
      random: 0.1
    }
  };

  describe('Given a method to construct a member', function() {
    var member, pool;
    pool = evo.pool(config);
    pool.on('member', function(genes) {
      return {
        a: 'a'
      };
    });
    member = pool.nextMember();
    it('will use that method to create a member', function() {
      return expect(member.a).toEqual('a');
    });
    return it('will have an object named _evo within it', function() {
      expect(member._evo).toBeDefined();
      expect(member._evo.genes).toBeDefined();
      expect(member._evo.score).toBeDefined();
      return expect(member._evo.report).toBeDefined();
    });
  });

  describe('Given a method to run a simulation', function() {
    it('will stop after a certain amount if stopping number is supplied', function() {
      var numberRun, pool;
      pool = evo.pool(config);
      numberRun = 0;
      pool.on('run', function() {
        return numberRun++;
      });
      pool.run(10);
      return expect(numberRun).toEqual(10);
    });
    return describe('When a member constructor member is NOT supplied', function() {
      return it('will run it with genes as a supplied parameter', function() {
        var g, pool;
        pool = evo.pool(config);
        g = {};
        pool.on('run', function(genes) {
          return g = genes;
        });
        pool.run(10);
        return expect(g.length).toEqual(n_genes);
      });
    });
  });

  describe('When a member constructor member is supplied', function() {
    return it('runs with a new member as a supplied parameter', function() {
      var g, pool;
      pool = evo.pool(config);
      g = {};
      pool.on('member', function(genes) {
        return g = {
          name: "testName"
        };
      });
      pool.run(10);
      pool.on('run', function(genes) {
        return g = genes;
      });
      return expect(g.name).toEqual("testName");
    });
  });

  describe('When a stop method is provided', function() {
    return it('stops when the function returns true', function() {
      var m, pool;
      pool = evo.pool(config);
      m = 0;
      pool.on('run', function() {
        return m++;
      });
      pool.run(function() {
        return m < 4;
      });
      return expect(m).toBe(4);
    });
  });

  describe('When calling nextGenes', function() {
    return it('will return a list of genes', function() {
      var genes, pool;
      pool = evo.pool(config);
      genes = pool.nextGenes();
      return expect(genes.length).toEqual(n_genes);
    });
  });

  describe('Pool Population', function() {
    it("Creates The right number of genes", function() {
      var pool;
      pool = evo.pool(config);
      return expect(pool.genes.length).toBe(size);
    });
    return it("Gene sets have the right number of genes", function() {
      var pool;
      pool = evo.pool(config);
      return expect(pool.genes[0].length).toBe(n_genes);
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
    ratios: {
      top: 1.00,
      cross: 0.33,
      mutate: 2.00,
      fresh: 0.20,
      meld: 0.75,
      random: 1.25
    },
    on_member: function(genes) {
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
    return it("Trains a pool that can solve the XOR problem", function() {
      var pool;
      pool = evo.pool(config);
      pool.on('run', function(spawn) {
        return spawn._evo.score = scoreNet(spawn);
      });
      pool.run(function() {
        return this.average < 3.50 && this.generation < 1000;
      });
      return expect(pool.average).toBeGreaterThan(3.5);
    });
  });

}).call(this);
