// ===================================================================
// SYNAPSE
// -------------------------------------------------------------------
// Representation of a generic synapse
//
// input: Input neuron
// output: Output dendritic segment
// -------------------------------------------------------------------
class Synapse {
  constructor(input, output) {
    this.input = input;
    this.output = output;
    // Initialize synapse permanence between 0.45 and 0.55
    this.perm = 0.1*(Math.random() - 0.5);
  }
  // Increase asymptomatically towards 1.0
  increasePerm() {
    this.perm += (1-this.perm)*this.learningRate;
  }
  // Decrease asymptomatically towards 0.0
  decreasePerm() {
    this.perm -= this.perm*this.forgettingRate;
  }
  // Update based on pre- and post-synaptic activity
  update() {
    
  }
};

Synapse.prototype.learningRate = 0.1;

Synapse.prototype.forgettingRate = 0.05;

