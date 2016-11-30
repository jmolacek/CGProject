function Quaternion(w, x, y, z) {
    if (typeof w !== 'undefined') {
        this.w = w;
    } else {
        this.w = 0;
    }

    if (typeof x !== 'undefined') {
        this.x = x;
    } else {
        this.x = 0;
    }

    if (typeof y !== 'undefined') {
        this.y = y;
    } else {
        this.y = 0;
    }

    if (typeof z !== 'undefined') {
        this.z = z;
    } else {
        this.z = 0;
    }
}

Quaternion.fromAngleNormal = function (theta, n) {
    var halfTheta = theta / 2.0;
    var v = scale(Math.sin(halfTheta), n);
    return new Quaternion(Math.cos(halfTheta), v[0], v[1], v[2]);
}

Quaternion.prototype.added = function (other) {
    return new Quaternion(this.w + other.w, this.x + other.x, this.y + other.y, this.z + other.z);
}

Quaternion.prototype.multiplied = function (other) {
    if (other instanceof Quaternion) {
        var w = (this.w * other.w) - (this.x * other.x) - (this.y * other.y) - (this.z * other.z);
        var x = (this.w * other.x) + (other.w * this.x) + (this.y * other.z) - (other.y * this.z);
        var y = (this.w * other.y) - (this.x * other.z) + (other.w * this.y) + (other.x * this.z);
        var z = (this.w * other.z) + (this.x * other.y) - (other.x * this.y) + (other.w * this.z);

        return new Quaternion(w, x, y, z);
    } else {
        return new Quaternion(this.w * other, this.x * other, this.y * other, this.z * other);
    }
}

Quaternion.prototype.norm = function () {
    return Math.sqrt(Math.pow(this.w, 2) + Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z, 2));
}

Quaternion.prototype.conjugate = function() {
    return new Quaternion(this.w, -this.x, -this.y, -this.z);
}

Quaternion.prototype.inverse = function() {
    return this.conjugate().multiplied(Math.pow(this.norm(), -2));
}

Quaternion.prototype.array = function() {
    return [this.w, this.x, this.y, this.z];
}

function event_coordinate_translation(e, element)
{
    var x = e.clientX - element.offsetLeft;
    var y = e.clientY - element.offsetTop;

    var clipX = -1 + ((2 * x) / element.width);
    var clipY = -1 + ((2 * (element.height - y)) / element.height);

    return {x: clipX, y: clipY};
}