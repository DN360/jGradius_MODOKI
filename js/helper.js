/* global $ */
var window_width = $('#mainCanvas').width();
var window_height = $('#mainCanvas').height();
var sprites = {};

function updateGLOBAL(){
    window_width = $('#mainCanvas').attr('width');
    window_height = $('#mainCanvas').attr('height');
}

function spliteInit(){
    $.getJSON("p_map/pixel.pxc", function(dat) {
        var cell_w = Number(dat["size"]["w"]);
        var cell_h = Number(dat["size"]["h"]);
        var window_w = Number(dat["size"]["ww"]);
        var window_h = Number(dat["size"]["wh"]);
        var window_max = Number(dat["size"]["max"]);
        
        if (window_w && window_h) {
            if (window_max) {
                var rw = window_w > window_h ? window_max : (window_w / window_h) * window_max;
                var rh = window_h > window_w ? window_max : (window_h / window_w) * window_max;
                $("#mainCanvas").attr("width", rw);
                $("#mainCanvas").attr("height", rh);
            }
        }
        
        //各スプライトの画像保存と登録
        $("body").append("<canvas id='tempCanvas' style='display: hidden'></canvas>");
        $.each(dat["layer"], function(layn, lay){
            $.get("p_map/" + lay.file + ".pxm", function(pix) {
                var multiCount = 0, multiMax = 1;
                while (multiCount < multiMax) {
                    var spriteName = lay.name;
                    var nextSpriteName = lay.name;
                    if (multiMax - multiCount >= 1) {
                        nextSpriteName = spriteName + (multiCount + 1).toString();
                    }
                    if (lay.multi != undefined) {
                        multiMax = lay.multi;
                        spriteName = spriteName + multiCount.toString();
                    }
                    if (multiCount == 0) spriteName = lay.name;
                    sprites[spriteName] = {
                        spritename: spriteName,
                        filename  : lay["file"],
                        colordata : dat["color"],
                        recycle: true,
                        pixel     : [],
                        pixeldata : "",
                        nextName  : nextSpriteName,
                        position  : {
                            pixdata    : "",
                            sprite_size: "",
                            x          : 0,
                            y          : 0,
                            shx        : function() { return this.x + this.pixdata.cell_size.width  / 2; },
                            shy        : function() { return this.y + this.pixdata.cell_size.height / 2; },
                            rtx        : function() { return this.x + this.sprite_size.width;  },
                            rty        : function() { return this.y; },
                            lbx        : function() { return this.x; },
                            lby        : function() { return this.y + this.sprite_size.height; },
                            rbx        : function() { return this.rtx(); },
                            rby        : function() { return this.lby(); },
                            cnx        : function() { return this.x + this.sprite_size.width  / 2; },
                            cny        : function() { return this.y + this.sprite_size.height / 2; }
                        },
                        size      : {
                            width     : 0,
                            height    : 0,
                            raw_width : 0,
                            raw_height: 0
                        },
                        loaded    : false,
                        draw: function(){
                            var coldata = this.colordata;
                            var pos = this.position;
                            var pixs = this.pixel;
                            var pixdata = this.pixeldata;
                            $.each(pixs, function(pixi){
                                var pix = pixs[pixi];
                                $('#mainCanvas').drawRect({
                                    fillStyle: coldata[pix.cell],
                                    x: pos.shx() + pix.cell_x, y: pos.shy() + pix.cell_y,
                                    width: pixdata.cell_size.width, height: pixdata.cell_size.height
                                });
                            });
                        },
                        update: function() {
                            
                        },
                        next: function() {
                            return sprites[this.nextName];
                        },
                        user: []
                    };
                    var lines = pix.split(';');
                    var cx = 0, cy = 0, c = 0;
                    var mw = 0, mh = 0;
                    $.each(lines, function(linei, line){
                        if (line != ""){
                            var cells = line.split(',');
                            cx = 0;
                            $.each(cells, function(celli, cell) {
                                cell = cell.replace( /\r?\n/g , "" ) ;
                                if (dat["color"][cell] != "null"){
                                    sprites[spriteName].pixel[c] = {
                                        cell_x: cx,
                                        cell_y: cy,
                                        cell  : cell
                                    };
                                    c++;
                                }
                                cx += cell_w; mw = mw > cx ? mw : cx;
                            });
                            cy += cell_h; mh = mh > cy ? mh : cy;
                        }
                    });
                
                    
                    sprites[spriteName].pixeldata = {
                        cell_size: {
                            width : cell_w,
                            height: cell_h
                        }
                    };
                    sprites[spriteName].size.raw_width = mw / cell_w;
                    sprites[spriteName].size.raw_height = mh / cell_h;
                    sprites[spriteName].size.width = mw;
                    sprites[spriteName].size.height = mh;
                    
                    sprites[spriteName].position.pixdata = sprites[spriteName].pixeldata;
                    sprites[spriteName].position.sprite_size = sprites[spriteName].size;
                    
                    sprites[spriteName].loaded = true;
                    
                    multiCount++;
                }
            });
        });
    } );
}

function IncludeExp(str, exps){
    var result = false;
    $.each(exps, function(expi, exp) {
        var exp_str = str.split(exp);
        if (exp_str[0] != str){
            result = {
                spliter   : exp,
                result_str: exp_str[1]
            };
        }
    });
    return result;
}

function drawSprite(spriteName){
    if (spriteName in sprites && sprites[spriteName].loaded){
        sprites[spriteName].draw();
    }
}

function updateSprite(spriteName, position) {
    if (spriteName in sprites && sprites[spriteName].loaded){
        if (position.x != undefined) {
            var exp_x = position.x.toString();
            var x = IncludeExp(exp_x, ['+=', '-=']);
            if (!x) //数値
                sprites[spriteName].position.x = Number(exp_x);
            else
                if (x.spliter == "+=") 
                    sprites[spriteName].position.x += Number(x.result_str);
                else
                    sprites[spriteName].position.x -= Number(x.result_str);
        }
        if (position.y != undefined) {
            var exp_y = position.y.toString();
            var y = IncludeExp(exp_y, ['+=', '-=']);
            if (!y) //数値
                sprites[spriteName].position.y = Number(exp_y);
            else
                if (y.spliter == "+=") 
                    sprites[spriteName].position.y += Number(y.result_str);
                else
                    sprites[spriteName].position.y -= Number(y.result_str);
        }
    }
}

function setSpriteRycyclable(spriteName) {
    if (spriteName in sprites && sprites[spriteName].loaded){
        sprites[spriteName].recycle = true;
    }
}

function gameUpdate() {
    $.each(sprites, function(spriteName, sprite) {
        sprite.update(sprite, spriteName);
    });
}

function getPropertyOfSprite(spriteName) {
    if (spriteName in sprites && sprites[spriteName].loaded){
        return sprites[spriteName];
    }
    return false;
}

function getUserProperty(spriteName, propName) {
    if (spriteName in sprites && sprites[spriteName].loaded){
        return sprites[spriteName].user[propName];
    }
}

function setUserProperty(spriteName, prop, propName) {
    if (spriteName in sprites && sprites[spriteName].loaded){
        sprites[spriteName].user[propName] = prop;
    }
}

function getValidSpriteInMulti(spriteName) {
    if (spriteName in sprites && sprites[spriteName].loaded){
        var sprite = sprites[spriteName];
        while (!sprite.recycle)
            sprite = sprite.next();
        return sprite;
    }
}