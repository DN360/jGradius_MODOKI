/* global $ */
var window_width = $('#mainCanvas').width();
var window_height = $('#mainCanvas').height();
var sprites = [];

function updateGLOBAL(){
    window_width = $('#mainCanvas').width();
    window_height = $('#mainCanvas').height();
}

function spliteInit(){
    $.getJSON("p_map/pixel.pxc", function(dat) {
        var cell_w = Number(dat["size"]["w"]);
        var cell_h = Number(dat["size"]["h"]);
        
        updateGLOBAL();
        //バックグラウンド
        $('#mainCanvas').drawRect({
            layer: true,
            name: "background-layer",
            fillStyle: dat["config"]["background-color"],
            x: 0, y: 0,
            width: window_width, height: window_height
        });
        
        //各スプライトの登録
        $.each(dat["layer"], function(layn, lay){
            $.get("p_map/" + lay.file + ".pxm", function(pix) {
                sprites[lay.name] = {
                    spritename: lay["name"],
                    filename: lay["file"],
                    colordata: dat["color"],
                    pixeldata: [],
                    position: {
                        x: 0,
                        y: 0
                    },
                    loaded: false,
                    draw: function(){
                        var coldata = this.colordata;
                        var pos = this.position;
                        var pixdata = this.pixeldata;
                        $.each(pixdata, function(pixi){
                            var pix = pixdata[pixi];
                            $('#mainCanvas').drawRect({
                                fillStyle: coldata[pix.cell],
                                x: pos.x + pix.cell_x, y: pos.y + pix.cell_y,
                                width: pix.cell_size.width, height: pix.cell_size.height
                            });
                        });
                    }
                };
                var lines = pix.split(';');
                var cx = 0, cy = 0, c = 0;
                $.each(lines, function(linei, line){
                    var cells = line.split(',');
                    cx = 0;
                    $.each(cells, function(celli, cell) {
                        if (dat["color"][cell] != "null"){
                            sprites[lay.name].pixeldata[c] = {
                                cell  : cell,
                                cell_x: cx,
                                cell_y: cy,
                                cell_size: {
                                    width: cell_w,
                                    height: cell_h
                                }
                            };
                            c++;
                        }
                        cx += cell_w;
                    });
                    cy += cell_h;
                });
                sprites[lay.name].loaded = true;
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
                spliter:    exp,
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
        if (position.x) {
            var exp_x = position.x.toString();
            var x = IncludeExp(exp_x, ['+=', '-=']);
            if (!x) //数値
                sprites[spriteName].position.x = exp_x;
            else
                if (x.spliter == "+=") 
                    sprites[spriteName].position.x += Number(x.result_str);
                else
                    sprites[spriteName].position.x -= Number(x.result_str);
        }
        if (position.y) {
            var exp_y = position.y.toString();
            var y = IncludeExp(exp_y, ['+=', '-=']);
            if (!y) //数値
                sprites[spriteName].position.y = exp_y;
            else
                if (y.spliter == "+=") 
                    sprites[spriteName].position.y += Number(y.result_str);
                else
                    sprites[spriteName].position.y -= Number(y.result_str);
        }
    }
}