const events = require('./events')

var drawBoundingBox = require('./config').drawBoundingBox

var calculateTriangleBoundingBox = require('./util').calculateTriangleBoundingBox
var containsPoint = require('./util').containsPoint

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

function distanceBetween(v1, v2) {
    var xDist = v1.x - v2.x
    var yDist = v1.y - v2.y

    var pointDist = Math.sqrt(xDist * xDist + yDist * yDist)
    return pointDist
}

Ship.prototype.onTouched = function (ent) {

    //this._velocityX = -this._velocityX
    //this._velocityY = -this._velocityY

    var b = this.bounds

    var vertices = [
        { x: b.x, y: b.y },
        { x: b.x + b.width, y: b.y },
        { x: b.x + b.width, y: b.y + b.height },
        { x: b.x, y: b.y + b.height }
    ]

    var xPositionChanged = false
    var xPositionDelta = null
    var yPositionChanged = false
    var yPositionDelta = null

    var relativePosition = []

    vertices.forEach( (v) => {
        if (containsPoint(ent.bounds, v)) {
            if (!xPositionChanged) {
                if (this._velocityX < 0) {
                    var referencePointX = ent.bounds.x + ent.bounds.width
                    var diff = referencePointX - b.x

                    xPositionDelta = diff

                    xPositionChanged = true

                    relativePosition.push({ direction: 'right', deltaAbs: Math.abs(xPositionDelta)})

                } else {
                    var referencePointX = ent.bounds.x
                    var diff = b.x + b.width - referencePointX

                    xPositionDelta = -diff

                    xPositionChanged = true

                    relativePosition.push({ direction: 'left', deltaAbs: Math.abs(xPositionDelta)})
                }
            }

            if (!yPositionChanged) {
                if (this._velocityY < 0) {
                    var referencePointY = ent.bounds.y + ent.bounds.height
                    var diff = referencePointY - b.y

                    yPositionDelta = diff

                    yPositionChanged = true

                    relativePosition.push({ direction: 'down', deltaAbs: Math.abs(yPositionDelta)})
                } else {
                    var referencePointY = ent.bounds.y
                    var diff = b.y + b.height - referencePointY

                    yPositionDelta = -diff

                    yPositionChanged = true

                    relativePosition.push({ direction: 'up', deltaAbs: Math.abs(yPositionDelta)})
                }
            }
        }
    })

    var v1 = { x: this._x + xPositionDelta, y: this._y }
    var v2 = { x: this._x, y: this._y + yPositionDelta }

    var dist1 = distanceBetween(v1, { x: this._x, y: this._y })
    var dist2 = distanceBetween(v2, { x: this._x, y: this._y })

    if (dist1 < dist2) {
        this._x = v1.x
        this._y = v1.y
    } else {
        this._x = v2.x
        this._y = v2.y
    }

    events.emit('hit', relativePosition)
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
    this._rotating += (diffRotation * timeScale * 3);
    this._angle += this._rotating * timeScale;

    this.applyEngineForce();

    this._x += this._velocityX * timeScale;
    this._y += this._velocityY * timeScale;

    var velocityXLossPerHalfSecond = 0.9 * this._velocityX;
    var velocityYLossPerHalfSecond = 0.9 * this._velocityY;

    this._velocityX -= velocityXLossPerHalfSecond * timeScale * 2;
    this._velocityY -= velocityYLossPerHalfSecond * timeScale * 2;

    this.wrapPosition(1024, 768);

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

    if (drawBoundingBox) {
        this.drawBounds(context)
    }

    context.translate(midPointX, midPointY);
    context.rotate(this._angle * Math.PI / 180);
    context.translate(-midPointX, -midPointY);

    context.strokeStyle = '#000000';
    context.fillStyle = '#6621CF';

    context.beginPath();
    context.moveTo(midPointX, this._y);
    context.lineTo(this._x, bottomPointY);
    context.lineTo(this._x + this.width, bottomPointY);
    context.lineTo(midPointX, this._y);
    context.stroke();
    context.fill();

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


module.exports = Ship
