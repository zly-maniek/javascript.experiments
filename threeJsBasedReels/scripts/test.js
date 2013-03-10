var WIDTH = 1050;
var HEIGHT = 600;
var NUMBER_OF_SYMBOLS = 50;
var NUMBER_OF_REELS = 6;
var ELEMENTS_ON_SCREEN = 10;
var SYMBOL_HEIGHT = 100;
var SYMBOL_WIDTH = 100;
var UPPER_LIMIT = ((ELEMENTS_ON_SCREEN + 1) * SYMBOL_WIDTH) / 2;
var LOWER_LIMIT = - UPPER_LIMIT;
var FINISH_ANIMATION_TIME = 2000;
var USE_3D_EFFECT = true;

var container, stats;

var camera, scene, renderer;
var progress = 4;
var objects = [];

function NormalAnimator() {
   if( !(this instanceof NormalAnimator) ) {
      return new NormalAnimator();
   }

   this.spinValue = -20;
   this.isAnimationFinished = false;
}

NormalAnimator.prototype.animate = function( reel, time ) {
   if( this.isAnimationFinished ) { return; }
   reel.spin( this.spinValue );
   if( time >= FINISH_ANIMATION_TIME ) {
      this.isAnimationFinished = true;
   }
};

function FinishAnimationAnimator( currentTime ) {
   if( !(this instanceof FinishAnimationAnimator) ) {
      return new FinishAnimationAnimator();
   }

   this.animationStart = currentTime;
   this.isAnimationFinished = false;
}

FinishAnimationAnimator.prototype.animate = function( reel, time ) {
   if( this.isAnimationFinished ) { return; }
   var animationTime = time - this.animationStart;
   var a = Math.pow( 1.01, ( -0.4 * animationTime ) );
   var position = Math.cos( animationTime / 100 ) * a * 5;
   if( a < 0.01  ) {
      this.isAnimationFinished = true;
      return;
   }

   reel.spin( -position );
};

function Animator() {
   if( !(this instanceof Animator) ) {
      return new Animator();
   }

   this.currentAnimator = new NormalAnimator();
   this.animationDelay = 0;
}

Animator.prototype.animate = function( reel, time ) {
   var animationTime = time - this.animationDelay;

   if( animationTime < 0 ) { return; }

   if( this.currentAnimator.isAnimationFinished && !( this.currentAnimator instanceof FinishAnimationAnimator ) ) {
      reel.adjustPosition();
      this.currentAnimator = new FinishAnimationAnimator( animationTime );
   }

   this.currentAnimator.animate( reel, animationTime );
};

Animator.prototype.resetAnimation = function() {
   this.currentAnimator = new NormalAnimator();
};


function Reel() {
   if( !(this instanceof Reel) ) {
      return new Reel();
   }
   
   this.isVisible = true;
   this.totalSpin = 0;
   this.symbols = [];
   this.animator = new Animator();
}

var reelProtototype = Reel.prototype;
reelProtototype.animate = function( time ) {
   this.animator.animate(this, time );
};

reelProtototype.spin = function( value ) {
   var r = 20 * SYMBOL_HEIGHT;

   this.totalSpin += value;
   for( var i = 0; i < this.symbols.length; i++ ) {
      var symbol = this.symbols[i];

      symbol.position.y += value;

      if( USE_3D_EFFECT ) {
         symbol.position.z = -r+ Math.sqrt( r*r - symbol.position.y * symbol.position.y );
         symbol.rotation.x = -Math.sin( symbol.position.y / 2100 );
      }


      if( symbol.position.y > UPPER_LIMIT ) {
          symbol.position.y = symbol.position.y - ( ( NUMBER_OF_SYMBOLS -1 )* SYMBOL_HEIGHT );
      }

      if( symbol.position.y < LOWER_LIMIT ) {
          symbol.position.y = symbol.position.y + ( ( NUMBER_OF_SYMBOLS -1 )* SYMBOL_HEIGHT );
      }

      var shouldBeInScene = symbol.position.y >= LOWER_LIMIT && symbol.position.y <= UPPER_LIMIT;

      if( ( !!symbol.visible ) && !shouldBeInScene ) {
          symbol.visible = false;
      } else if( !symbol.visible && shouldBeInScene ) {
          symbol.visible = true;
      }
   }
};

