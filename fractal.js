function FractalMountain(n) {
	this.n = n;

	this.total = Math.pow(2, n) + 1;
	this.verticies = new Array(this.total);

	for (var i = 0; i < this.total; i++) {
		this.verticies[i] = new Array(this.total);
	}

	var last = this.total - 1;
	this.verticies[0][0] = 0;
	this.verticies[last][0] = 0;
	this.verticies[0][last] = 0;
	this.verticies[last][last] = 0;

	this.max = {x: 0, y: 0, z: 0};
}

FractalMountain.d = 40;
FractalMountain.H = 5;

FractalMountain.prototype.create = function () {
	this.partition(0, 0, this.n);
}

FractalMountain.prototype.triangleIndicies = function () {
	var indexList = new Uint16Array(3 * 2 * (this.total - 1) * (this.total - 1));
	var vertexList = this.vertexList();
	var counter = 0;

	for (var i = 0; i < this.verticies.length - 1; i++) {
		for (var j = 0; j < this.verticies[i].length - 1; j++) {
			indexList[counter] = this.translateXYToIndex(i, j);
			indexList[counter + 1] = this.translateXYToIndex(i, j + 1);
			indexList[counter + 2] = this.translateXYToIndex(i + 1, j + 1);

			indexList[counter + 3] = this.translateXYToIndex(i + 1, j + 1);
			indexList[counter + 4] = this.translateXYToIndex(i + 1, j);
			indexList[counter + 5] = this.translateXYToIndex(i, j);

			// if (vertexList[indexList[counter] * 3 + 2] !== this.verticies[i][j]) {
			// 	throw "NO";
			// }

			counter += 6;
		}
	}

	return indexList;
}

FractalMountain.prototype.translateXYToIndex = function (x, y) {
	var xOffset = x * this.total;
	var totalOffset = xOffset + y;
	return totalOffset;
}

FractalMountain.prototype.vertexList = function (xyTranslationFunc) {
	var list = new Array(3 * this.total * this.total);
	var counter = 0;

	if (typeof xyTranslationFunc !== 'function') {
		xyTranslationFunc = function (x, y) {
			return {x: x, y: y};
		}
	}

	for (var i = 0; i < this.verticies.length; i++) {
		for (var j = 0; j < this.verticies[i].length; j++) {
			var translated = xyTranslationFunc(i, j);
			list[counter] = translated.x;
			list[counter + 1] = translated.y;
			list[counter + 2] = this.verticies[i][j];

			this.max.x = Math.max(this.max.x, translated.x);
			this.max.y = Math.max(this.max.y, translated.y);
			this.max.z = Math.max(this.max.z, this.verticies[i][j]);
			counter += 3;
		}
	}

	return list;
}

FractalMountain.prototype.normals = function () {
	var normalList = new Array( Math.pow(this.total, 2) );

	for (var i = 0; i < this.verticies.length; i++) {
		for (var j = 0; j < this.verticies[i].length; j++) {
			var rightI = i + 1;
			var leftI = i - 1;
			var upperJ = j - 1;
			var lowerJ = j + 1;

			var normals = [];

			if (rightI < this.verticies.length) {
				if (lowerJ < this.verticies[i].length) {
					var n = this.positiveCrossProduct(rightI, j, i, lowerJ);

					normals.push(n);
				}

				if (upperJ >= 0) {
					var n = this.positiveCrossProduct(rightI, j, i, upperJ);
					normals.push(n);
				}
			}

			if (leftI >= 0) {
				if (lowerJ < this.verticies[i].length) {
					var n = this.positiveCrossProduct(i, lowerJ, leftI, j);
					normals.push(n);
				}

				if (upperJ >= 0) {
					var n = this.positiveCrossProduct(leftI, j, i, upperJ);
					normals.push(n);
				}
			}

			var index = this.translateXYToIndex(i, j);
			normalList[index] = averageNormals(normals);
		}
	}

	return normalList;
}

