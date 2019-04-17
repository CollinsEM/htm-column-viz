// ===================================================================
// NEURON
// -------------------------------------------------------------------
// Representation of a pyramidal neuron.
// -------------------------------------------------------------------
class Neuron {
  constructor(px, py, pz) {
    this.pos = { x: px, y: py, z: pz };
    this.predicted = false;
    this.activated = false;
    this.distNodes = [];
    this.distPerms = undefined;
  }
};
