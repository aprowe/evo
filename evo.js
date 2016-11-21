/**
 * evo.js v0.2.4
 * Evolutionary Algorithm Tool wrapped with ANN
 * Copyright (c) 2016 Alex Rowe <aprowe@ucsc.edu>
 * Licensed MIT
 **/
(function() {
  var root,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  root = typeof window !== "undefined" && window !== null ? window : this;

  (function(factory) {
    if (typeof exports === 'object') {
      return module.exports = factory.call(root);
    } else if (typeof define === 'function' && define.amd) {
      return define(function() {
        return factory.call(root);
      });
    } else {
      return root.evo = factory.call(root);
    }
  })(function() {
    var Base, Cppn, FeedForward, Network, Pool, evo;
    evo = {};
    evo.population = function(config) {
      config = evo.util.extend(evo.config.pool, config);
      return new Pool(config);
    };
    evo.network = function(type, genes, config) {
      config = evo.util.extend(evo.config.network, config);
      if (type === 'feedforward') {
        return new FeedForward(genes, config);
      } else if (type === 'cppn') {
        return new Cppn(genes, config);
      }
    };
    evo.configure = function(config) {
      return evo.config = evo.util.extend(evo.config, config);
    };
    evo.config = {
      pool: {
        genes: 200,
        cross_rate: 0.05,
        mutate_rate: 0.05,
        mutate_amount: 1.0,
        precision: 1,
        size: 100,
        ratios: {
          top: 0.25,
          mutate: 0.25,
          cross: 0.25,
          random: 0.10,
          average: 0.05,
          fresh: 0.10
        },
        run_conditions: {
          generations: 1000,
          iterations: void 0,
          score: Infinity,
          auto_stop: false,
          min_generations: 10,
          "while": void 0
        },
        gene_options: [],
        on_breed: void 0,
        on_member: void 0,
        on_run: void 0,
        on_finish: void 0
      },
      network: {
        output_fn: 'tanh',
        output_nodes: 2,
        hidden_layers: 2,
        hidden_nodes: 2,
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
        if (mu == null) {
          mu = 0;
        }
        if (sigma == null) {
          sigma = 1;
        }
        return Math.exp(-(Math.pow(mu - x, 2)) * sigma);
      },
      linear: function(x, m, b) {
        if (m == null) {
          m = 1;
        }
        if (b == null) {
          b = 0;
        }
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
      step: function(x) {
        if (x < 0) {
          return -1;
        }
        return 1;
      },
      sample: function(array) {
        return array[Math.floor(Math.random() * array.length)];
      },
      shuffle: function(array) {
        var index, l, length, rand, ref, shuffled;
        length = array.length;
        shuffled = Array(length);
        for (index = l = 0, ref = length - 1; 0 <= ref ? l <= ref : l >= ref; index = 0 <= ref ? ++l : --l) {
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
            destination[property] = arguments.callee(destination[property], source[property]);
          } else {
            destination[property] = source[property];
          }
        }
        return destination;
      },
      normalize: function(obj) {
        var key, ratios, sum, value;
        sum = 0;
        for (key in obj) {
          value = obj[key];
          sum += value;
        }
        ratios = {};
        for (key in obj) {
          value = obj[key];
          if (!value) {
            value = 0;
          }
          ratios[key] = value / sum;
        }
        return ratios;
      },
      mean: function(data) {
        var N, d, l, len, sum;
        if ((data.length == null) || data.length === 0) {
          throw "data must be a list of numbers";
        }
        sum = 0;
        N = data.length;
        for (l = 0, len = data.length; l < len; l++) {
          d = data[l];
          sum += d;
        }
        return sum / N;
      },
      stddev: function(data) {
        var N, d, l, len, mean, sum;
        mean = evo.util.mean(data);
        N = data.length;
        sum = 0;
        for (l = 0, len = data.length; l < len; l++) {
          d = data[l];
          sum += (d - mean) * (d - mean);
        }
        return Math.sqrt(sum / N);
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
    Pool = (function(superClass) {
      extend(Pool, superClass);

      function Pool(config1) {
        var i, l, ref;
        this.config = config1;
        this._mutateGene = bind(this._mutateGene, this);
        this._setGeneOptions = bind(this._setGeneOptions, this);
        this.generation = 0;
        this.iteration = 0;
        this.genes = [];
        for (i = l = 1, ref = this.config.size; 1 <= ref ? l <= ref : l >= ref; i = 1 <= ref ? ++l : --l) {
          this.genes.push(this._freshGenes());
        }
        this.average = 0;
        this._prevGenes = this.genes.slice(0);
        this._scoredGenes = [];
        this._history = [];
        this._setGeneOptions(this.config.gene_options);
      }

      Pool.prototype.currentSize = function() {
        return this.genes.length;
      };

      Pool.prototype.constructMember = function(genes) {
        var member;
        if (genes == null) {
          genes = null;
        }
        member = this.trigger('member', genes);
        if (member == null) {
          return null;
        }
        member._evo = {};
        member._evo.genes = genes;
        member._evo.score = 0;
        member._evo.report = (function(_this) {
          return function() {
            return _this.report(member);
          };
        })(this);
        return member;
      };

      Pool.prototype.nextGenes = function() {
        var genes;
        genes = this.genes.pop();
        if (this.genes.length === 0) {
          if (this._scoredGenes.length > 0) {
            this._generate();
          } else {
            throw "Gene pool is empty";
          }
        }
        return genes;
      };

      Pool.prototype.nextGeneDict = function() {
        var gene, geneDict, genes, i, l, len, name;
        genes = this.nextGenes();
        geneDict = {
          _raw: genes
        };
        for (i = l = 0, len = genes.length; l < len; i = ++l) {
          gene = genes[i];
          name = i;
          if (this._geneOptions[i] != null) {
            name = this._geneOptions[i].name;
          }
          if ((this._geneOptions[i] != null) && (this._geneOptions[i].range != null)) {
            if (geneDict[name] != null) {
              geneDict[name].push(gene);
            } else {
              geneDict[name] = [gene];
            }
          } else {
            geneDict[name] = gene;
          }
        }
        return geneDict;
      };

      Pool.prototype.nextMember = function() {
        if (this.config.on_member == null) {
          return;
        }
        return this.constructMember(this.nextGenes());
      };

      Pool.prototype.report = function(genes, score) {
        if (score == null) {
          score = 0;
        }
        this.iteration++;
        if (genes._evo != null) {
          score = genes._evo.score;
          genes = genes._evo.genes;
        }
        if (genes._raw != null) {
          genes = genes._raw;
        }
        return this._scoredGenes.push({
          genes: genes,
          score: score
        });
      };

      Pool.prototype._checkRun = function(run_config) {
        var run;
        run = true;
        if (run_config.generations != null) {
          run = run && this.generation < run_config.generations;
        }
        if (run_config.iterations != null) {
          run = run && this.iteration < run_config.iterations;
        }
        if (run_config.score != null) {
          run = run && this.average < run_config.score;
        }
        if (run_config["while"] != null) {
          run = run && run_config["while"].call(this);
        }
        if (this._scoredGenes.length === 0 && run_config.auto_stop) {
          run = run && !this._autoStop(run_config);
        }
        return run;
      };

      Pool.prototype._autoStop = function(run_config) {
        var mean, stddev;
        if (this._history.length < run_config.min_generations) {
          return false;
        }
        stddev = evo.util.stddev(this._history.slice(this._history.length - this.config.min_generations, +(this._history.length - 2) + 1 || 9e9));
        mean = evo.util.mean(this._history.slice(this._history.length - this.config.min_generations, +(this._history.length - 2) + 1 || 9e9));
        return Math.abs(this._history[this._history.length - 1] - mean) > stddev * stddev;
      };

      Pool.prototype.run = function(run_config) {
        if (run_config == null) {
          run_config = {};
        }
        if (typeof run_config === 'number') {
          run_config = {
            iterations: run_config
          };
        } else if (typeof run_config === 'function') {
          run_config = {
            "while": run_config
          };
        }
        if (run_config.generations != null) {
          run_config.generations += this.generation;
        }
        if (run_config.iterations != null) {
          run_config.iterations += this.iteration;
        }
        run_config = evo.util.extend(this.config.run_conditions, run_config);
        while (this._checkRun(run_config)) {
          this._runOnce();
        }
        return this.trigger('finish');
      };

      Pool.prototype.bestGenes = function(number) {
        if (number == null) {
          return this._prevGenes[0];
        }
        return this._prevGenes.slice(0, +(number - 1) + 1 || 9e9);
      };

      Pool.prototype.loadGenes = function(genes) {
        this.genes = genes.slice(0);
        return this._scoredGenes = [];
      };

      Pool.prototype._freshGenes = function() {
        var i, l, ref, results;
        results = [];
        for (i = l = 1, ref = this.config.genes; 1 <= ref ? l <= ref : l >= ref; i = 1 <= ref ? ++l : --l) {
          results.push(evo.util.random() * this.config.mutate_amount);
        }
        return results;
      };

      Pool.prototype._cloneGenes = function(genes) {
        return genes.slice(0);
      };

      Pool.prototype._mutateGenes = function(genes) {
        var g, i, l, len, new_genes;
        new_genes = [];
        for (i = l = 0, len = genes.length; l < len; i = ++l) {
          g = genes[i];
          new_genes[i] = this._mutateGene(genes[i], this._geneOptions[i]);
        }
        return new_genes;
      };

      Pool.prototype._crossGenes = function(genes1, genes2) {
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

      Pool.prototype._averageGenes = function(genes1, genes2) {
        var g, i, l, len, new_genes;
        new_genes = [];
        for (i = l = 0, len = genes1.length; l < len; i = ++l) {
          g = genes1[i];
          new_genes.push((genes1[i] + genes2[i]) / 2);
        }
        return new_genes;
      };

      Pool.prototype._runOnce = function() {
        var member, score;
        member = this.nextMember() || this.nextGenes();
        score = this.trigger('run', member);
        if (member._evo != null) {
          return this.report(member);
        } else if (typeof score !== "undefined") {
          return this.report(member, score);
        } else {
          throw "score was not returned in run function";
        }
      };

      Pool.prototype._generate = function() {
        var a, g1, g2, i, l, len, n, p, q, r, ratios, ref, ref1, ref2, ref3, scores, size, top_pool;
        ratios = evo.util.normalize(this.config.ratios);
        this.genes = [];
        scores = (function() {
          var l, len, ref, results;
          ref = this._scoredGenes;
          results = [];
          for (l = 0, len = ref.length; l < len; l++) {
            a = ref[l];
            results.push(a.score);
          }
          return results;
        }).call(this);
        this.average = evo.util.mean(scores);
        this._scoredGenes = this._scoredGenes.sort(function(a, b) {
          return a.score - b.score;
        });
        top_pool = this._scoredGenes.reverse().slice(0, +(this.config.ratios.top * this.config.size) + 1 || 9e9);
        this._history.push(top_pool[0].score);
        size = this.config.size;
        if (size < 1) {
          size = 0;
        }
        for (l = 0, len = top_pool.length; l < len; l++) {
          a = top_pool[l];
          this.genes.push(this._cloneGenes(a.genes));
        }
        if (ratios.mutate > 0) {
          for (i = n = 1, ref = ratios.mutate * size; 1 <= ref ? n <= ref : n >= ref; i = 1 <= ref ? ++n : --n) {
            this.genes.push(this._mutateGenes(evo.util.sample(top_pool).genes));
          }
        }
        if (ratios.cross > 0) {
          for (i = p = 1, ref1 = ratios.cross * size; 1 <= ref1 ? p <= ref1 : p >= ref1; i = 1 <= ref1 ? ++p : --p) {
            g1 = evo.util.sample(top_pool).genes;
            g2 = evo.util.sample(top_pool).genes;
            this.genes.push(this._crossGenes(g1, g2));
          }
        }
        if (ratios.average > 0) {
          for (i = q = 1, ref2 = ratios.meld * size; 1 <= ref2 ? q <= ref2 : q >= ref2; i = 1 <= ref2 ? ++q : --q) {
            g1 = evo.util.sample(top_pool).genes;
            g2 = evo.util.sample(top_pool).genes;
            this.genes.push(this._averageGenes(g1, g2));
          }
        }
        if (ratios.random > 0) {
          for (i = r = 1, ref3 = ratios.random * size; 1 <= ref3 ? r <= ref3 : r >= ref3; i = 1 <= ref3 ? ++r : --r) {
            this.genes.push(this._cloneGenes(evo.util.sample(this._scoredGenes).genes));
          }
        }
        while (this.genes.length <= size) {
          this.genes.push(this._freshGenes());
        }
        this.generation++;
        this._prevGenes = this.genes.slice(0);
        this.genes = evo.util.shuffle(this.genes);
        this.trigger('breed');
        return this._scoredGenes = [];
      };

      Pool.prototype._setGeneOptions = function(options) {
        var index, j, l, len, option, results;
        this._geneOptions = [];
        results = [];
        for (index = l = 0, len = options.length; l < len; index = ++l) {
          option = options[index];
          if (option.range != null) {
            results.push((function() {
              var n, ref, ref1, results1;
              results1 = [];
              for (j = n = ref = option.range[0], ref1 = option.range[1]; ref <= ref1 ? n <= ref1 : n >= ref1; j = ref <= ref1 ? ++n : --n) {
                results1.push(this._geneOptions[j] = option);
              }
              return results1;
            }).call(this));
          } else {
            results.push(this._geneOptions[index] = option);
          }
        }
        return results;
      };

      Pool.prototype._mutateGene = function(gene, options) {
        var i, l, ref, value;
        if (options == null) {
          options = {};
        }
        value = gene;
        options.mutate_amount || (options.mutate_amount = this.config.mutate_amount);
        options.mutate_rate || (options.mutate_rate = this.config.mutate_rate);
        options.precision || (options.precision = this.config.precision);
        for (i = l = 0, ref = options.precision; 0 <= ref ? l <= ref : l >= ref; i = 0 <= ref ? ++l : --l) {
          if (options.mutate_rate > evo.util.random()) {
            value += evo.util.random() * options.mutate_amount * Math.exp(-i);
          }
        }
        if ((options.max != null) && gene > options.max) {
          value = options.max;
        } else if ((options.min != null) && gene < options.min) {
          value = options.min;
        }
        return value;
      };

      return Pool;

    })(Base);
    Network = (function() {
      function Network(weights, config1) {
        this.weights = weights;
        this.config = config1;
        if (typeof this.config.output_fn === 'function') {
          this.output_fn = this.config.output_fn;
        } else if (this.config.output_fn === 'linear') {
          this.output_fn = evo.util.linear;
        } else if (this.config.output_fn === 'step') {
          this.output_fn = evo.util.step;
        } else {
          this.output_fn = evo.util.tanh;
        }
      }

      Network.prototype.calc = function(input) {};

      return Network;

    })();
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
        var copy, i, j, l, n, ref, ref1;
        this.config = config1;
        this.node_fn = [];
        copy = genes.slice(0);
        for (i = l = 0, ref = this.config.hidden_layers - 1; 0 <= ref ? l <= ref : l >= ref; i = 0 <= ref ? ++l : --l) {
          this.node_fn[i] = [];
          for (j = n = 0, ref1 = this.config.hidden_nodes - 1; 0 <= ref1 ? n <= ref1 : n >= ref1; j = 0 <= ref1 ? ++n : --n) {
            this.node_fn[i].push(this.get_fn(copy.pop()));
          }
        }
        this.weights = copy.slice(0);
        Cppn.__super__.constructor.call(this, this.weights, this.config);
      }

      Cppn.prototype.calc = function(input) {
        var copy, hidden_weights, i, j, k, l, layer_size, len, n, output, p, q, r, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, s, t, u, v, x;
        layer_size = this.config.hidden_nodes;
        copy = this.weights.slice(0);
        hidden_weights = [];
        for (k = l = 0, ref = this.config.hidden_layers - 1; 0 <= ref ? l <= ref : l >= ref; k = 0 <= ref ? ++l : --l) {
          hidden_weights[k] = [];
          for (i = n = 0, ref1 = this.config.hidden_nodes - 1; 0 <= ref1 ? n <= ref1 : n >= ref1; i = 0 <= ref1 ? ++n : --n) {
            hidden_weights[k][i] = 0;
          }
        }
        for (p = 0, len = input.length; p < len; p++) {
          x = input[p];
          for (i = q = 0, ref2 = this.config.hidden_nodes - 1; 0 <= ref2 ? q <= ref2 : q >= ref2; i = 0 <= ref2 ? ++q : --q) {
            hidden_weights[0][i] += x * copy.pop();
          }
        }
        for (k = r = 0, ref3 = this.config.hidden_layers - 2; 0 <= ref3 ? r <= ref3 : r >= ref3; k = 0 <= ref3 ? ++r : --r) {
          for (i = s = 0, ref4 = this.config.hidden_nodes - 1; 0 <= ref4 ? s <= ref4 : s >= ref4; i = 0 <= ref4 ? ++s : --s) {
            hidden_weights[k][i] = this.node_fn[k][i](hidden_weights[k][i], copy.pop(), copy.pop());
            if (!(k + 1 < this.config.hidden_layers)) {
              continue;
            }
            for (j = t = 0, ref5 = this.config.hidden_nodes - 1; 0 <= ref5 ? t <= ref5 : t >= ref5; j = 0 <= ref5 ? ++t : --t) {
              hidden_weights[k + 1][j] += hidden_weights[k][i] * copy.pop();
            }
          }
        }
        output = [];
        for (j = u = 0, ref6 = this.config.output_nodes - 1; 0 <= ref6 ? u <= ref6 : u >= ref6; j = 0 <= ref6 ? ++u : --u) {
          output[j] = 0;
          for (i = v = 0, ref7 = this.config.hidden_nodes - 1; 0 <= ref7 ? v <= ref7 : v >= ref7; i = 0 <= ref7 ? ++v : --v) {
            output[j] += hidden_weights[this.config.hidden_layers - 1][i] * copy.pop();
          }
          output[j] = this.output_fn(output[j]);
        }
        return output;
      };

      return Cppn;

    })(Network);
    FeedForward = (function(superClass) {
      extend(FeedForward, superClass);

      function FeedForward(weights, config1) {
        this.weights = weights;
        this.config = config1;
        FeedForward.__super__.constructor.call(this, this.weights, this.config);
      }

      FeedForward.prototype.calc = function(input) {
        var copy, h, hidden_weights, i, j, l, len, len1, len2, len3, len4, n, o, output_weights, p, q, r, ref, ref1, s, t;
        if (input.length !== this.config.input_nodes) {
          throw Error("Inputs dont match. Expected: " + this.config.input_nodes + ", Received: " + input.length);
        }
        copy = this.weights.slice(0).reverse();
        hidden_weights = [];
        for (j = l = 0, ref = this.config.hidden_nodes - 1; 0 <= ref ? l <= ref : l >= ref; j = 0 <= ref ? ++l : --l) {
          hidden_weights[j] = 0;
        }
        output_weights = [];
        for (j = n = 0, ref1 = this.config.output_nodes - 1; 0 <= ref1 ? n <= ref1 : n >= ref1; j = 0 <= ref1 ? ++n : --n) {
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
          output_weights[i] = this.output_fn(output_weights[i]);
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
