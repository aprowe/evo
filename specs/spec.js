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
  var data, x;

  data = (function() {
    var j, results;
    results = [];
    for (x = j = 0; j <= 100; x = ++j) {
      results.push({
        x: x / 100,
        y: Math.pow(x / 100.0, 4) + 2 * Math.pow(x / 100, 3) + 3 * Math.pow(x / 100, 2)
      });
    }
    return results;
  })();

  describe("Line fitting test", function() {
    return it("Solves a line fitting problem", function() {
      var evalGenes, pool;
      evalGenes = function(genes) {
        var dist, j, len, p, poly;
        poly = function(x) {
          var i, j, sum;
          sum = 0;
          for (i = j = 0; j <= 4; i = ++j) {
            sum += genes[i] * Math.pow(x, i);
          }
          return sum;
        };
        dist = 0;
        for (j = 0, len = data.length; j < len; j++) {
          p = data[j];
          dist += Math.pow(poly(p.x) - p.y, 2);
        }
        return -dist;
      };
      pool = evo.pool({
        mutate_amount: 10.0
      });
      return pool.on('run', function(genes) {
        return evalGenes(genes);
      });
    });
  });

}).call(this);

(function() {
  var config, n_genes, size;

  n_genes = 10;

  size = 400;

  config = {
    genes: n_genes,
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
      pool.on('run', function() {
        return 0.5;
      });
      expect(pool.genes.length).toBe(size);
      pool.run(1);
      expect(pool.genes.length).toBe(size - 1);
      pool.run(size);
      return expect(pool.genes.length).toBe(size);
    });
    return it("Gene sets have the right number of genes", function() {
      var pool;
      pool = evo.pool(config);
      return expect(pool.genes[0].length).toBe(n_genes);
    });
  });

  describe("When running a simulation", function() {
    it("Keeps a history of previous averages", function() {
      var pool;
      pool = evo.pool(config);
      pool.on("run", function(genes) {
        return 0.5;
      });
      pool.run(size);
      expect(pool.average).toBe(0.5);
      expect(pool._history[0]).toBe(0.5);
      pool.run(size * 9);
      return expect(pool._history.length).toBe(pool.generation);
    });
    return it("increments generation count after all members tested", function() {
      var pool;
      pool = evo.pool(config);
      pool.on("run", function(genes) {
        return 0.5;
      });
      expect(pool.generation).toBe(0);
      pool.run(size);
      expect(pool.generation).toBe(1);
      pool.run(size + 1);
      expect(pool.generation).toBe(2);
      pool.run(size + 1);
      return expect(pool.generation).toBe(3);
    });
  });

  describe("Run Configuration object", function() {
    it("Will run a specific amount of iterations", function() {
      var pool, run_config;
      pool = evo.pool(config);
      pool.on("run", function() {
        return 0.5;
      });
      run_config = {
        iterations: 1234
      };
      pool.run(run_config);
      return expect(pool.iteration).toBe(1234);
    });
    it("will run a specific amount of generations", function() {
      var pool, run_config;
      pool = evo.pool(config);
      pool.on("run", function() {
        return 0.5;
      });
      run_config = {
        generations: 111
      };
      pool.run(run_config);
      return expect(pool.generation).toBe(111);
    });
    it("will stop when a specific max score is reached", function() {
      var pool, run_config;
      pool = evo.pool(config);
      pool.on("run", function(g) {
        return g[0];
      });
      run_config = {
        score: 2.0
      };
      pool.run(run_config);
      return expect(pool.average).toBeGreaterThan(2.0);
    });
    it("will stop when a while function returns false", function() {
      var i, pool, run_config;
      pool = evo.pool(config);
      pool.on("run", function(g) {
        return g[0];
      });
      i = 0;
      run_config = {
        "while": function() {
          return i++ < 145;
        }
      };
      pool.run(run_config);
      return expect(i).toBe(146);
    });
    it("will autodetect when score is optimized", function() {
      var pool, run_config;
      pool = evo.pool(config);
      pool.on("run", function(genes) {
        return -Math.abs(genes[0]);
      });
      run_config = {
        auto_stop: true,
        generations: 100
      };
      pool.run(run_config);
      return expect(pool.average).toBeLessThan(0.1);
    });
    it("will autodetect when score is not improving", function() {
      var i, pool, run_config;
      pool = evo.pool(config);
      i = 0;
      pool.on("run", function(genes) {
        return i++;
      });
      run_config = {
        auto_stop: true,
        generations: 100
      };
      pool.run(run_config);
      return expect(pool.generation).toBe(100);
    });
    it("Can call subsequent run calls for generations", function() {
      var pool, run_config;
      pool = evo.pool(config);
      pool.on("run", function(genes) {
        return 0.0;
      });
      run_config = {
        generations: 100
      };
      pool.run(run_config);
      expect(pool.generation).toBe(100);
      pool.run(run_config);
      return expect(pool.generation).toBe(200);
    });
    return it("Can call subsequent run calls for iterations", function() {
      var pool, run_config;
      pool = evo.pool(config);
      pool.on("run", function(genes) {
        return 0.0;
      });
      run_config = {
        iterations: 100
      };
      pool.run(run_config);
      expect(pool.iteration).toBe(100);
      pool.run(run_config);
      return expect(pool.iteration).toBe(200);
    });
  });

}).call(this);

(function() {
  describe("Utility Functions", function() {
    var data;
    data = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    it("Can find the mean of a data set", function() {
      var mean;
      mean = evo.util.mean(data);
      return expect(mean).toBe(5);
    });
    return it("Can find the deviance of a data set", function() {
      var std;
      std = evo.util.stddev(data);
      expect(std).toBeGreaterThan(3.16);
      return expect(std).toBeLessThan(3.17);
    });
  });

}).call(this);

(function() {
  var config, scoreNet;

  config = {
    genes: 10,
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
      pool.run({
        auto_stop: true,
        generations: 100
      });
      return expect(pool.average).toBeGreaterThan(3.5);
    });
  });

}).call(this);