reelProtototype.move = function( vector ) {
   for( var i = 0; i < this.symbols.length; i++ ) {
      this.symbols[i].position.x += vector.x;
      this.symbols[i].position.y += vector.y;
      this.symbols[i].position.z += vector.z;
   }
};

reelProtototype.adjustPosition = function() {
   var diffrence = this.totalSpin % SYMBOL_HEIGHT;
   this.totalSpin -= diffrence;

   for( var i = 0; i < this.symbols.length; i++ ) {
      this.symbols[i].position.y -= diffrence;
   }
};

reelProtototype.resetAnimation = function() {
   this.animator.resetAnimation();
};

reelProtototype.setDelay = function( delay ) {
   this.animator.animationDelay = delay;
};

reelProtototype.forEachSymbols = function( action ) {
   var that = this;
   for( var i = 0; i < this.symbols.length; i++ ) {
      action(that.symbols[i]);
   }
};

function createCamera() {
	var camera = new THREE.PerspectiveCamera(120, WIDTH / HEIGHT, 1, 2000);
	camera.position.y = 0;
	camera.position.x = 0;
	camera.position.z = 100;

    return camera;
}

function createScene() {

	var scene = new THREE.Scene();
    var object = new THREE.ArrowHelper( new THREE.Vector3( 0, 1, 0 ), new THREE.Vector3( 0, 0, 0 ), 50 );
    scene.add( object );

    object = THREE.AxisHelper( 100 );
    scene.add( object );

	scene.add( new THREE.AmbientLight( 0xffffff ) );

    return scene;
}

function createRenderer( width, height ) {

	var renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize( WIDTH || width , HEIGHT || height );

    return renderer;
}

function createContainer() {
	var container = document.createElement('div');
	document.body.appendChild(container);

    return container;
}

function loadReel() {
    var reel = new Reel();

    var materials = [];
    for( var i = 0; i <14; i++ )
    {
      var symbolSrc = "resources\/Smashing_Halloween_Icons\/reel" + i + ".png";
      var texture = THREE.ImageUtils.loadTexture( symbolSrc );
      materials[i - 1] = new THREE.MeshPhongMaterial( { color: 0xffffff, map: texture } );
    }

    var plane = new THREE.PlaneGeometry( SYMBOL_WIDTH, SYMBOL_HEIGHT, 1, 1 );
    var objects = [];
    for( var symbolIndex = 0; symbolIndex < NUMBER_OF_SYMBOLS; symbolIndex++ )
    {
          var materialIndex = Math.floor( Math.random() * 13 );
          var texturedPlane1 = new THREE.Mesh( plane, materials[ materialIndex ] );
          texturedPlane1.visible = true;

          var outerObject = new THREE.Object3D();
          outerObject.add( texturedPlane1 );
          outerObject.position.y = HEIGHT - ( symbolIndex * SYMBOL_HEIGHT );
          outerObject.visible = true;

          outerObject.position.x = 0;
          outerObject.position.z = 0;

          reel.symbols.push( outerObject );
    }

    return reel;
}

function setReelOnTrack( track ) {
   var reel = loadReel();

   var leftPosition = -(( NUMBER_OF_REELS * SYMBOL_WIDTH ) / 2 ) + ( SYMBOL_WIDTH / 2 );

   reel.move( new THREE.Vector3( ( leftPosition + ( track * SYMBOL_WIDTH ) ), 0, 0 ) );
   return reel;
}

var reels = [];
for( var i = 0; i < NUMBER_OF_REELS; i++ ) {
   var reel = setReelOnTrack( i );
   reel.setDelay( i * 200 );
   reels[i] = reel;
}

var renderer = createRenderer();
var container = createContainer();
var dom = renderer.domElement;
dom.className += " render";
container.appendChild( dom );

var scene = createScene();

var camera = createCamera();
camera.lookAt( scene.position );

var addToScene = function( symbol ) { scene.add(symbol ); };
for( var i = 0; i< reels.length; i++)
{
   reels[i].forEachSymbols( addToScene );
}

var startTime = new Date().getTime();

function renderFrame() {
   var elapsedTime = new Date().getTime() - startTime;

   requestAnimationFrame( renderFrame );

   for( var i = 0; i < reels.length; i++ ) {
      reels[i].animate( elapsedTime );
   }

   renderer.render( scene, camera );
}

function spin() {
   startTime = new Date().getTime();

   for( var i = 0; i < reels.length; i++ ) {
      reels[i].resetAnimation();
   }

}
renderFrame();
