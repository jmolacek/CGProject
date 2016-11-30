// function GLModelType(attributeMap) {
// 	this.attributes = attributeMap;
// 	GLModelType.modelTypes.push(this);
// }

// GLModelType.attributes = new Object();
// GLModelType.modelTypes = [];
// GLModelType.glContext = null;
// GLModelType.glProgram = null;

// GLModelType.addAttribute = function (bufferSize, bufferType, attributeName, componentCount, componentType, attributeOffset) {
// 	var attr = new Object();
// 	this.attributes[attributeName] = attr;

// 	var buffer = new GLBufferObject(this.glContext, bufferSize, bufferType);
// 	attr.buffer = buffer;

// 	var attribute = new GLVertexAttribute(attributeName, this.glProgram, this.glContext);
// 	attr.attribute = attribute;
// 	attr.componentCount = componentCount;
// 	attr.componentType = componentType;
// 	attr.attributeOffset = attributeOffset;
// 	attr.nextAttributeId = 0;
// };

// GLModelType.pushAllChanges = function () {

// }

// GLModelType.prototype = {
// 	attributeId: = 0,
// 	attributes: null,
// 	models: null,
// 	addModel: function (model) {
// 		if (this.models == null) {
// 			this.models = [];
// 		}

// 		this.models.push(model);
// 	}
// }