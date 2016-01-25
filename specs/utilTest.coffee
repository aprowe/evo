describe "Utility Functions", ->
  data = [0,1,2,3,4,5,6,7,8,9,10]

  it "Can find the mean of a data set", ->
    mean = evo.util.mean(data)
    expect(mean).toBe(5);

  it "Can find the deviance of a data set", ->
    std = evo.util.stddev(data)
    expect(std).toBeGreaterThan(3.16)
    expect(std).toBeLessThan(3.17)
