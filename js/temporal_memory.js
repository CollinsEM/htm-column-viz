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
    // Initilize the mini-columns
    var dx = (NI>1 ? 2.0/(NI-1) : 1);
    var dz = (NJ>1 ? 2.0/(NJ-1) : 1);
    for (var j=0; j<NJ; ++j) {
      var z0 = j*dz - 1.0;
      for (var i=0; i<NI; ++i) {
        var x0 = i*dx - 1.0;
        var mc = new MiniColumn(NPC, this.numInputs);
        mc.position.set(x0, 0, z0);
        mc.scale.set(1/NI, 1, 1/NJ);
        this.miniColumns.push(mc);
        this.add(mc);
      }
    }
  }
  setInput( input ) {
    this.miniColumns.forEach( function(col, i) {
      col.activated = false;
      col.proxSum = 0;
      col.proxNodes.forEach( function(nod, n) {
        if (input[nod].activated) col.proxSum++;
      }, this);
      if (col.proxSum > 5) {
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
    var COLS = this.miniColumns;
    COLS.forEach( function(mcL, iL) {
      mcL.predicted = false;
      mcL.nodeData.forEach( function(nodL, jL) {
        nodL.distalSum = 0;
        COLS.forEach( function(mcR, iR) {
          mcR.nodeData.forEach( function(nodR, jR) {
            if (nodR.activated) nodL.distalSum++;
          nod.predicted = true;
          mc.nodeCol[3*n + 2] = 1.0;
          mc.nodeSiz[n] = 100;
          mc.predicted = true;
        }
        else if (nod.predicted) {
          mc.nodeCol[3*n + 0] *= 0.95;
          mc.nodeCol[3*n + 1] *= 0.95;
          mc.nodeCol[3*n + 2] *= 0.95;
          mc.nodeSiz[n] *= 0.95;
          nod.predicted = (mc.nodeSiz[n] > 5);
          mc.predicted = true;
        }
      } );
	    mc.colAttrib.needsUpdate = true;
	    mc.sizAttrib.needsUpdate = true;
      //   this.miniColumns[i].nodeData[j].sum = 0;
      //   for (var k=0; k<this.miniColumns[i].nodeData[j].distNodes.length; ++k) {
      //     var c = this.miniColumns[i].nodeData[j].distNodes[k].col;
      //     if (this.miniColumns[c].activated) this.miniColumns[i].nodeData[j].sum++;
      //   }
      //   if (this.miniColumns[i].nodeData[j].sum > 5) {
      //     this.miniColumns[i].nodeData[j].predicted = true;
      //     this.miniColumns[i].predicted = true;
      //     this.miniColumns[i].helper.material.color.setHex( 0x0000FF );
      //   }
      //   else {
      //     this.miniColumns[i].nodeData[j].predicted = false;
      //   }
      // }
    } );
  }
};
