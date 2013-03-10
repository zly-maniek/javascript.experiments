var REEL_MODULE = REEL_MODULE || {};

REEL_MODULE.ConstSpeedAnimator = function() {
   if( !(this instanceof REEL_MODULE.ConstSpeedAnimator) ) {
      return new REEL_MODULE.ConstSpeedAnimator();
   }

   this.spinValue = -30;
   this.isAnimationFinished = false;
};

REEL_MODULE.ConstSpeedAnimator.prototype.animate = function( time ) {
   if( this.isAnimationFinished ) { return 0; }

   if( time >= REEL_MODULE.FINISH_ANIMATION_TIME ) {
      this.isAnimationFinished = true;
   }

   return this.spinValue;
};

REEL_MODULE.FinishAnimationAnimator = function( currentTime ) {
   if( !(this instanceof REEL_MODULE.FinishAnimationAnimator) ) {
      return new REEL_MODULE.FinishAnimationAnimator();
   }

   this.animationStart = currentTime;
   this.isAnimationFinished = false;
};

REEL_MODULE.FinishAnimationAnimator.prototype.animate = function( time ) {
   if( this.isAnimationFinished ) { return 0; }
   var animationTime = time - this.animationStart;
   var a = Math.pow( 1.01, ( -0.4 * animationTime ) );
   var position = Math.cos( animationTime / 100 ) * a * 5;
   if( a < 0.01  ) {
      this.isAnimationFinished = true;
      return 0;
   }


   return -position;
};

REEL_MODULE.Animator = function( animatorChangedCallback ) {
   if( !(this instanceof REEL_MODULE.Animator) ) {
      return new REEL_MODULE.Animator();
   }

   this.currentAnimator = new REEL_MODULE.ConstSpeedAnimator();
   this.animationDelay = 0;
   this.animatorChangedCallback = animatorChangedCallback || function() { };
};

REEL_MODULE.Animator.prototype.animate = function( time ) {
   var animationTime = time - this.animationDelay;

   if( animationTime < 0 ) { return 0; }

   if( this.currentAnimator.isAnimationFinished && !( this.currentAnimator instanceof REEL_MODULE.FinishAnimationAnimator ) ) {
      this.changeAnimator( new REEL_MODULE.FinishAnimationAnimator( animationTime ) );
   }

   return this.currentAnimator.animate( animationTime );
};

REEL_MODULE.Animator.prototype.resetAnimation = function() {
   this.changeAnimator( new REEL_MODULE.ConstSpeedAnimator() );
   this.totalSpin = 0;
};

REEL_MODULE.Animator.prototype.changeAnimator = function( animator ) {
   this.currentAnimator = animator;
   this.animatorChangedCallback();
};


