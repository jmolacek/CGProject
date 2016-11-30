var gl;

var g_fps = 60;
var g_nanosecondsBetweenRender = 1000 / g_fps

var mouse_position = null;
var mouse_changed = false;
var clicking = false;
var clicked_position = null;
var zooming = false;
var zoomStart = null;
var modelView = null;

var vNormal;

var indexLength = null;
var fractal;

var uniformLocations = new Object();

var motionSpeed = 20 / g_fps;
var translationVector = vec3(0.0, 0.0, 0.0);

var fractalN = 7;

var movingForward = false, movingLeft = false, movingBackward = false, movingRight = false, movingUp = false, movingDown = false;

var lightPosition = vec4(32.0, 32.0, 25.0, 1.0); 
var N, L, E;

var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var current_q = null;

var verticies;

var indicies;

window.onresize = function init() {
    var canvas = document.getElementById("gl-canvas");

    var min = Math.min(window.innerHeight - 2 * canvas.offsetTop, window.innerWidth - 2 * canvas.offsetLeft);

    canvas.height = min;
    canvas.width = min;

    gl.viewport( 0, 0, canvas.width, canvas.height );
}

var g_bg_color = [0.8, 0.8, 0.8];

window.onload = function init()
{
    fractal = new FractalMountain(fractalN);
    fractal.create()
    
    verticies = fractal.vertexList();
    normals = fractal.normals();
    indicies = fractal.triangleIndicies();

    var canvas = document.getElementById("gl-canvas");
    
    var min = Math.min(window.innerHeight - 2 * canvas.offsetTop, window.innerWidth - 2 * canvas.offsetLeft);

    canvas.height = min;
    canvas.width = min;

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { 
        alert( "WebGL isn't available" ); 
    }
    
    //  Configure WebGL
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( g_bg_color[0], g_bg_color[1], g_bg_color[2], 1.0 );
    gl.enable(gl.DEPTH_TEST);
    // Enable blending
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
    //  Load shaders and initialize attribute buffers    
    g_program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(g_program);

    //Vertex Buffers and Attributes
    var vertexBuffer = new GLBufferObject(gl, verticies.length);
    vertexBuffer.data(flatten(verticies));

    var vPosition = new GLVertexAttribute("vPosition", g_program, gl);
    vPosition.enableAttributePointer(3, gl.FLOAT, 0);

    vNormal = new GLBufferObject(gl, normals.length * 3);
    vNormal.data(flatten(normals));

    var normalAttr = new GLVertexAttribute("vNormal", g_program, gl);
    normalAttr.enableAttributePointer(3, gl.FLOAT, 0);
    
    var indexBuffer = new GLBufferObject(gl, indicies.length, gl.ELEMENT_ARRAY_BUFFER);
    indexBuffer.data(indicies, gl.STATIC_DRAW);

    //Get locations for uniforms, fill some with data
    uniformLocations.translationLoc = gl.getUniformLocation(g_program, "translation");
    gl.uniform3fv(uniformLocations.translationLoc, flatten(translationVector));
    uniformLocations.qLoc = gl.getUniformLocation(g_program, "q");
    uniformLocations.qInverseLoc = gl.getUniformLocation(g_program, "qInverse");
    uniformLocations.viewMatrixLoc = gl.getUniformLocation(g_program, "viewMatrix");
    uniformLocations.projectionMatrixLoc = gl.getUniformLocation(g_program, "projectionMatrix");
    uniformLocations.colorStyleUseXYZLoc = gl.getUniformLocation(g_program, "colorStyleUseXYZ");
    gl.uniform1i(uniformLocations.colorStyleUseXYZLoc, 0);

    var colors = [vec4(7.0 / 255.0, 32.0 / 255.0, 90.0 / 255.0, 1.0),
                  vec4(100.0 / 255.0, 51.0 / 255.0, 9.0 / 255.0, 1.0),
                  vec4(0.0 / 255.0, 87.0 / 255.0, 11.0 / 255.0, 1.0),
                  vec4(202.0 / 255.0, 225.0 / 255.0, 226.0 / 255.0, 1.0),
                  vec4(1.0, 1.0, 1.0, 1.0)];

    var ambientColors = [];

    for (var i = 0; i < colors.length; i++) {
        var v = scale(0.95, colors[i]);
        v[3] = 1.0;
        ambientColors.push(v);
    }

    var specularColors = [];

    for (var i = 0; i < colors.length; i++) {
        var v = colors[i];
        v[3] = 1.0;
        specularColors.push(v);
    }

    var ambientColorsLoc = gl.getUniformLocation(g_program, "ambientColors");
    gl.uniform4fv(ambientColorsLoc, flatten(ambientColors));

    var diffuseColorsLoc = gl.getUniformLocation(g_program, "diffuseColors");
    gl.uniform4fv(diffuseColorsLoc, flatten(colors));

    var specularColorsLoc = gl.getUniformLocation(g_program, "specularColors");
    gl.uniform4fv(specularColorsLoc, flatten(specularColors));

    var colorStopsLoc = gl.getUniformLocation(g_program, "colorStops");
    gl.uniform1fv(colorStopsLoc, flatten([0.10, 0.15, 0.5, 0.8, 1.0]));

    var shininessLoc = gl.getUniformLocation(g_program, "shininess");
    gl.uniform1fv(shininessLoc, flatten([128, 80, 60, 100, 100]));

    uniformLocations.maxesLoc = gl.getUniformLocation(g_program, "maxes");
    gl.uniform3fv(uniformLocations.maxesLoc, [fractal.max.x, fractal.max.y, fractal.max.z]);

    var perspectiveMatrix = perspective(45, 1, 0.3, 1000);
    gl.uniformMatrix4fv(uniformLocations.projectionMatrixLoc, false, flatten(perspectiveMatrix));
    modelView = lookAt(vec3(-20, -20, 5), vec3(0, 0, 5), vec3(0, 0, 1));
    gl.uniformMatrix4fv(uniformLocations.viewMatrixLoc, false, flatten(modelView));

    var lightPositionLoc = gl.getUniformLocation(g_program, "lightPosition");
    gl.uniform4fv(lightPositionLoc, flatten(lightPosition));

    var lightSpecularLoc = gl.getUniformLocation(g_program, "lightSpecular");
    gl.uniform4fv(lightSpecularLoc, flatten(lightSpecular));

    var lightDiffuseLoc = gl.getUniformLocation(g_program, "lightDiffuse");
    gl.uniform4fv(lightDiffuseLoc, flatten(lightDiffuse));

    var lightAmbientLoc = gl.getUniformLocation(g_program, "lightAmbient");
    gl.uniform4fv(lightAmbientLoc, flatten(lightAmbient));

    //Setup event listeners
    canvas.addEventListener("mousedown", function(e){
        mouse_changed = false
        clicked_position = event_coordinate_translation(e, canvas);

        if (e.shiftKey == true) {
            zooming = true;
            return;
        }

        clicking = true;
        
    } );
    
    canvas.addEventListener("mouseup", function(e){
        zooming = false;
        clicking = false;
    });

    canvas.onmousemove = function (e) {
        if ((clicking == false && zooming == false) || (clicked_position.x == e.clientX && clicked_position.y == e.clientY)) {
            mouse_changed = false;
            return;
        }

        mouse_changed = true;
        mouse_position = event_coordinate_translation(e, canvas);
    }

    window.addEventListener("keydown", function(e) {
        var char = String.fromCharCode(e.keyCode || e.charCode);
        if (char === "W") {
            movingForward = true;
            movingBackward = false;
        } else if (char === "S") {
            movingBackward = true;
            movingForward = false;
        } else if (char === "A") {
            movingLeft = true;
            movingRight = false;
        } else if (char === "D") {
            movingRight = true;
            movingLeft = false;
        } else if (char === " ") {
            movingUp = true;
            movingDown = false;
        } else if (e.key === "Shift") {
            movingDown = true;
            movingUp = false;
        }
    });

    window.addEventListener("keyup", function(e) {
        var char = String.fromCharCode(e.keyCode || e.charCode);
        if (char === "W") {
            movingForward = false;
        } else if (char === "A") {
            movingLeft = false;
        } else if (char === "S") {
            movingBackward = false;
        } else if (char === "D") {
            movingRight = false;
        } else if (char === " ") {
            movingUp = false;
        } else if (e.key === "Shift") {
            movingDown = false;
        }
    });

    var checkbox = document.getElementById("xyz-box");
    checkbox.onclick = function(e) {
        if (checkbox.checked == true) {
            gl.uniform1i(uniformLocations.colorStyleUseXYZLoc, 1);
        } else {
            gl.uniform1i(uniformLocations.colorStyleUseXYZLoc, 0);
        }
    }

    var newButton = document.getElementById("new-button");
    newButton.onclick = function (e) {
        fractal = new FractalMountain(fractalN);
        fractal.create()

        verticies = fractal.vertexList();
        vertexBuffer.data(flatten(verticies));
        indicies = fractal.triangleIndicies();
        normals = fractal.normals();
        indexBuffer.data(indicies, gl.STATIC_DRAW);
        gl.uniform3fv(uniformLocations.maxesLoc, [fractal.max.x, fractal.max.y, fractal.max.z]);

        vNormal.data(flatten(normals));
    
        normalAttr.enableAttributePointer(3, gl.FLOAT, 0);
    }

    lookButton = document.getElementById("look-button");
    var xBox = document.getElementById("x-text");
    var yBox = document.getElementById("y-text");
    var zBox = document.getElementById("z-text");

    lookButton.onclick = function () {
        var x = parseFloat(xBox.value);
        var y = parseFloat(yBox.value);
        var z = parseFloat(zBox.value);
        current_q = null;
        gl.uniform4fv(uniformLocations.qLoc, flatten([0.0, 0.0, 0.0, 0.0]));
        modelView = lookAt(vec3(x, y, z), vec3(0, 0, 5), vec3(0, 0, 1));
        gl.uniformMatrix4fv(uniformLocations.viewMatrixLoc, false, flatten(modelView));
    }

    var lightButton = document.getElementById("light-button");

    lightButton.onclick = function () {
        var x = parseFloat(xBox.value);
        var y = parseFloat(yBox.value);
        var z = parseFloat(zBox.value);
        lightPosition = vec4(x, y, z, 1.0);
        gl.uniform4fv(lightPositionLoc, flatten(lightPosition));
    }

    render();

    g_intervalId = window.setInterval(animate_delay, g_nanosecondsBetweenRender);
};

