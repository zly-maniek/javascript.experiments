var REEL_MODULE = REEL_MODULE || {};

REEL_MODULE.RESOURCES_COUNT = 14;
REEL_MODULE.SYMBOL_HEIGHT = 100;
REEL_MODULE.SYMBOL_WIDTH = 100;
REEL_MODULE.SYMBOLS_COUNT = 100;
REEL_MODULE.FINISH_ANIMATION_TIME = 2000;


REEL_MODULE.SubReel = function() {
   if( !(this instanceof REEL_MODULE.SubReel ) ) {
      return new REEL_MODULE.SubReel ();
   }

   this.symbols = [];
   this.position = { x: 0, y: 0 };
   this.size = { width:0, height: 0 };

   this.container = $("<div>");
   this.container.css('position', 'absolute');
   this.container.css('top', '0px');
   this.container.css('left', '0px');
};

var subReelPrototype = REEL_MODULE.SubReel.prototype;

subReelPrototype.move = function( x, y ) {

    if( isNaN(y) ) {
        throw "NAN"
    }
   this.position.x += x;
   this.position.y += y;

   this.container.css( "left", REEL_MODULE.toPx( this.position.x ) );
   this.container.css( "top", REEL_MODULE.toPx( this.position.y ) );
};

subReelPrototype.load = function( reelId, symbolsCount ) {
   for( var i = 0; i < symbolsCount; i++ ) {
       var symbolNumber = Math.floor( Math.random() * REEL_MODULE.RESOURCES_COUNT );

       var symbolSrc = "resources\/Smashing_Halloween_Icons\/reel" + symbolNumber + ".png";
       var id = reelId + "Symbol"+i;

       var img = $('<img>');
       img.attr( 'id', id )
          .attr( 'src', symbolSrc )
          .css( 'width', REEL_MODULE.SYMBOL_WIDTH.toString() )
          .css( 'height', REEL_MODULE.SYMBOL_HEIGHT.toString() )
          .css( 'display', 'block' );

       
       this.symbols.push( img );
       this.container.append( img );
   }

   if( REEL_MODULE.SYMBOLS_COUNT !== 0 ) {
      this.size.width = REEL_MODULE.SYMBOL_WIDTH;
      this.size.height = symbolsCount * REEL_MODULE.SYMBOL_HEIGHT;
   }
};

// REEL
REEL_MODULE.Reel = function() {
   if( !(this instanceof REEL_MODULE.Reel ) ) {
      return new REEL_MODULE.Reel ();
   }

   var that = this;
   this.subReels = [];
   this.animator = new REEL_MODULE.Animator( function() { that.adjustPosition( that ); } );
   this.totalSpin = 0;
}

var reelPrototype = REEL_MODULE.Reel.prototype;


reelPrototype.move = function( x, y ) {
   var that = this;
   that.subReels.forEach( function( subReel ) {
       subReel.move( x, y );
       if( subReel.position.y + subReel.size.height < 0 ) {
           // TODO Do przerobienia
           subReel.move( 0, that.getEndOfReel() - subReel.position.y );
       }
   } );
};

reelPrototype.animate = function( time ) {
   var spinValue = this.animator.animate( time );
   this.totalSpin += spinValue;
   this.move(0, spinValue );
};

reelPrototype.adjustPosition = function( that ) {
   var diffrence = that.totalSpin % REEL_MODULE.SYMBOL_HEIGHT;
   that.totalSpin -= diffrence;
   that.subReels.forEach( function( subReel ) { subReel.move( 0, -diffrence ); } );
};

reelPrototype.resetAnimation = function() {
   this.animator.resetAnimation();
};

reelPrototype.setDelay = function( delay ) {
   this.animator.animationDelay = delay;
};

reelPrototype.getEndOfReel = function() {
    if( this.subReels.length === 0 ) {
        return 0;
    }
    var max = window.Ix.Enumerable.fromArray( this.subReels).select( function( subReel ) {
        return subReel.position.y + subReel.size.height
    })
    .max();

    if( max === Infinity ) {
        throw "max return Infinity";
    }
    return max;
}

REEL_MODULE.toPx = function( value ) {
   return value.toString() + 'px';
};

REEL_MODULE.loadReel = function(reelNumber) {
   reelNumber = reelNumber || 0;

   var reel = new REEL_MODULE.Reel();

   var subReel = new REEL_MODULE.SubReel();
   subReel.load('reel1Part1', 20);
   reel.subReels.push( subReel );

   var subReel = new REEL_MODULE.SubReel();
   subReel.load('reel1Part2', 20);
   subReel.move( 0, reel.getEndOfReel() );
   reel.subReels.push( subReel );

    reel.move( reelNumber * REEL_MODULE.SYMBOL_WIDTH, 0 );
    reel.setDelay( reelNumber * 100 );
    return reel;
};

REEL_MODULE.append = function( reel, element ) {
    reel.subReels.forEach( function( subReel ) {
        element.append( subReel.container)
    });
}
