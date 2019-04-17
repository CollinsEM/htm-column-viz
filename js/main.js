"use strict";
var group;
var container, stats;
var neuronData = [];
var camera, scene, renderer;
var synapsePos, synapseCol;
var cortex = undefined;
var pointCloud;
var neuronPos;
var neuronCol;
var neuronSize;
var proxDendrites;
var maxNeurons = 1000;
var r = 800;
var numLayers = 1;
var numColumns = 25;

var gui;

var L2, L3, L4, L5, L6A, L6B;

window.addEventListener( 'load', init, false );
window.addEventListener( 'resize', onWindowResize, false );

//--------------------------------------------------------------------
function init() {
  gui = new GlobalParams(r);

	container = document.getElementById( 'container' );

  var aspect = window.innerWidth / window.innerHeight;
	camera = new THREE.PerspectiveCamera( 45, aspect, 1, 4000 );
	camera.position.z = 1750;

	var controls = new THREE.OrbitControls( camera, container );

	scene = new THREE.Scene();

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	container.appendChild( renderer.domElement );

	stats = new Stats();
	container.appendChild( stats.dom );

  var group = initScene();
	scene.add( group );
  
  animate();
}
//--------------------------------------------------------------------
function initScene() {
	group = new THREE.Group();
  
  // var mc = new MiniColumn(0, 0, 0, 16);
  // mc.scale.set(r/10, r/2, r/10);
  // group.add(mc);

  cortex = new CortexMesh(numLayers, numColumns, 1);
	group.add( cortex );

  var NI=4, NJ=4;
  L4 = new TemporalMemoryLayer(NI, NJ, 16, cortex.nodeData[0]);
  L4.scale.set((NI-1)*r/(2*NI), 100, (NJ-1)*r/(2*NJ));
  group.add(L4);
  
  // var prox = initProximalSynapses();
	// group.add( prox );

  // var dist = initDistalSynapses();
	// group.add( dist );
  
  var bbox = new THREE.Mesh( new THREE.BoxGeometry( r, r, r ) );
	var helper = new THREE.BoxHelper( bbox );
	helper.material.color.setHex( 0x080808 );
	helper.material.blending = THREE.AdditiveBlending;
	helper.material.transparent = true;
	group.add( helper );

  return group;
}
//--------------------------------------------------------------------
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}
//--------------------------------------------------------------------
function animate() {
  // // update particle positions if moving
  // if (gui.moving) {
  //   // cortex.updateNodePos();
  //   cortex.updateDistalConnections();
  //   cortex.updateProximalConnections();
  //   cortex.updateProximalPos();
  // }
  var input;
  if (cortex) {
    cortex.updateNodeStates();
    cortex.updateDistalCol();
    cortex.updateProximalCol();
    if (L4) {
      L4.setInput( cortex.nodeData[0] );
    }
  }
  
  requestAnimationFrame(animate);
	stats.update();
	render();
  return;
}

function render() {
	var time = Date.now() * 0.005;
	group.rotation.y = time * 0.01;
	renderer.render( scene, camera );
}

