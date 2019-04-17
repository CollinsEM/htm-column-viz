//--------------------------------------------------------------------
class GlobalParams extends dat.GUI {
  constructor(r) {
    super();
    this.maxDistDend = 20;
    this.maxProxDend = 20;
    this.maxNodesPerMiniColumn = 16;
    this.maxDendSegs = 19;
    //------------------------------------
    this.showDots = true;
	  this.add( this, "showDots" )
      .onChange( function( value ) {
        if (cortex) {
          for (var k=0; k<cortex.numLayers; ++k) {
            cortex.nodeLayer[k].visible = value;
          }
        }
      } );
    
    this.moving = false;
	  this.add( this, "moving" );
    
    this.numDendSegs = 19;
	  this.add( this, "numDendSegs", 1, this.maxDendSegs, 1 )
      .onChange( function( value ) {
        this.numDendSegs = parseInt( value );
        if (cortex) {
          cortex.updateProximalPos();
          cortex.updateProximalCol();
        }
      } );
    
    //------------------------------------
    var prox = this.addFolder('Proximal');
    
	  this.showProxDend = true;
	  prox.add( this, "showProxDend" )
      .onChange( function( value ) {
        if (cortex) {
          for (var k=1; k<cortex.numLayers; ++k) {
            cortex.proximalLayer[k].visible = value;
          }
        }
      } );
    
    this.numProxDend = 5;
	  prox.add( this, "numProxDend", 1, this.maxProxDend, 1 )
      .onChange( function( value ) {
        this.numProxDend = parseInt( value );
        if (cortex) {
          cortex.updateProximalConnections();
          cortex.updateProximalPos();
          cortex.updateProximalCol();
        }
      } );
    
	  this.maxProxDist = r/2;
	  prox.add( this, "maxProxDist", 10, r*Math.sqrt(2) )
      .onChange( function( value ) {
        this.maxProxDist = parseFloat( value );
        if (cortex) {
          cortex.updateProximalConnections();
          cortex.updateProximalPos();
          cortex.updateProximalCol();
        }
      } );
    
    //------------------------------------
    var dist = this.addFolder('Distal');
    
	  this.showDistDend = true;
	  dist.add( this, "showDistDend" )
      .onChange( function( value ) {
        if (cortex) {
          for (var k=1; k<cortex.numLayers; ++k) {
            cortex.distalLayer[k].visible = value;
          }
        }
      } );
    
    this.numDistDend = 5;
	  dist.add( this, "numDistDend", 0, this.maxDistDend, 1 )
      .onChange( function( value ) {
        this.numDistDend = parseInt( value );
        if (cortex) {
          cortex.updateDistalConnections();
          cortex.updateDistalCol();
        }
      } );
    
	  this.maxDistDist = 0.5*r;
	  dist.add( this, "maxDistDist", 10, r*Math.sqrt(2) )
      .onChange( function( value ) {
        this.maxDistDist = parseFloat( value );
        if (cortex) {
          cortex.updateDistalConnections();
          cortex.updateDistalCol();
        }
      } );
    
  }
};