function averageNormals(normals) {
	var newNormal = normals[0];
	for (var i = 1; i < normals.length; i++) {
		newNormal = add(newNormal, normals[i]);
	}

	newNormal = normalize(newNormal);

	return newNormal;
}

FractalMountain.prototype.positiveCrossProduct = function (x1, y1, x2, y2) {
	var vl, vr;
	var angle1 = Math.atan(y1 / x1);
	var angle2 = Math.atan(y2 / x2);

	if (angle1 > angle2) {
		vl = vec3(x1, y1, this.verticies[x1][y1]);
		vr = vec3(x2, y2, this.verticies[x2][y2]);
	} else {
		vl = vec3(x2, y2, this.verticies[x2][y2]);
		vr = vec3(x1, y1, this.verticies[x1][y1]);
	}

	return cross(vr, vl);
}

FractalMountain.prototype.vertexObjectList = function (xyTranslationFunc) {
	var list = new Array(this.total * this.total);
	var counter = 0;

	if (typeof xyTranslationFunc !== 'function') {
		xyTranslationFunc = function (x, y) {
			return {x: x, y: y};
		}
	}

	for (var i = 0; i < this.verticies.length; i++) {
		for (var j = 0; j < this.verticies[i].length; j++) {
			var translated = xyTranslationFunc(i, j);
			list[counter] = {x: translated.x, y: translated.y, z: this.verticies[i][j]};
			counter += 1;
		}
	}

	return list;
} 

FractalMountain.prototype.partition = function (x, y, n) {

	if (n < 1) {
		return;
	}

	var length = Math.pow(2, n);
	var halfLength = Math.floor(length / 2);

	var upperMidX = x + halfLength;
	var upperMidY = y;

	var rightMidX = x + length;
	var rightMidY = y + halfLength;

	var lowerMidX = x + halfLength;
	var lowerMidY = y + length;

	var leftMidX = x;
	var leftMidY = y + halfLength;

	var vertexUL = this.verticies[x][y];
	var vertexUR = this.verticies[x + length][y];
	var vertexLR = this.verticies[x + length][y + length];
	var vertexLL = this.verticies[x][y + length];
	//FIXME: un-zero
	this.verticies[upperMidX][upperMidY] = (vertexUL + vertexUR) / 2.0 + this.random(n);
	this.verticies[rightMidX][rightMidY] = (vertexUR + vertexLR) / 2.0 + this.random(n);
	this.verticies[lowerMidX][lowerMidY] = (vertexLR + vertexLL) / 2.0 + this.random(n);
	this.verticies[leftMidX][leftMidY] = (vertexLL + vertexUL) / 2.0 + this.random(n);

	var midSum = this.verticies[upperMidX][upperMidY] + this.verticies[rightMidX][rightMidY] 
	+ this.verticies[lowerMidX][lowerMidY] + this.verticies[leftMidX][leftMidY];

	this.verticies[x + halfLength][y + halfLength] = midSum / 4.0 + this.random(n);

	// console.log(vertexUL, this.verticies[upperMidX][upperMidY], vertexUR);
	// console.log(this.verticies[leftMidX][leftMidY], this.verticies[x + halfLength][y + halfLength], this.verticies[rightMidX][rightMidY]);
	// console.log(vertexLL, this.verticies[lowerMidX][lowerMidY], vertexLR);

	n -= 1;
	this.partition(x, y, n);
	this.partition(upperMidX, upperMidY, n);
	this.partition(x + halfLength, y + halfLength, n);
	this.partition(x, y + halfLength, n);
}

FractalMountain.prototype.random = function (n) {
	var dn = Math.pow(1/2, n * FractalMountain.H / 2) * FractalMountain.d;

	var rand = general_normal(Math.random(), 0, dn);
	if (rand < 0) {
		return -rand;
	} else {
		return rand;
	}
};

function normal_phi(x) {
	return Math.exp(- Math.pow(x, 2)) / Math.sqrt(Math.PI);
}

function general_normal(x, mu, sigma) {
	return (1 / sigma) * normal_phi((x - mu) / sigma);
}

