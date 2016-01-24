
data = ({x:x/100 ,y: Math.pow(x/100.0,4)+2*Math.pow(x/100,3)+3*Math.pow(x/100,2)} for x in [0..100]);

describe "Line fitting test", ->

    it "Solves a line fitting problem", ->
        evalGenes = (genes)->
            poly = (x)->
                sum = 0
                for i in [0..4]
                    sum += genes[i]*Math.pow(x, i)
                return sum
            dist = 0;
            for p in data
                dist += Math.pow((poly(p.x) - p.y), 2)
            return -dist;

        pool = evo.pool({mutate_amount:10.0})
        pool.on 'run', (genes)->
          return evalGenes(genes)
