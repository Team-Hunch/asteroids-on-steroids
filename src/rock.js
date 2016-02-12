/**
 *
 * @param options.x cannot be 0!
 * @param options.y cannot be 0!
 * @constructor
 */
function Rock(options) {
    options = options || {}

    this._x = options.x || 350;
    this._y = options.y || 250;

    this.width = options.width || 150;
    this.height = options.height || 150;

    this.originalWidth = this.width
    this.originalHeight = this.height

    this.colro = options.colro || '#4F4E02';
    this.darkerColro = options.darkerColro || '#292801';

    this.bounds = {
        x: this._x,
        y: this._y,
        width: this.width,
        height: this.height
    }

    this.shouldShrink = false
    this.nextShrink = 0

    this.shouldGrow = false
    this.nextGrow = 0

}

Rock.prototype.onTouched = function (ent) {
    this.shouldShrink = true

    this.shouldGrow = true
    this.nextGrow = 5000
}

Rock.prototype.growBy = function (change) {
    var oldWidth = this.width;
    var oldHeight = this.height;

    this.width = Math.min(this.width + change, this.originalWidth);
    this.height = Math.min(this.height + change, this.originalHeight);

    var wDiff = oldWidth - this.width;
    var hDiff = oldHeight - this.height;

    this._x = this._x + wDiff / 2;
    this._y = this._y + hDiff / 2;

    this.bounds = {
        x: this._x,
        y: this._y,
        width: this.width,
        height: this.height
    }
};

Rock.prototype.shrinkBy = function (change) {
    var oldWidth = this.width;
    var oldHeight = this.height;

    this.width = Math.max(this.width - change, 0);
    this.height = Math.max(this.height - change, 0);

    var wDiff = this.width - oldWidth;
    var hDiff = this.height - oldHeight;

    this._x = this._x - wDiff / 2;
    this._y = this._y - hDiff / 2;

    this.bounds = {
        x: this._x,
        y: this._y,
        width: this.width,
        height: this.height
    }
};

Rock.prototype.update = function (delta) {
    if (this.shouldShrink && this.nextShrink <= 0) {
        this.nextShrink = 100
        this.shouldShrink = false

        this.shrinkBy(10)
    } else {
        this.nextShrink = Math.max(this.nextShrink - delta, 0)
    }

    if (this.shouldGrow && this.nextGrow <= 0) {
        this.nextGrow = 1000

        this.growBy(10)

        this.bounds = {
            x: this._x,
            y: this._y,
            width: this.width,
            height: this.height
        }
    } else {
        this.nextGrow = Math.max(this.nextGrow - delta, 0)
    }
}


Rock.prototype.draw = function (context) {
    context.save();

    var grd = context.createLinearGradient(this._x, this._y, this._x + this.width, this._y + this.height);
    grd.addColorStop(0.3, this.colro);
    grd.addColorStop(1.0, this.darkerColro);

    context.fillStyle = grd;

    context.beginPath();
    context.moveTo(this._x, this._y);
    context.lineTo(this._x, this._y + this.height);
    context.lineTo(this._x + this.width, this._y + this.height);
    context.lineTo(this._x + this.width, this._y);
    context.fill();

    context.restore();
}

module.exports = Rock
