// ===================================================================
// PROXIMAL DENDRITIC SEGMENT
// -------------------------------------------------------------------
// Representation of a proximal dendritic segment.  These connections
// convey feed-forward information from other layers.  These
// feed-forward connections are what actually cause the neuron to
// activate.
//
// neuron: Parent neuron for this segment
// pool: Pool of potential neurons to which this segment could connect
// -------------------------------------------------------------------
class ProximalSegment {
  constructor(neuron, pool) {
    this.neuron = parent;
    this.synapses = new Set();
    if (pool) this.generateSynapses(pool);
  }
  generateSynapses(pool) {
    pool.forEach( function(n) {
      this.synapses.push(new Synapse(n, this));
    }, this);
  }
};
