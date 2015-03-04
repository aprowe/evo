(function() {
  var ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  (function(root, factory) {
    if (typeof exports === 'object') {
      return module.exports = factory.call(root);
    } else if (typeof define === 'function' && define.amd) {
      return define(function() {
        return factory.call(root);
      });
    } else {
      return root.evo = factory.call(root);
    }
  })((ref = typeof window !== "undefined" && window !== null) != null ? ref : {
    window: this
  }, function() {
    var Base, Cppn, FeedForward, Network, Pool, evo;
    evo = {};
    evo.config = {
      pool: {
        n_genes: 200,
        cross_rate: 0.05,
        mutate_rate: 0.05,
        mutate_amount: 1.0,
        size: 100,
        ratios: {
          top: 0.25,
          mutate: 0.25,
          cross: 0.25,
          random: 0.10,
          meld: 0.00
        },
        on_breed: function() {},
        on_spawn: void 0,
        on_run: function() {},
        on_finish: function() {}
      },
      network: {
        hidden_layers: 2,
        hidden_nodes: 4,
        output_nodes: 3,
        input_nodes: 2
      }
    };
    evo.util = {
      random: function(min, max) {
        if (min == null) {
          min = -1;
        }
        if (max == null) {
          max = 1;
        }
        return (Math.random() * (max - min)) + min;
      },
      sin: function(x, freq, phase) {
        if (freq == null) {
          freq = 1;
        }
        if (phase == null) {
          phase = 0;
        }
        return Math.sin(x * freq * 6.2832 + phase);
      },
      gaussian: function(x, mu, sigma) {
        return Math.exp(-(Math.pow(mu - x, 2)) * sigma);
      },
      linear: function(x, m, b) {
        return (x + b) * m;
      },
      flatten: function(x) {
        if (x > 1) {
          return 1;
        }
        if (x < -1) {
          return -1;
        }
        return x;
      },
      tanh: function(x) {
        var x1, x2;
        if (-3 > x || x > 3) {
          return evo.util.flatten(x);
        } else {
          x1 = Math.exp(x);
          x2 = Math.exp(-x);
          return (x1 - x2) / (x1 + x2);
        }
      },
      sample: function(array) {
        return array[Math.floor(Math.random() * array.length)];
      },
      shuffle: function(array) {
        var index, l, length, rand, ref1, shuffled;
        length = array.length;
        shuffled = Array(length);
        for (index = l = 0, ref1 = length - 1; 0 <= ref1 ? l <= ref1 : l >= ref1; index = 0 <= ref1 ? ++l : --l) {
          rand = Math.floor(Math.random() * index);
          if (rand !== index) {
            shuffled[index] = shuffled[rand];
          }
          shuffled[rand] = array[index];
        }
        return shuffled;
      },
      clone: function(obj) {
        var attr, copy;
        if (null === obj || "object" !== typeof obj) {
          return obj;
        }
        copy = obj.constructor();
        for (attr in obj) {
          if (obj.hasOwnProperty(attr)) {
            copy[attr] = obj[attr];
          }
        }
        return copy;
      },
      extend: function(destination, source) {
        var property;
        destination = evo.util.clone(destination);
        if (source == null) {
          return destination;
        }
        for (property in source) {
          if (source[property] && source[property].constructor && source[property].constructor === Object) {
            destination[property] = destination[property] || {};
            arguments.callee(destination[property], source[property]);
          } else {
            destination[property] = source[property];
          }
        }
        return destination;
      }
    };
    Base = (function() {
      function Base() {}

      Base.prototype.config = {};

      Base.prototype.on = function(name, fn) {
        this.config['on_' + name] = fn;
        return this;
      };

      Base.prototype.trigger = function(name, args) {
        if (args == null) {
          args = null;
        }
        if (this.config['on_' + name] != null) {
          return this.config['on_' + name].call(this, args);
        }
      };

      return Base;

    })();
    evo.pool = function(config) {
      config = evo.util.extend(evo.config.pool, config);
      return new Pool(config);
    };
    Pool = (function(superClass) {
      extend(Pool, superClass);

      function Pool(config1) {
        var i, l, ref1;
        this.config = config1;
        this.generation = 0;
        this.pool = [];
        this.breedpool = [];
        this.last_genes = {};
        for (i = l = 1, ref1 = this.config.size; 1 <= ref1 ? l <= ref1 : l >= ref1; i = 1 <= ref1 ? ++l : --l) {
          this.pool.push(this.fresh());
        }
        this.prev_pool = this.pool.slice(0);
        this.average = 0;
      }

      Pool.prototype.fresh = function() {
        var i, l, ref1, results;
        results = [];
        for (i = l = 1, ref1 = this.config.n_genes; 1 <= ref1 ? l <= ref1 : l >= ref1; i = 1 <= ref1 ? ++l : --l) {
          results.push(evo.util.random() * this.config.mutate_amount);
        }
        return results;
      };

      Pool.prototype.clone = function(genes) {
        return genes.slice(0);
      };

      Pool.prototype.mutate = function(genes) {
        var g, i, l, len, new_genes;
        new_genes = [];
        for (i = l = 0, len = genes.length; l < len; i = ++l) {
          g = genes[i];
          new_genes[i] = genes[i];
          if (Math.random() < this.config.mutate_rate) {
            new_genes[i] += evo.util.random() * this.config.mutate_amount;
          }
        }
        return new_genes;
      };

      Pool.prototype.cross = function(genes1, genes2) {
        var flip, g, i, l, len, new_genes;
        new_genes = [];
        flip = false;
        for (i = l = 0, len = genes1.length; l < len; i = ++l) {
          g = genes1[i];
          if (Math.random() < this.config.cross_rate) {
            flip = !flip;
          }
          new_genes.push((flip ? genes1[i] : genes2[i]));
        }
        return new_genes;
      };

      Pool.prototype.meld = function(genes1, genes2) {
        var g, i, l, len, new_genes;
        new_genes = [];
        for (i = l = 0, len = genes1.length; l < len; i = ++l) {
          g = genes1[i];
          new_genes.push((genes1[i] + genes2[i]) / 2);
        }
        return new_genes;
      };

      Pool.prototype.spawn = function() {
        var genes, spec;
        genes = this.next();
        spec = this.trigger('spawn', genes);
        spec.genes = genes;
        spec.score = 0;
        spec.report = (function(_this) {
          return function() {
            return _this.report(spec);
          };
        })(this);
        return spec;
      };

      Pool.prototype.next = function() {
        if (this.pool.length === 0) {
          if (this.breedpool.length > 0) {
            this.generate();
          } else {
            return this.last = this.fresh();
          }
        }
        return this.last = this.pool.pop();
      };

      Pool.prototype.run = function(stop_fn) {
        if (typeof stop_fn === 'number') {
          this.config.on_stop = function() {
            return this.generation < stop_fn;
          };
        } else if (typeof stop_fn === 'function') {
          this.config.on_stop = stop_fn;
        }
        while (!this.trigger('stop')) {
          this.trigger('run');
        }
        return this.trigger('finish');
      };

      Pool.prototype.report = function(genes, score) {
        if (score == null) {
          score = 0;
        }
        if ((genes.score != null) && (genes.genes != null)) {
          score = genes.score;
          genes = genes.genes;
        }
        if (genes == null) {
          genes = this.last_genes;
        }
        return this.breedpool.push({
          genes: genes,
          score: score
        });
      };

      Pool.prototype.mean = function(pool) {
        var a, avg, l, len;
        avg = 0;
        for (l = 0, len = pool.length; l < len; l++) {
          a = pool[l];
          avg += a.score;
        }
        return avg /= pool.length;
      };

      Pool.prototype.generate = function() {
        var a, g1, g2, i, l, len, n, p, q, r, ref1, ref2, ref3, ref4, size, top_pool;
        this.pool = [];
        this.average = this.mean(this.breedpool);
        this.breedpool = this.breedpool.sort(function(a, b) {
          return a.score - b.score;
        });
        top_pool = this.breedpool.reverse().slice(0, +(this.config.ratios.top * this.config.size) + 1 || 9e9);
        size = this.config.size;
        if (size < 1) {
          size = 0;
        }
        for (l = 0, len = top_pool.length; l < len; l++) {
          a = top_pool[l];
          this.pool.push(this.clone(a.genes));
        }
        for (i = n = 1, ref1 = this.config.ratios.mutate * size; 1 <= ref1 ? n <= ref1 : n >= ref1; i = 1 <= ref1 ? ++n : --n) {
          this.pool.push(this.mutate(evo.util.sample(top_pool).genes));
        }
        for (i = p = 1, ref2 = this.config.ratios.cross * size; 1 <= ref2 ? p <= ref2 : p >= ref2; i = 1 <= ref2 ? ++p : --p) {
          g1 = evo.util.sample(top_pool).genes;
          g2 = evo.util.sample(top_pool).genes;
          this.pool.push(this.cross(g1, g2));
        }
        for (i = q = 1, ref3 = this.config.ratios.meld * size; 1 <= ref3 ? q <= ref3 : q >= ref3; i = 1 <= ref3 ? ++q : --q) {
          g1 = evo.util.sample(top_pool).genes;
          g2 = evo.util.sample(top_pool).genes;
          this.pool.push(this.meld(g1, g2));
        }
        for (i = r = 1, ref4 = this.config.ratios.random * size; 1 <= ref4 ? r <= ref4 : r >= ref4; i = 1 <= ref4 ? ++r : --r) {
          this.pool.push(this.clone(evo.util.sample(this.breedpool).genes));
        }
        while (this.pool.length < size) {
          this.pool.push(this.fresh());
        }
        this.generation++;
        this.prev_pool = this.pool.map(function(g) {
          return g.map(function(d) {
            return Math.round(d * 100) / 100;
          });
        });
        this.pool = evo.util.shuffle(this.pool);
        this.trigger('breed');
        return this.breedpool = [];
      };

      Pool.prototype.load = function(genes) {
        this.pool = genes.slice(0);
        return this.breedpool = [];
      };

      return Pool;

    })(Base);
    Network = (function() {
      function Network(weights, config1) {
        this.weights = weights;
        this.config = config1;
      }

      Network.prototype.calc = function(input) {};

      return Network;

    })();
    evo.network = function(type, genes, config) {
      config = evo.util.extend(evo.config.network, config);
      if (type === 'feedforward') {
        return new FeedForward(genes, config);
      } else if (type === 'cppn') {
        return new Cppn(genes, config);
      }
    };
    Cppn = (function(superClass) {
      extend(Cppn, superClass);

      Cppn.node_fn = [
        evo.util.gaussian, evo.util.sin, function(x, m, b) {
          return evo.util.tanh(evo.util.linear(x, m, b));
        }
      ];

      Cppn.prototype.get_fn = function(gene) {
        var index;
        index = Math.round(Math.abs(gene) * Cppn.node_fn.length) % Cppn.node_fn.length;
        return Cppn.node_fn[index];
      };

      function Cppn(genes, config1) {
        var copy, i, j, l, n, ref1, ref2;
        this.config = config1;
        this.node_fn = [];
        copy = genes.slice(0);
        for (i = l = 0, ref1 = this.config.hidden_layers - 1; 0 <= ref1 ? l <= ref1 : l >= ref1; i = 0 <= ref1 ? ++l : --l) {
          this.node_fn[i] = [];
          for (j = n = 0, ref2 = this.config.hidden_nodes - 1; 0 <= ref2 ? n <= ref2 : n >= ref2; j = 0 <= ref2 ? ++n : --n) {
            this.node_fn[i].push(this.get_fn(copy.pop()));
          }
        }
        this.weights = copy.slice(0);
      }

      Cppn.prototype.calc = function(input) {
        var copy, hidden_weights, i, j, k, l, layer_size, len, n, output, p, q, r, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, s, t, u, v, x;
        layer_size = this.config.hidden_nodes;
        copy = this.weights.slice(0);
        hidden_weights = [];
        for (k = l = 0, ref1 = this.config.hidden_layers - 1; 0 <= ref1 ? l <= ref1 : l >= ref1; k = 0 <= ref1 ? ++l : --l) {
          hidden_weights[k] = [];
          for (i = n = 0, ref2 = this.config.hidden_nodes - 1; 0 <= ref2 ? n <= ref2 : n >= ref2; i = 0 <= ref2 ? ++n : --n) {
            hidden_weights[k][i] = 0;
          }
        }
        for (p = 0, len = input.length; p < len; p++) {
          x = input[p];
          for (i = q = 0, ref3 = this.config.hidden_nodes - 1; 0 <= ref3 ? q <= ref3 : q >= ref3; i = 0 <= ref3 ? ++q : --q) {
            hidden_weights[0][i] += x * copy.pop();
          }
        }
        for (k = r = 0, ref4 = this.config.hidden_layers - 2; 0 <= ref4 ? r <= ref4 : r >= ref4; k = 0 <= ref4 ? ++r : --r) {
          for (i = s = 0, ref5 = this.config.hidden_nodes - 1; 0 <= ref5 ? s <= ref5 : s >= ref5; i = 0 <= ref5 ? ++s : --s) {
            hidden_weights[k][i] = this.node_fn[k][i](hidden_weights[k][i], copy.pop(), copy.pop());
            if (!(k + 1 < this.config.hidden_layers)) {
              continue;
            }
            for (j = t = 0, ref6 = this.config.hidden_nodes - 1; 0 <= ref6 ? t <= ref6 : t >= ref6; j = 0 <= ref6 ? ++t : --t) {
              hidden_weights[k + 1][j] += hidden_weights[k][i] * copy.pop();
            }
          }
        }
        output = [];
        for (j = u = 0, ref7 = this.config.output_nodes - 1; 0 <= ref7 ? u <= ref7 : u >= ref7; j = 0 <= ref7 ? ++u : --u) {
          output[j] = 0;
          for (i = v = 0, ref8 = this.config.hidden_nodes - 1; 0 <= ref8 ? v <= ref8 : v >= ref8; i = 0 <= ref8 ? ++v : --v) {
            output[j] += hidden_weights[this.config.hidden_layers - 1][i] * copy.pop();
          }
          output[j] = evo.util.tanh(output[j]);
        }
        return output;
      };

      return Cppn;

    })(Network);
    FeedForward = (function(superClass) {
      extend(FeedForward, superClass);

      function FeedForward() {
        return FeedForward.__super__.constructor.apply(this, arguments);
      }

      FeedForward.prototype.calc = function(input) {
        var copy, h, hidden_weights, i, j, l, len, len1, len2, len3, len4, n, o, output_weights, p, q, r, ref1, ref2, s, t;
        if (input.length !== this.config.input_nodes) {
          throw Error("Inputs dont match. Expected: " + this.config.input_nodes + ", Received: " + input.length);
        }
        copy = this.weights.slice(0).reverse();
        hidden_weights = [];
        for (j = l = 0, ref1 = this.config.hidden_nodes - 1; 0 <= ref1 ? l <= ref1 : l >= ref1; j = 0 <= ref1 ? ++l : --l) {
          hidden_weights[j] = 0;
        }
        output_weights = [];
        for (j = n = 0, ref2 = this.config.output_nodes - 1; 0 <= ref2 ? n <= ref2 : n >= ref2; j = 0 <= ref2 ? ++n : --n) {
          output_weights[j] = 0;
        }
        for (p = 0, len = input.length; p < len; p++) {
          i = input[p];
          for (j = q = 0, len1 = hidden_weights.length; q < len1; j = ++q) {
            h = hidden_weights[j];
            hidden_weights[j] += i * copy.pop();
          }
        }
        for (i = r = 0, len2 = hidden_weights.length; r < len2; i = ++r) {
          h = hidden_weights[i];
          hidden_weights[i] += copy.pop();
          hidden_weights[i] = evo.util.tanh(hidden_weights[i]);
          for (j = s = 0, len3 = output_weights.length; s < len3; j = ++s) {
            o = output_weights[j];
            output_weights[j] += hidden_weights[i] * copy.pop();
          }
        }
        for (i = t = 0, len4 = output_weights.length; t < len4; i = ++t) {
          o = output_weights[i];
          output_weights[i] = evo.util.flatten(output_weights[i]);
        }
        if (output_weights.length === 1) {
          return output_weights[0];
        }
        return output_weights;
      };

      return FeedForward;

    })(Network);
    return evo;
  });

}).call(this);
