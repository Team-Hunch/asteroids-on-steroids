var canvas = document.getElementById('world');
var ctx = canvas.getContext('2d');

var ship = new Ship({
    width: 50,
    height: 60
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
window.requestAnimationFrame(function loop (delta) {
    window.requestAnimationFrame(loop);

    if (lastDelta > 0) {
        ship.update(delta - lastDelta);
    }

    lastDelta = delta

    ctx.clearRect(0, 0, 800, 600);
    ship.draw(ctx);
});



function rotatePointAroundCenter(point, center, angle) {
    var theta = angle * Math.PI / 180;
    var x = point.x;
    var y = point.y;
    var x0 = center.x;
    var y0 = center.y;


    var x2 = x0 + (x - x0) * Math.cos(theta) - (y - y0) * Math.sin(theta);
    var y2 = y0 + (x - x0) * Math.sin(theta) + (y - y0) * Math.cos(theta);

     return {
         x: x2,
         y: y2
     }
}

function calculateTriangleBoundingBox(x, y, w, h, angle) {

    var maxX = null, maxY = null, minX = null, minY = null;

    var center = {
        x: x + w / 2,
        y: y + h / 2
    }

    var corners = [
        { x: x + w / 2, y: y },
        { x: x, y: y + h },
        { x: x + w, y: y + h }
    ]

    corners.forEach(function (point) {
        var rotatedPoint = rotatePointAroundCenter(point, center, angle);

        if (rotatedPoint.x > maxX || maxX == null) {
            maxX = rotatedPoint.x
        }

        if (rotatedPoint.y > maxY || maxY == null) {
            maxY = rotatedPoint.y
        }

        if (rotatedPoint.x < minX || minX == null) {
            minX = rotatedPoint.x
        }

        if (rotatedPoint.y < minY || minY == null) {
            minY = rotatedPoint.y
        }
    })

    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
    }
}

function Ship(options) {
    this._x = 200;
    this._y = 100;

    this._velocityX = 0;
    this._velocityY = 0;

    this._enginePower = 0;

    this._engineRotating = false;

    this._angle = 0;
    this._rotating = 0;
    this.targetRotating = 0;

    this.width = options.width;
    this.height = options.height;

    this.bounds = {
        x: this._x,
        y: this._y,
        width: this.width,
        height: this.height
    }
}

Ship.prototype.applyEngineForce = function () {
    var degree = this._angle * Math.PI / 180;
    var engineForceX = Math.sin(degree) * this._enginePower;
    var engineForceY = - Math.cos(degree) * this._enginePower;

    this._velocityX += engineForceX;
    this._velocityY += engineForceY;
};

Ship.prototype.update = function (delta) {
    var timeScale = delta / 1000;
    var diffRotation = this.targetRotating - this._rotating;
    this._rotating += (diffRotation * timeScale);
    this._angle += this._rotating * timeScale;

    this.applyEngineForce();

    this._x += this._velocityX * timeScale;
    this._y += this._velocityY * timeScale;

    var velocityXLossPerHalfSecond = 0.9 * this._velocityX;
    var velocityYLossPerHalfSecond = 0.9 * this._velocityY;

    this._velocityX -= velocityXLossPerHalfSecond * timeScale * 2;
    this._velocityY -= velocityYLossPerHalfSecond * timeScale * 2;

    this.wrapPosition(800, 600);

    this.bounds = calculateTriangleBoundingBox(this._x, this._y, this.width, this.height, this._angle)
};

Ship.prototype.wrapPosition = function (width, height) {
    if (this._x < (0 - this.width)) {
        this._x += width + this.width;
    } else if (this._x > width){
        this._x -= width + this.width;
    }

    if (this._y < (0 - this.height)) {
        this._y += height + this.height;
    } else if (this._y > height){
        this._y -= height + this.height;
    }
};

Ship.prototype.draw = function (context) {
    var midPointX = this._x + this.width / 2;
    var midPointY = this._y + this.height / 2;
    var bottomPointY = this._y + this.height;

    context.save();

    this.drawBounds(context)

    context.translate(midPointX, midPointY);
    context.rotate(this._angle * Math.PI / 180);
    context.translate(-midPointX, -midPointY);

    context.strokeStyle = '#000000';

    context.beginPath();
    context.moveTo(midPointX, this._y);
    context.lineTo(this._x, bottomPointY);
    context.lineTo(this._x + this.width, bottomPointY);
    context.lineTo(midPointX, this._y);
    context.stroke();

    if (this._engineRotating || this._enginePower > 0.5) {
        this.drawFlame(context);
    }



    context.restore();
};

Ship.prototype.drawBounds = function (context) {
    context.save();

    context.strokeStyle = '#ff0000';

    var b = this.bounds;

    context.beginPath();
    context.moveTo(b.x, b.y);
    context.lineTo(b.x + b.width, b.y);
    context.lineTo(b.x + b.width, b.y + b.height);
    context.lineTo(b.x, b.y + b.height);
    context.lineTo(b.x, b.y);
    context.stroke();

    context.restore();
}

Ship.prototype.drawFlame = function (context) {

    context.save();

    var flameHeight = 20;

    var flameGap = this.width / 6;
    var bottomY = this._y + this.height;

    var maker = gapMaker(flameGap)

    context.beginPath();
    context.moveTo(this._x, bottomY);

    for (var i = 0; i < 2; i++) {
        context.lineTo(this._x + maker.next().value, bottomY + flameHeight);
        context.lineTo(this._x + maker.next().value, bottomY + flameHeight * 0.4);
    }

    context.lineTo(this._x + maker.next().value, bottomY + flameHeight);
    context.lineTo(this._x + maker.next().value, bottomY);

    context.lineWidth = 3;
    context.strokeStyle = '#ff0000';
    context.fillStyle = '#ffec48';

    context.stroke();
    context.fill();

    context.restore();
}

Ship.prototype.setRotatingRight = function (value) {
    if (value) {
        this.targetRotating = 300
    } else {
        this.targetRotating = 0;
    }

    this._engineRotating = value;
}

Ship.prototype.setRotatingLeft = function (value) {
    if (value) {
        this.targetRotating = -300
    } else {
        this.targetRotating = 0;
    }

    this._engineRotating = value;
};

Ship.prototype.startEngine = function () {
    this._enginePower = 20;
};

Ship.prototype.stopEngine = function () {
    this._enginePower = 0;
};


function* gapMaker(gap) {
    var totalGap = 0;
    while(true) {
        totalGap = totalGap + gap;
        yield totalGap;
    }
}
