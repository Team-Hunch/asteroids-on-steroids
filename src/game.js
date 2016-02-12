var canvas = document.getElementById('world');
var ctx = canvas.getContext('2d');

var containsPoint = require('./util').containsPoint
var Ship = require('./ship')
var Rock = require('./rock')

var ship = new Ship({
    width: 50,
    height: 60
});

var rock = new Rock();
var bordoRock = new Rock({
    x: 80,
    y: 380,
    width: 70,
    height: 80,
    colro: '#8C2807',
    darkerColro: '#401203'
});

document.addEventListener('keyup', function(event) {
    switch (event.keyCode) {
        case 37: {
            ship.setRotatingLeft(false);
            break;
        }

        case 39: {
            ship.setRotatingRight(false);
            break;
        }

        case 38: {
            ship.stopEngine();
            break;
        }
    }
}, false);

document.addEventListener('keydown', function(event) {
    switch (event.keyCode) {
        case 37: {
            ship.setRotatingLeft(true);
            break;
        }

        case 39: {
            ship.setRotatingRight(true);
            break;
        }

        case 38: {
            ship.startEngine();
            break;
        }
    }
}, false);

var lastDelta = 0;
var entities = [];

entities.push(rock);
entities.push(bordoRock);
entities.push(ship);

window.requestAnimationFrame(function loop (delta) {
    window.requestAnimationFrame(loop);

    if (lastDelta > 0) {
        entities.forEach(function (ent) {
            ent.update(delta - lastDelta);
        })
    }

    checkCollisions(entities)

    lastDelta = delta

    ctx.clearRect(0, 0, 800, 600);

    entities.forEach(function (ent) {
        ent.draw(ctx);
    })
});



function hasCollision(ent1, ent2) {
    var bounds1 = ent1.bounds;
    var bounds2 = ent2.bounds;

    var vertex = [
        { x: bounds2.x, y: bounds2.y },
        { x: bounds2.x + bounds2.width, y: bounds2.y },
        { x: bounds2.x, y: bounds2.y + bounds2.height},
        { x: bounds2.x + bounds2.width, y: bounds2.y + bounds2.height }
    ]

    var collided =  vertex.reduce(function (value, vertex) {
        return value || containsPoint(bounds1, vertex);
    }, false);

    return collided;
}

function checkCollisions(list) {
    list.forEach(function(ent1) {
        list.forEach(function(ent2) {
            if (ent1 === ent2) {
                return;
            }

            if (hasCollision(ent1, ent2) || hasCollision(ent2, ent1)) {
                ent1.onTouched(ent2);
            }
        })
    })
}


