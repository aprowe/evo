## Classic Feed Forward Network

class FeedForward extends Network

    calc: (input)->
        if input.length != @config.input_nodes
            throw Error("Inputs dont match. Expected: #{@config.input_nodes}, Received: #{input.length}")
        # input.push 0 while input.length < @config.input

        copy = @weights[..].reverse()
        hidden_weights = []
        hidden_weights[j] = 0 for j in [0..@config.hidden_nodes-1]

        output_weights = []
        output_weights[j] = 0 for j in [0..@config.output_nodes-1]


        for i in input
            for h, j in hidden_weights
                hidden_weights[j] += i * copy.pop()


        for h, i in hidden_weights
            ## Threshold
            hidden_weights[i] += copy.pop()

            ## Normalize
            hidden_weights[i] = evo.util.tanh hidden_weights[i]

            for o, j in output_weights
                output_weights[j] += hidden_weights[i] * copy.pop()

        for o, i in output_weights
            output_weights[i] = evo.util.flatten output_weights[i]

        return output_weights[0] if output_weights.length == 1

        return output_weights

