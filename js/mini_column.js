class MiniColumn extends THREE.Group {
  constructor(numNodes) {
    super();
    this.numNodes = numNodes;
    // this.activated = (Math.random() > 0.8);
    // this.predicted = (Math.random() > 0.5);
    this.activated = false;
    this.predicted = false;
    this.nodeData = [];
    this.proxNodes = [];
    this.proxPerms = undefined;
    this.initNodes();
  }
  initNodes() {
    this.nodeUniforms = {
		  color:   {
        value: new THREE.Color( 0xffffff )
      },
		  texture: {
        value: new THREE.TextureLoader().load( "textures/sprites/spark1.png" )
      }
	  };
	  this.nodeMat = new THREE.ShaderMaterial( {
		  uniforms:       this.nodeUniforms,
		  vertexShader:   document.getElementById( 'vertexshader' ).textContent,
		  fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
		  blending:       THREE.AdditiveBlending,
		  depthTest:      false,
		  transparent:    true
	  } );
    this.nodePos = new Float32Array(3*this.numNodes);
    this.nodeCol = new Float32Array(3*this.numNodes);
    this.nodeSiz = new Float32Array(  this.numNodes);
    for ( var i=0, p=0, c=0, s=0; i<this.numNodes; ++i ) {
      var px = 2*Math.random() - 1;
      var py = 2*Math.random() - 1;
      var pz = 2*Math.random() - 1;
      this.nodePos[p++] = px;
      this.nodePos[p++] = py;
      this.nodePos[p++] = pz;
      this.nodeCol[c++] = 1.0;
      this.nodeCol[c++] = 1.0;
      this.nodeCol[c++] = 1.0;
      this.nodeSiz[s++] = 10;
      this.nodeData[i] = new Neuron(px, py, pz);
    }
    this.posAttrib = new THREE.BufferAttribute(this.nodePos,3).setDynamic(true);
    this.colAttrib = new THREE.BufferAttribute(this.nodeCol,3).setDynamic(true);
    this.sizAttrib = new THREE.BufferAttribute(this.nodeSiz,1).setDynamic(true);
    this.nodeGeom  = new THREE.BufferGeometry();
    this.nodeGeom.addAttribute('position',    this.posAttrib);
    this.nodeGeom.addAttribute('customColor', this.colAttrib);
    this.nodeGeom.addAttribute('size',        this.sizAttrib);
    this.nodeGeom.setDrawRange(0, this.numNodes);
    // this.nodeGeom.computeBoundingSphere();
    this.nodes = new THREE.Points( this.nodeGeom, this.nodeMat );
    this.add( this.nodes );
    
    var bbox = new THREE.Mesh( new THREE.BoxGeometry( 2, 2, 2 ) );
	  this.helper = new THREE.BoxHelper( bbox );
	  // this.helper = new THREE.BoxHelper( this.nodes );
	  this.helper.material.color.setHex( this.activated ?
                                       (this.predicted ? 0x00FF00 : 0x880000) :
                                       (this.predicted ? 0x0088FF : 0x080808) );
	  this.helper.material.blending = THREE.AdditiveBlending;
	  this.helper.material.transparent = true;
	  this.helper.material.opacity = 0.5;
	  this.add( this.helper );
  }
  //------------------------------------------------------------------
  // Update Neuron States
  //------------------------------------------------------------------
  updateNodeStates(input) {
    this.updatePredictions();
    this.updateActivations();
    var N = this.numNodes;
	  for ( var i=0, c=0; i<this.numNodes; ++i ) {
      this.activated = false;
      if (!this.nodeData[i].activated) {
        this.nodeCol[c++] = 0.0;
        this.nodeCol[c++] = 1.0;
        this.nodeCol[c++] = 0.0;
        this.nodeSiz[i]   = 100;
        this.nodeData[i].activated = true;
        this.activated = true;
      }
      else {
        this.nodeCol[c++] *= 0.95;
        this.nodeCol[c++] *= 0.95;
        this.nodeCol[c++] *= 0.95;
        this.nodeSiz[i]   *= 0.95;
        if (this.nodeSiz[i] > 5) {
          this.activated = true;
          this.nodeData[i].activated = true;
        }
        else {
          this.nodeData[i].activated = false;
        }
      }
    }
	  this.colAttrib.needsUpdate = true;
	  this.sizAttrib.needsUpdate = true;
	  this.helper.material.color.setHex( this.activated ?
                                       (this.predicted ? 0x00FF00 : 0x880000) :
                                       (this.predicted ? 0x0088FF : 0x080808) );
    // // Update higher layers
    // for (var k=1; k<this.numLayers; ++k) {
	  //   color = this.nodeCol[k];
	  //   sizes = this.nodeSiz[k];
	  //   for ( var i=0, i0=0, i1=1, i2=2; i<N; ++i, i0+=3, i1+=3, i2+=3 ) {
		//     var iData = this.nodeData[k][i];
    //     // The size of each node is proportional to its activation energy.
    //     var sumDist = 0;
    //     iData.distalNodes.forEach( function(n) {
    //       if (this.nodeData[k][n.dest].activated && n.perm > 0.5) {
    //         sumDist += this.nodeSiz[k][n.dest];
    //       }
    //     }, this );
    //     var distalActivation = (sumDist > 10);

    //     var sumProx = 0;
    //     iData.proximalNodes.forEach( function(n) {
    //       if (this.nodeData[k-1][n.dest].activated && n.perm > 0.5) {
    //         sumProx += this.nodeSiz[k-1][n.dest];
    //       }
    //     }, this );
    //     var proximalActivation = (sumProx > 100);

    //     if (iData.activated) {
    //       // Node has recently been activated. Node cannot fire again
    //       // until sizes[i] falls below 5.  This simulates the neurons
    //       // physical limitations on firing rate based on available
    //       // metabolic resources.
    //       sizes[i] *= 0.95;
    //       color[i0] *= 0.95;
    //       color[i1] *= 0.95;
    //       color[i2] *= 0.95;
    //       iData.activated = (sizes[i] > 5);
    //     }
    //     else if (proximalActivation) {
    //       // Node is not active, but has recieved enough stimulation on
    //       // its proximal dendrites to trigger activation.
    //       if (iData.predicted) {
    //         // Node was already in the predicted state.
    //         color[i0] = 0;
    //         color[i1] = 1;
    //         color[i2] = 0;
    //       }
    //       else {
    //         // Node was not in the predicted state.
    //         color[i0] = 1;
    //         color[i1] = 0;
    //         color[i2] = 0;
    //       }
    //       sizes[i] = 100;
    //       iData.activated = true;
    //       iData.predicted = false;
    //     }
    //     else if (iData.predicted) {
    //       // Node is in the predicted state, but no activation has
    //       // occured.  The partial depolarization is now decaying.
    //       sizes[i] *= 0.9;
    //       color[i0] *= 0.95;
    //       color[i1] *= 0.95;
    //       color[i2] *= 0.95;
    //       iData.predicted = (sizes[i] > 5);
    //     }
    //     else if (distalActivation) {
    //       // Node is not active, but its distal synapes have received
    //       // enough stimulation to partially depolarize the neuron. Thus
    //       // this node is now in the predictive state.
    //       sizes[i] = 50;
    //       color[i0] = 0;
    //       color[i1] = 1;
    //       color[i2] = 1;
    //       iData.predicted = true;
    //     }
    //     else {
    //       // Node is not active and is not being predicted.
    //       color[i0] = 0.05;
    //       color[i1] = 0.05;
    //       color[i2] = 0.05;
		//       sizes[i] = 5;
    //     }
    //   }
	  //   this.nodeGeom[k].attributes.customColor.needsUpdate = true;
	  //   this.nodeGeom[k].attributes.size.needsUpdate = true;
    // }
  }
};
