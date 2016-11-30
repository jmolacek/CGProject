function GLBufferObject (glContext, size, bufferType) {
    if (typeof bufferType === 'undefined') {
        this.bufferType = glContext.ARRAY_BUFFER
    } else {
        this.bufferType = bufferType;
    }

    this.size = size;
    this.bufferHandle = glContext.createBuffer();
    this.glContext = glContext;
    this.glContext.bindBuffer(this.bufferType, this.bufferHandle);
    this.glContext.bufferData(this.bufferType, this.size, glContext.STATIC_DRAW);
}

GLBufferObject.prototype.subData = function (offset, list) {
    this.bind();
    this.glContext.bufferSubData(this.bufferType, offset, list);
}

GLBufferObject.prototype.data = function(list) {
    this.bind()
    this.glContext.bufferData(this.bufferType, list, this.glContext.STATIC_DRAW);
}

GLBufferObject.prototype.bind = function () {
    this.glContext.bindBuffer(this.bufferType, this.bufferHandle);
}