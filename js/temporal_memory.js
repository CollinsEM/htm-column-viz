//--------------------------------------------------------------------
// Temporal Sequence Memory Layer
//
// This layer consists of multiple mini-columns. Each minicolumn acts
// as a single bit in the Sparse Distributed Representation (SDR) for
// a given state of the system. The exact combination of nodes within
// the mini-columns helps to distinguish in which specific sequence
// the current state is participating.
//--------------------------------------------------------------------
class TemporalMemoryLayer extends THREE.Group {
  // NI, NJ     dimensions of the layer (2D array of minicolumns)
  // NPC        number of neurons per mini-column
  // numInputs  number of neurons in the input space
  constructor(NI, NJ, NPC, inputs) {
    super();
    this.numInputs = inputs.length;
    this.numColumns = NI*NJ;
    this.miniColumns = [];
    this.distThreshold = 0.5;
    this.proxThreshold = 0.5;
    // Initilize the mini-columns
    var dx = (NI>1 ? 2.0/(NI-1) : 1);
    var dz = (NJ>1 ? 2.0/(NJ-1) : 1);
    for (var j=0; j<NJ; ++j) {
      var z0 = j*dz - 1.0;
      for (var i=0; i<NI; ++i) {
        var x0 = i*dx - 1.0;
        var mc = new MiniColumn(NPC);
        mc.position.set(x0, 0, z0);
        mc.scale.set(1/NI, 1, 1/NJ);
        this.miniColumns.push(mc);
        this.add(mc);
      }
    }
    // Initialize the proximal and distal connections
    this.miniColumns.forEach( function(mc, i) {
      // For each mini-column, initialize its proximal connections to
      // the input nodes/columns
      mc.proxPerms = new Float32Array(this.numInputs);
      for (var k=0; k<this.numInputs; ++k) {
        // Choose a random permanence weight close to the proximal
        // synapse threshold.
        mc.proxPerms[k] = this.proxThreshold + 0.1*(Math.random() - 0.5);
        if (mc.proxPerms[k] > this.proxThreshold) {
          mc.proxNodes.push(k);
        }
      }
      // For each node within a mini-column, initialize its distal
      // connections to all other nodes in this layer.
      mc.nodeData.forEach( function(tgt, j) {
        tgt.distPerms = new Float32Array(NI*NJ*NPC);
        for (var m=0; m<this.numColumns; ++m) {
          for (var n=0; n<NPC; ++n) {
            // Choose a random permanence weight close to the distal
            // synapse threshold.
            tgt.distPerms[m*NPC+n] = this.distThreshold + 0.1*(Math.random() - 0.5);
            if (tgt.distPerms[m*NPC+n] > this.distThreshold) {
              tgt.distNodes.push({col: m, nod: n});
            }
          }
        }
      }, this);
    }, this);
  }
  setInput( input ) {
    this.updatePredictions();
    this.miniColumns.forEach( function(col, i) {
      col.activated = false;
      var sum = 0;
      col.proxNodes.forEach( function(nod, n) {
        if (input[nod].activated) sum++;
      }, this);
      if (sum > 5) {
        col.activated = true;
        if (col.predicted) {
          col.helper.material.color.setHex( 0x00FF00 );
        }
        else {
          col.helper.material.color.setHex( 0xFF0000 );
        }
      }
      else {
        if (col.predicted) {
          col.helper.material.color.setHex( 0x0000FF );
        }
        else {
          col.helper.material.color.setHex( 0x080808 );
        }
      }
    }, this );
  }
  //------------------------------------------------------------------
  // Update predictions within each minicolumn
  //------------------------------------------------------------------
  updatePredictions() {
    for (var i=0; i<this.numColumns; ++i) {
    // this.miniColumns.forEach( function(col, i) {
    //   col.predicted = false;
    //   col.nodeData.forEach( function(tgt, j) {
      var col = this.miniColumns[i];
      for (var j=0; j<this.NPC; ++j) {
        var tgt = col.nodeData[j];
        tgt.sum = 0;
        for (var k=0; k<tgt.distNodes.length; ++k) {
          var src = tgt.distNodes[k];
          // if (this.miniColumns[src.col].nodeData[src.nod].activated) sum++;
          if (this.miniColumns[src.col].activated) sum++;
        }
        if (sum > 5) {
          tgt.predicted = true;
          col.predicted = true;
        }
        else {
          tgt.predicted = false;
        }
      }
    }
  }
};