function zoom_update() {
    if (zooming && mouse_changed) {
        var zoomScale = 1.0 + (mouse_position.y - clicked_position.y);
        var matrix = mult(modelView, scaleMatrix(zoomScale, zoomScale, zoomScale));
        gl.uniformMatrix4fv(uniformLocations.viewMatrixLoc, false, flatten(matrix));
        modelView = matrix;

        clicked_position = mouse_position;
        mouse_changed = false;
    }
}

function rotation_update() {
    if (clicking && mouse_changed) {
        var z1 = Math.sqrt(1 - Math.pow(clicked_position.x, 2) - Math.pow(clicked_position.y, 2));
        var p1, p2;

        if (isNaN(z1)) {
            z1 = 0;
            var normalized = normalize([clicked_position.x, clicked_position.y]);
            p1 = vec3(normalized[0], normalized[1], z1);
        } else {
            p1 = vec3(clicked_position.x, clicked_position.y, z1)
        }

        var z2 = Math.sqrt(1 - Math.pow(mouse_position.x, 2) - Math.pow(mouse_position.y, 2));
        if (isNaN(z2)) {
            z2 = 0;
            var normalized = normalize([mouse_position.x, mouse_position.y]);
            p2 = vec3(normalized[0], normalized[1], z2);
        } else {
            p2 = vec3(mouse_position.x, mouse_position.y, z2)
        }

        var matched = true;
        for (var i = 0; i < p1.length; i++) {
            if (p1[i] != p2[i]) {
                matched = false;
                break;
            }
        }

        if (matched) {
            return;
        }

        var n = normalize(cross(p1, p2));
        var theta = Math.acos(dot(p1, p2));
        var new_q = Quaternion.fromAngleNormal(theta, n);

        if (current_q == null) {
            current_q = new_q;
        } else {
            current_q = new_q.multiplied(current_q);
        }

        gl.uniform4fv(uniformLocations.qLoc, current_q.array());
        gl.uniform4fv(uniformLocations.qInverseLoc, current_q.inverse().array());
        clicked_position = mouse_position;
        mouse_changed = false;
    }
}

function translate_update() {
    if (movingBackward) {
        translationVector[0] += motionSpeed;
        // translationVector[1] += motionSpeed;
    } else if (movingForward) {
        translationVector[0] -= motionSpeed;
        // translationVector[1] -= motionSpeed;
    }

    if (movingLeft) {
        translationVector[1] -= motionSpeed;
        // translationVector[0] += motionSpeed
    } else if (movingRight) {
        translationVector[1] += motionSpeed;
        // translationVector[0] -= motionSpeed;
    }

    if (movingUp) {
        translationVector[2] += motionSpeed;
    } else if (movingDown) {
        translationVector[2] -= motionSpeed;
    }

    gl.uniform3fv(uniformLocations.translationLoc, flatten(translationVector));
}

function animate_delay()
{
    window.requestAnimFrame(function() {
        rotation_update();
        translate_update();
        render();
    });
}

function render() 
{  
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    gl.drawElements( gl.TRIANGLES, indicies.length, gl.UNSIGNED_SHORT, 0);
}