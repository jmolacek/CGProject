function GLVertexAttribute(name, program, context) {
    this.glContext = context;
    this.location = this.glContext.getAttribLocation(program, name);
}

GLVertexAttribute.prototype.enableAttributePointer = function (count, type, offset, buffer) {
    if (typeof buffer !== 'undefined') {
        buffer.bind()
    }
    this.glContext.vertexAttribPointer(this.location, count, type, false, 0, offset);
    this.glContext.enableVertexAttribArray(this.location);
}