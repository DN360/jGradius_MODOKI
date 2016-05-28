var gradius = null;

$(document).ready(function() {
    /* global $, Game, Key */
    gradius = new Game("gradius");
    gradius.config = "p_map/pixel.pxc";
    gradius.updateFunction = updateGame;
    gradius.drawFunction = drawGame;
    gradius.Initialize();
    
});


var shwBullets = [];

function moveLimit() {
    gradius.UpdateSprite("bigviper", function(bigviper) {
        if (bigviper.Position.LF < 0) {
            bigviper.Position.LF = 0;
        } else if (bigviper.Position.RT() > gradius.canvas_size.width) {
            bigviper.Position.LF = gradius.canvas_size.width - bigviper.Size.Width;
        }
        if (bigviper.Position.TP < 0) {
            bigviper.Position.TP = 0;
        } else if (bigviper.Position.BM() > gradius.canvas_size.height) {
            bigviper.Position.TP = gradius.canvas_size.height - bigviper.Size.Height;
        }
    });
}

var updateGame = function() {
    
    if (gradius.IsKeyPressed(Key.LEFT)) {
        gradius.UpdateSprite("bigviper", function(bigviper) {
            bigviper.Position.LF -= bigviper.PixelConfig.CellSize.width;
        });
    }
    if (gradius.IsKeyPressed(Key.RIGHT)) {
        gradius.UpdateSprite("bigviper", function(bigviper) {
            bigviper.Position.LF += bigviper.PixelConfig.CellSize.width;
        });
    }
    if (gradius.IsKeyPressed(Key.UP)) {
        gradius.UpdateSprite("bigviper", function(bigviper) {
            bigviper.Position.TP -= bigviper.PixelConfig.CellSize.width;
        });
    }
    if (gradius.IsKeyPressed(Key.DOWN)) {
        gradius.UpdateSprite("bigviper", function(bigviper) {
            bigviper.Position.TP += bigviper.PixelConfig.CellSize.width;
        });
    }
    moveLimit();
    if (gradius.IsKeyPressed(Key.SPACE)) {
        var bigviper = gradius.GetSprite("bigviper");
        var bullet   = gradius.GetValidMultiSprite("n_bullet");
        gradius.UpdateSprite(bullet.SpriteName, function(Sprite) {
            Sprite.Position.LF = bigviper.Position.RT();
            Sprite.Position.TP = bigviper.Position.CY() - bigviper.PixelConfig.CellSize.height;
        });
        bullet.Usage = false;
        shwBullets.push(bullet.SpriteName);
        bullet.Update = function(spriteName) {
            gradius.UpdateSprite(spriteName, function(Sprite) {
                Sprite.Position.LF += bigviper.PixelConfig.CellSize.width * 10;
            });
            var Sprite = gradius.GetSprite(spriteName);
            if (Sprite.Position.LF > gradius.canvas_size.width) {
                Sprite.Usage = true;
                shwBullets.some(function(v, i){
                    if (v == spriteName) 
                        shwBullets.splice(i,1);
                });
            }
            return !Sprite.Usage;
        };
    }
}

var drawGame = function() {
    gradius.DrawSprite("bigviper");
    $.each(shwBullets, function(num){
        gradius.DrawSprite(shwBullets[num]);
    });
};