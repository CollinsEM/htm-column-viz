// ===================================================================
// SYNAPSE
// -------------------------------------------------------------------
// Representation of a generic synapse
//
// input: Input neuron
// output: Output dendritic segment
// -------------------------------------------------------------------
class Synapse {
  constructor(dest) {
    this.dest = dest;
    this.perm = Math.random();
  }
  update() {
  }
};
