var Particle = require('./particle')

function Emitter(options) {
    this._x = options.x
    this._y = options.y
    this._maxParticles = options.maxParticles || 10000
    this._colro = options.colro || "#30D42A"
    this._alpha = options.alpha || 1.0
    this._ttl = options.ttl || 3.0
    this._angle = options.angle || 0

    this._particles = []
}

Emitter.prototype.update = function (delta) {
    for (var i = 0; i < 7; i++) {
        this.emit()
    }

    this._particles = this._particles.filter(particle => {
        particle.update(delta)

        return !particle.killMe
    })
}

Emitter.prototype.draw = function (ctx) {
    this._particles.forEach(particle => {
        particle.draw(ctx)
    })
}

Emitter.prototype.getParticle = function (options) {
    return new Particle(options)
}

Emitter.prototype.emit = function () {
    var currentParticles = this._particles.length
    if (currentParticles >= this._maxParticles) {
        return
    }

    var particle = this.getParticle({
        x: this._x,
        y: this._y,
        ttl: this._ttl * 1000 + Math.random() * 1000 - 500,
        colro: this._colro,
        velocityX: Math.random() * 100 - 50,
        velocityY: Math.random() * 100 - 50
    })

    this._particles.push(particle)
}

module.exports = Emitter
