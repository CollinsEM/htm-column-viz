// ===================================================================
// NEURON
// -------------------------------------------------------------------
// Representation of a pyramidal neuron.
// -------------------------------------------------------------------
class Neuron {
  constructor(px, py, pz, id) {
    this.id = id;
    this.pos = { x: px, y: py, z: pz };
    this.predicted = false;
    this.activated = false;
    this.distNodes = new Set();
    this.distPerms = new Map();
  }
  initDistalSynapes(layer) {
  }
};
