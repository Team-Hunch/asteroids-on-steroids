
function Particle(options) {
    this.killMe = false
    this._ttl = options.ttl
    this._ttd = this._ttl
    this._x = options.x
    this._y = options.y
    this._colro = options.colro
    this._velocityX = options.velocityX
    this._velocityY = options.velocityY
    this._startAlpha = options.startAlpha || 0.6

    this._elapsedPercentage = 0.0
}

Particle.prototype.update = function (delta) {
    var timeScale = delta / 1000

    this._x += this._velocityX * timeScale
    this._y += this._velocityY * timeScale

    this._ttd -= delta

    this._elapsedPercentage = 1.0 - this._ttd / this._ttl

    this._alpha = this._startAlpha * (1.0 - this._elapsedPercentage)

    if (this._ttd < 0) {
        this.killMe = true
    }
}

Particle.prototype.draw = function (ctx) {
    ctx.save()

    ctx.globalAlpha = this._alpha
    ctx.fillStyle = this._colro
    ctx.beginPath();
    ctx.arc(this._x, this._y, 2, 0, 2*Math.PI);
    ctx.fill();

    ctx.restore()
}

module.exports = Particle
