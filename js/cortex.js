//--------------------------------------------------------------------
// CortexMesh displays a visualization of the current state of the
// neural network.
//--------------------------------------------------------------------
class CortexMesh extends THREE.Object3D {
  //------------------------------------------------------------------
  constructor(numLayers, numColumns, numNodesPerColumn) {
    super();
    this.numLayers = numLayers || 2;
    this.numRows = parseInt(Math.floor(Math.sqrt(numColumns || 16)));
    this.numCols = this.numRows;
    this.numColumns = this.numRows*this.numCols;
    this.numNodesPerColumn = numNodesPerColumn || 8;
    this.nodeGeom = [];
    this.nodePos = [];
    this.nodeCol = [];
    this.nodeSiz = [];
    this.posAttrib = [];
    this.colAttrib = [];
    this.sizAttrib = [];
    this.nodeData = [];
    this.nodeLayer = [];
    //------------------
    this.proximalGeom = [];
    this.proximalPos = [];
    this.proximalCol = [];
    this.proximalInd = [];
    this.proximalPosAttrib = [];
    this.proximalColAttrib = [];
    this.proximalIndAttrib = [];
    this.proximalLayer = [];
    //------------------
    this.distalGeom = [];
    this.distalCol = [];
    this.distalInd = [];
    this.distalColAttrib = [];
    this.distalIndAttrib = [];
    this.distalLayer = [];
    //------------------
    this.initNodes();
    this.initDistalDendrites();
    this.updateDistalConnections();
    this.updateDistalCol();
    this.initProximalDendrites();
    this.updateProximalConnections();
    this.updateProximalPos();
    this.updateProximalCol();
  }
  //------------------------------------------------------------------
  initNodes() {
    var NL  = this.numLayers;
    var NI  = this.numRows;
    var NJ  = this.numCols;
    var NC  = this.numColumns;
    var NPC = this.numNodesPerColumn;
    var N   = NC*NPC;
    
    var uniforms = {
		  color:   {
        value: new THREE.Color( 0xffffff )
      },
		  texture: {
        value: new THREE.TextureLoader().load( "textures/sprites/spark1.png" )
      }
	  };
    
	  var nodeMat = new THREE.ShaderMaterial( {
		  uniforms:       uniforms,
		  vertexShader:   document.getElementById( 'vertexshader' ).textContent,
		  fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
		  blending:       THREE.AdditiveBlending,
		  depthTest:      false,
		  transparent:    true
	  } );
    
    for (var k=0; k<NL; ++k) {
      this.nodeGeom[k] = new THREE.BufferGeometry();
	    this.nodePos[k]  = new Float32Array(3*N);
	    this.nodeCol[k]  = new Float32Array(3*N);
	    this.nodeSiz[k]  = new Float32Array(  N);
      this.nodeData[k] = [];
    }
    // Input layer
    var dx = r/(NI-1), dz = r/(NJ-1);
    for (var i=0, c=0, n=0, s=0; i<NI; ++i) {
      var x0 = i*dx - r/2;
      for (var j=0; j<NJ; ++j) {
        var z0 = j*dz - r/2;
		    var px = x0;// + dx*Math.random();
		    var py = -r/2;
		    var pz = z0;// + dz*Math.random();
		    this.nodeCol[0][c++] = 1;
		    this.nodeCol[0][c++] = 1;
		    this.nodeCol[0][c++] = 1;
      
		    this.nodePos[0][n++] = px;
		    this.nodePos[0][n++] = py;
		    this.nodePos[0][n++] = pz;
      
        this.nodeSiz[0][s++]  = 50;
      
		    // create extra data item
		    this.nodeData[0].push(new Neuron(px, py, pz));
      }
    }

    var dx = r/NI, dz = r/NJ;
    var dY = 0.75*r/Math.max(1,NL-1), dy = dY/NPC;
    for (var k=1, Y0=-r/4; k<NL; ++k, Y0+=dY) {
      // For each layer
      for (var i=0, c=0, n=0, s=0; i<NI; ++i) {
        var x0 = (i+0.5)*dx - r/2;
        for (var j=0; j<NJ; ++j) {
          var z0 = (j+0.5)*dz - r/2;
          // For each column
          for (var h=0, y0=Y0; h<NPC; ++h, y0+=dy) {
            // For each node
		        var px = x0 + 0.5*dx*(Math.random()-0.5);
		        var py = y0 + 0.5*dy*(Math.random()-0.5);
		        var pz = z0 + 0.5*dz*(Math.random()-0.5);
		        this.nodeCol[k][c++] = 1;
		        this.nodeCol[k][c++] = 1;
		        this.nodeCol[k][c++] = 1;

		        this.nodePos[k][n++] = px;
		        this.nodePos[k][n++] = py;
		        this.nodePos[k][n++] = pz;

            this.nodeSiz[k][s++]  = 5;

		        this.nodeData[k].push(new Neuron(px, py, pz));
          }
        }
	    }
    }
    
    for (var k=0; k<NL; ++k) {
      this.posAttrib[k] = new THREE.BufferAttribute(this.nodePos[k],3).setDynamic(true);
      this.colAttrib[k] = new THREE.BufferAttribute(this.nodeCol[k],3).setDynamic(true);
      this.sizAttrib[k] = new THREE.BufferAttribute(this.nodeSiz[k],1).setDynamic(true);
	    this.nodeGeom[k].addAttribute('position',     this.posAttrib[k]);
      this.nodeGeom[k].addAttribute('customColor',  this.colAttrib[k]);
      this.nodeGeom[k].addAttribute('size',         this.sizAttrib[k]);
	    this.nodeGeom[k].setDrawRange(0, N);
      this.nodeGeom[k].computeBoundingSphere();
	    this.nodeLayer[k] = new THREE.Points( this.nodeGeom[k], nodeMat );
      this.add(this.nodeLayer[k]);
    }
  }
  //------------------------------------------------------------------
  initDistalDendrites() {
    var NL  = this.numLayers;
    var NC  = this.numColumns;
    var NPC = this.numNodesPerColumn;
    var N   = NC*NPC;
	  var lineMat = new THREE.LineBasicMaterial( {
		  vertexColors: THREE.VertexColors,
		  blending: THREE.AdditiveBlending,
		  transparent: true,
      opacity: 0.25
	  } );
    // DISTAL
    for (var k=1; k<NL; ++k) {
	    this.distalGeom[k] = new THREE.BufferGeometry();
	    this.distalCol[k]  = new Float32Array(6*N*(N-1)*gui.maxDistDend);
      this.distalInd[k]  = new Uint32Array(2*N*(N-1)*gui.maxDistDend);
      
      this.distalColAttrib[k] = new THREE.BufferAttribute(this.distalCol[k], 3)
        .setDynamic( true );
      this.distalIndAttrib[k] = new THREE.BufferAttribute(this.distalInd[k], 1)
        .setDynamic( true );
	    this.distalGeom[k].setIndex(this.distalIndAttrib[k]);
      
	    this.distalGeom[k].addAttribute('position', this.posAttrib[k]);
	    // this.distalGeom[k].addAttribute('color', this.colAttrib[k]);
	    this.distalGeom[k].addAttribute('color', this.distalColAttrib[k]);
      this.distalGeom[k].setDrawRange(0, 0);
      
	    this.distalLayer[k] = new THREE.LineSegments( this.distalGeom[k], lineMat );
      this.add(this.distalLayer[k]);
    }
  }
  //------------------------------------------------------------------
  // Update distal synapse connections
  //------------------------------------------------------------------
  updateDistalConnections() {
    var NL  = this.numLayers;
    var NC  = this.numColumns;
    var NPC = this.numNodesPerColumn;
    var N   = NC*NPC;
    for (var k=1; k<NL; ++k) {
      var n = 0;
      var numConn = 0;
      var n0 = 0; // Source node index
      for (var j=0; j<NC; ++j) {
        for (var i=0; i<NPC; ++i, ++n0) {
          // Begin searching for nearest neighbors with the nodes in
          // the next column
          var nearest = this.findNearestNodes(k, n0, k, (j+1)*NPC,
                                              gui.numDistDend,
                                              gui.maxDistDist);
          var iData = this.nodeData[k][n0];
          iData.distalNodes.clear();
          nearest.forEach( function(n1) {
            this.nodeData[k][n0].distalNodes.add(new Synapse(n1));
            this.nodeData[k][n1].distalNodes.add(new Synapse(n0));
            this.distalInd[k][n++] = n0;
            this.distalInd[k][n++] = n1;
          }, this );
          numConn += nearest.length;
        }
      }
	    this.distalIndAttrib[k].needsUpdate = true;
      this.distalGeom[k].setDrawRange(0, 2*numConn);
    }
  }
  //------------------------------------------------------------------
  // Update distal synapse colors
  //------------------------------------------------------------------
  updateDistalCol() {
    var NL  = this.numLayers;
    var NC  = this.numColumns;
    var NPC = this.numNodesPerColumn;
    var N   = NC*NPC;
    for (var k=1; k<NL; ++k) {
      var iCol = this.nodeCol[k];
      var jCol = this.nodeCol[k];
      for (var j=0, c=0; j<NC; ++j) {
        for (var i=0; i<NPC; ++i) {
          var iData = this.nodeData[k][j*NPC+i];
          iData.distalNodes.forEach( function(n) {
            var j0=3*n.dest, j1=j0+1, j2=j0+2;
            var w = jCol[j0];
            this.distalCol[k][c++] = Math.max(jCol[j0], 0.1);
            this.distalCol[k][c++] = Math.max(jCol[j1], 0.1);
            this.distalCol[k][c++] = Math.max(jCol[j2], 0.1);
            this.distalCol[k][c++] = Math.max(jCol[j0], 0.1);
            this.distalCol[k][c++] = Math.max(jCol[j1], 0.1);
            this.distalCol[k][c++] = Math.max(jCol[j2], 0.1);
          }, this );
        }
      }
	    this.distalGeom[k].attributes.color.needsUpdate = true;
    }
  }
  //------------------------------------------------------------------
  initProximalDendrites() {
    var NL  = this.numLayers;
    var NC  = this.numColumns;
    var NPC = this.numNodesPerColumn;
    var N   = NC*NPC;
	  var lineMat = new THREE.LineBasicMaterial( {
		  vertexColors: THREE.VertexColors,
		  blending: THREE.AdditiveBlending,
		  transparent: true,
      opacity: 0.25
	  } );
    // PROXIMAL
    for (var k=1; k<NL; ++k) {
	    this.proximalGeom[k] = new THREE.BufferGeometry();
	    this.proximalCol[k]  = new Float32Array(6*N*gui.maxProxDend*20);
      // this.proximalInd[k]  = new Uint32Array(2*N*gui.maxProxDend);
	    this.proximalPos[k]  = new Float32Array(6*N*gui.maxProxDend*20);
      
      this.proximalColAttrib[k] = new THREE.BufferAttribute(this.proximalCol[k], 3)
        .setDynamic( true );
      // this.proximalIndAttrib[k] = new THREE.BufferAttribute(this.proximalInd[k], 1)
      //   .setDynamic( true );
      this.proximalPosAttrib[k] = new THREE.BufferAttribute(this.proximalPos[k], 3)
        .setDynamic( true );
      
	    this.proximalGeom[k].addAttribute('position', this.proximalPosAttrib[k]);
	    this.proximalGeom[k].addAttribute('color', this.proximalColAttrib[k]);
	    // this.proximalGeom[k].setIndex(this.proximalIndAttrib[k]);
      this.proximalGeom[k].setDrawRange(0, 0);
      
	    this.proximalLayer[k] = new THREE.LineSegments( this.proximalGeom[k], lineMat );
      this.add(this.proximalLayer[k]);
    }
  }
  //------------------------------------------------------------------
  // Update proximal connections
  //------------------------------------------------------------------
  updateProximalConnections() {
    var NL  = this.numLayers;
    var NC  = this.numColumns;
    var NPC = this.numNodesPerColumn;
    var N   = NC*NPC;
    for (var k=1; k<NL; ++k) {
      var numConn = 0;
      for (var ni=0; ni<N; ++ni) {
        // Begin searching for nearest neighbors with the columns in
        // the previous layer
        var nearest = this.findNearestNodes(k, ni, k-1, 0,
                                            gui.numProxDend,
                                            gui.maxProxDist);
        this.nodeData[k][ni].proximalNodes.clear();
        nearest.forEach( function(nj) {
          // this.nodeData[k][ni].proximalNodes.add(nj);
          this.nodeData[k][ni].proximalNodes.add(new Synapse(nj));
        }, this );
        numConn += nearest.length;
      }
      this.proximalGeom[k].setDrawRange(0, 2*numConn*gui.numDendSegs);
    }
  }
  //------------------------------------------------------------------
  updateProximalPos() {
    var NL  = this.numLayers;
    var NC  = this.numColumns;
    var NPC = this.numNodesPerColumn;
    var N   = NC*NPC;
    for (var k=1; k<NL; ++k) {
      var n = 0;
      var iPos = this.nodePos[k];
      var jPos = this.nodePos[k-1];
      var proxPos = this.proximalPos[k];
      for (var ni=0; ni<N; ++ni) {
        var i0=3*ni, i1=i0+1, i2=i0+2;
        this.nodeData[k][ni].proximalNodes.forEach( function(nj) {
          // var j0=3*nj, j1=j0+1, j2=j0+2;
          var j0=3*nj.dest, j1=j0+1, j2=j0+2;
          var dy = iPos[i1] - jPos[j1];
          var pCrv = new THREE.CubicBezierCurve3(
            new THREE.Vector3(iPos[i0], iPos[i1], iPos[i2]),
            new THREE.Vector3(iPos[i0], iPos[i1] - dy, iPos[i2]),
            new THREE.Vector3(jPos[j0], jPos[j1] + dy, jPos[j2]),
            new THREE.Vector3(jPos[j0], jPos[j1], jPos[j2])
          );
          var pos = pCrv.getPoints(gui.numDendSegs);
          for (var s=0; s<gui.numDendSegs; ++s) {
            proxPos[n++] = pos[s].x;
            proxPos[n++] = pos[s].y;
            proxPos[n++] = pos[s].z;
            proxPos[n++] = pos[s+1].x;
            proxPos[n++] = pos[s+1].y;
            proxPos[n++] = pos[s+1].z;
          }
        } );
      }
	    this.proximalGeom[k].attributes.position.needsUpdate = true;
    }
  }
  //------------------------------------------------------------------
  updateProximalCol() {
    var NL  = this.numLayers;
    var NC  = this.numColumns;
    var NPC = this.numNodesPerColumn;
    var N   = NC*NPC;
    for (var k=1; k<this.numLayers; ++k) {
      var c=0;
      var iCol = this.nodeCol[k];
      var jCol = this.nodeCol[k-1];
      var proxCol = this.proximalCol[k];
      for (var ni=0; ni<N; ++ni) {
        var i0=3*ni, i1=i0+1, i2=i0+2;
        this.nodeData[k][ni].proximalNodes.forEach( function(nj) {
          // var j0=3*nj, j1=j0+1, j2=j0+2;
          var j0=3*nj.dest, j1=j0+1, j2=j0+2;
          var cCrv = new THREE.LineCurve3(
            // new THREE.Vector3(iCol[i0], iCol[i1], 0),
            new THREE.Vector3(jCol[j0], jCol[j1], 0),
            new THREE.Vector3(jCol[j0], jCol[j1], 0)
          );
          var col = cCrv.getPoints(gui.numDendSegs);
          for (var s=0; s<gui.numDendSegs; ++s) {
            proxCol[c++] = Math.max(col[s].x, 0.1);
            proxCol[c++] = Math.max(col[s].y, 0.1);
            proxCol[c++] = Math.max(col[s].z, 0.1);
            proxCol[c++] = Math.max(col[s+1].x, 0.1);
            proxCol[c++] = Math.max(col[s+1].y, 0.1);
            proxCol[c++] = Math.max(col[s+1].z, 0.1);
          }
        } );
      }
	    this.proximalGeom[k].attributes.color.needsUpdate = true;
    }
  }
  //------------------------------------------------------------------
  // updateNodePos() {
    // var NL  = this.numLayers;
    // var NC  = this.numColumns;
    // var NPC = this.numNodesPerColumn;
    // var N   = NC*NPC;
  //   var rHalf = r / 2;
  //   for (var k=0; k<this.numLayers; ++k) {
	//     for ( var i=0, i0=0, i1=1, i2=2; i<N; ++i, i0+=3, i1+=3, i2+=3 ) {
	// 	    var iData = this.nodeData[k][i];
  //       // update particle positions if moving
	// 	    this.nodePos[k][i0] += iData.vel.x;
	// 	    this.nodePos[k][i1] += iData.vel.y;
	// 	    this.nodePos[k][i2] += iData.vel.z;
	// 	    if ( this.nodePos[k][i0] < -rHalf ||
  //            this.nodePos[k][i0] > rHalf )
  //         iData.vel.x *= -1;
	// 	    if ( this.nodePos[k][i1] < -rHalf ||
  //            this.nodePos[k][i1] > rHalf )
  //         iData.vel.y *= -1;
	// 	    if ( this.nodePos[k][i2] < -rHalf ||
  //            this.nodePos[k][i2] > rHalf )
  //         iData.vel.z *= -1;
  //     }
	//     this.nodeGeom[k].attributes.position.needsUpdate = true;
  //   }
  // }
  //------------------------------------------------------------------
  // Render active neurons
  //------------------------------------------------------------------
  setActiveNeurons() {
    var NL  = this.numLayers;
    var NC  = this.numColumns;
    var NPC = this.numNodesPerColumn;
    var N   = NC*NPC;
    for (var k=0; k<NL; ++k) {
      for (var i=0, i0=0; i<N; ++i, i0+=3) {
		    var iData = this.nodeData[k][i];
        if (iData.predicted) {
          this.nodeCol[k][i0] = 0;
          this.nodeCol[k][i0+1] = 1;
          this.nodeCol[k][i0+2] = 0;
        }
        else {
          this.nodeCol[k][i0] = 1;
          this.nodeCol[k][i0+1] = 0;
          this.nodeCol[k][i0+2] = 0;
        }
        this.nodeSiz[k][i] = 100;
      }
    }
  }
  //------------------------------------------------------------------
  // Update Neuron States
  //------------------------------------------------------------------
  updateNodeStates() {
    var NL  = this.numLayers;
    var NC  = this.numColumns;
    var NPC = this.numNodesPerColumn;
    var N   = NC*NPC;
	  var color = this.nodeCol[0];
	  var sizes = this.nodeSiz[0];
    // Update input layer
	  for ( var i=0, i0=0, i1=1, i2=2; i<NC; ++i, i0+=3, i1+=3, i2+=3 ) {
		  var iData = this.nodeData[0][i];
      if (!iData.activated && Math.random() > 0.99) {
        sizes[i] = 100;
        color[i0] = 0;
        color[i1] = 1;
        color[i2] = 0;
        iData.activated = true;
      }
      else {
        sizes[i] *= 0.95;
        color[i0] *= 0.95;
        color[i1] *= 0.95;
        color[i2] *= 0.95;
        iData.activated = (sizes[i] > 5);
      }
    }
	  this.nodeGeom[0].attributes.customColor.needsUpdate = true;
	  this.nodeGeom[0].attributes.size.needsUpdate = true;
    // Update higher layers
    for (var k=1; k<this.numLayers; ++k) {
	    color = this.nodeCol[k];
	    sizes = this.nodeSiz[k];
	    for ( var i=0, i0=0, i1=1, i2=2; i<N; ++i, i0+=3, i1+=3, i2+=3 ) {
		    var iData = this.nodeData[k][i];
        // The size of each node is proportional to its activation energy.
        var sumDist = 0;
        iData.distalNodes.forEach( function(n) {
          if (this.nodeData[k][n.dest].activated && n.perm > 0.5) {
            sumDist += this.nodeSiz[k][n.dest];
          }
        }, this );
        var distalActivation = (sumDist > 10);

        var sumProx = 0;
        iData.proximalNodes.forEach( function(n) {
          if (this.nodeData[k-1][n.dest].activated && n.perm > 0.5) {
            sumProx += this.nodeSiz[k-1][n.dest];
          }
        }, this );
        var proximalActivation = (sumProx > 100);

        if (iData.activated) {
          // Node has recently been activated. Node cannot fire again
          // until sizes[i] falls below 5.  This simulates the neurons
          // physical limitations on firing rate based on available
          // metabolic resources.
          sizes[i] *= 0.95;
          color[i0] *= 0.95;
          color[i1] *= 0.95;
          color[i2] *= 0.95;
          iData.activated = (sizes[i] > 5);
        }
        else if (proximalActivation) {
          // Node is not active, but has recieved enough stimulation on
          // its proximal dendrites to trigger activation.
          if (iData.predicted) {
            // Node was already in the predicted state.
            color[i0] = 0;
            color[i1] = 1;
            color[i2] = 0;
          }
          else {
            // Node was not in the predicted state.
            color[i0] = 1;
            color[i1] = 0;
            color[i2] = 0;
          }
          sizes[i] = 100;
          iData.activated = true;
          iData.predicted = false;
        }
        else if (iData.predicted) {
          // Node is in the predicted state, but no activation has
          // occured.  The partial depolarization is now decaying.
          sizes[i] *= 0.9;
          color[i0] *= 0.95;
          color[i1] *= 0.95;
          color[i2] *= 0.95;
          iData.predicted = (sizes[i] > 5);
        }
        else if (distalActivation) {
          // Node is not active, but its distal synapes have received
          // enough stimulation to partially depolarize the neuron. Thus
          // this node is now in the predictive state.
          sizes[i] = 50;
          color[i0] = 0;
          color[i1] = 1;
          color[i2] = 1;
          iData.predicted = true;
        }
        else {
          // Node is not active and is not being predicted.
          color[i0] = 0.05;
          color[i1] = 0.05;
          color[i2] = 0.05;
		      sizes[i] = 5;
        }
      }
	    this.nodeGeom[k].attributes.customColor.needsUpdate = true;
	    this.nodeGeom[k].attributes.size.needsUpdate = true;
    }
  }
  //--------------------------------------------------------------------
  // Find K-nearest neighbors
  //--------------------------------------------------------------------
  findNearestNodes(k0, n0, k1, n1, maxConns, maxDist) {
    var NL  = this.numLayers;
    var NC  = this.numColumns;
    var NPC = this.numNodesPerColumn;
    var N   = (k1 == 0 ? NC : NC*NPC);
    var maxDistSq = maxDist*maxDist;
    var minDistSq = [ ];
    var nearest = [ ];
    var x0 = this.nodePos[k0][3*n0];
    var y0 = this.nodePos[k0][3*n0+1];
    var z0 = this.nodePos[k0][3*n0+2];
    for (var i=n1, n=3*n1; i<N; ++i) {
      // Skip self connections
      if (k0 == k1 && i == n0) continue;
      var dx = this.nodePos[k1][n++] - x0;
      var dy = this.nodePos[k1][n++] - y0;
      var dz = this.nodePos[k1][n++] - z0;
      var distSq = dx*dx + dz*dz + dy*dy;
      // Limit maximum horizontal connection distance
      if (distSq > maxDistSq) continue;
      // Add this node if there are less than maxNeighbor nodes
      // already in the array or if this node is closer than the
      // last node in the array.
      if (minDistSq.length < maxConns || distSq < minDistSq[maxConns-1]) {
        // Insert this node into the sorted list of nearest neighbors
        var idx = minDistSq.findIndex( function(dSq) {
          return dSq > distSq;
        } );
        if (idx < 0) {
          minDistSq.push(distSq);
          nearest.push(i);
        }
        else {
          minDistSq.splice(idx, 0, distSq);
          nearest.splice(idx, 0, i);
        }
        if (nearest.length > maxConns) nearest.pop();
        if (minDistSq.length > maxConns) minDistSq.pop();
      }
    }
    return nearest;
  }
};

