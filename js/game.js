var Key = {
  _pressed: {},

  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  
  isDown: function(keyCode) {
    return this._pressed[keyCode];
  },
  
  onKeydown: function(event) {
    if (!this._pressed){
        this._pressed = {};
    }
    this._pressed[event.keyCode] = true;
  },
  
  onKeyup: function(event) {
    this._pressed[event.keyCode] = false;
  }
};

$(document).ready(function() {
    $("#mainCanvas").get(0).width = $( window ).width();
    $("#mainCanvas").get(0).height = $( window ).height();
    $.getScript("js/helper.js", function(){});
    initializeGame();
    //キャンバス
    var mainloop = function() {
        updateGame();
        drawGame();
    };

    var animFrame = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            null ;

    if ( animFrame !== null ) {
        var canvas = $('#mainCanvas').get(0);

        var recursiveAnim = function() {
            mainloop();
            animFrame( recursiveAnim, canvas );
        };

        // start the mainloop
        animFrame( recursiveAnim, canvas );
    } else {
        var ONE_FRAME_TIME = 1000.0 / 60.0 ;
        setInterval( mainloop, ONE_FRAME_TIME );
    }
});

function initializeGame() {
    //ピクセルコンフィグ
    
    /* global $ */
    /* global spliteInit */
    /* global sprites */
    /* global window_width, window_height, updateGLOBAL, IncludeExp, drawSprite, updateSprite */
    
    spliteInit();
    
    $('#mainCanvas').drawLayer("#background-layer");
    
    window.addEventListener('keyup', function(event) { Key.onKeyup(event); }, false);
    window.addEventListener('keydown', function(event) { Key.onKeydown(event); }, false);
    //$("body").keydown(Key.onKeydown);
    //$("body").keyup(Key.onKeyup);
    //$("#mainCanvas").keydown(Key.onKeydown);
    //$("#mainCanvas").keyup(Key.onKeyup);
}

var speed = 2;

var moveUp = function() { updateSprite("bigviper", {y: "-=" + speed}); }
var moveRight = function() { updateSprite("bigviper", {x: "+=" + speed}); }
var moveLeft = function() { updateSprite("bigviper", {x: "-=" + speed}); }
var moveDown = function() { updateSprite("bigviper", {y: "+=" + speed}); }


function updateGame() {
    updateGLOBAL();
    
    //キー入力
    //left: 37 up: 38 right: 39 down: 40
    if (Key.isDown(Key.UP)) 
        this.moveUp();
    if (Key.isDown(Key.LEFT)) 
        this.moveLeft();
    if (Key.isDown(Key.DOWN)) 
        this.moveDown();
    if (Key.isDown(Key.RIGHT)) 
        this.moveRight();
    
}

function drawGame() {
    $('#mainCanvas').clearCanvas();
    $('#mainCanvas').drawRect({
        fillStyle: "#000",
        x: 0, y: 0,
        width: 5000, height: 5000
    });
    drawSprite("bigviper");
}