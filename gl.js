/// <reference path="typings/index.d.ts" />
/* globals mat4, vec3*/
/* exported webGlStart */
//this code is taken from http://learningwebgl.com/blog/?p=28 
//var webGlStart;
//(function () {
"use strict"
	var gl;
	//initalizes gl object as webgl context
	function initGl(canvas) {
		try {
			gl = canvas.getContext("webgl", {antialias: false }) || 
				 canvas.getContext("experimental-webgl", {antialias: false});
			gl.viewportWidth = canvas.width;
			gl.viewportHeight = canvas.height;
		} catch (e) {
			alert("Unable to initalize webgl, please update your browser and don't use IE");
		}
	}

	function getShader(gl, id) {
		var shaderScript = document.getElementById(id);
		if (!shaderScript) {
			return null;
		}
		
		var shaderSrc = "";
		var k = shaderScript.firstChild;
		while (k) {
			if (k.nodeType == 3) {
				shaderSrc += k.textContent;
			}
			k = k.nextSibiling;
		}
		
		var shader;
		if (shaderScript.type == "x-shader/x-fragment") { 
			shader = gl.createShader(gl.FRAGMENT_SHADER);
		} else if (shaderScript.type == "x-shader/x-vertex") {
			shader = gl.createShader(gl.VERTEX_SHADER);
		} else {
			return null; 
		}
		
		gl.shaderSource(shader, shaderSrc);
		gl.compileShader(shader);
		
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			alert(gl.getShaderInfoLog(shader));
			return null;
		}
		
		return shader;
	}

	var shaderProgram;
	function initShaders() {
		var fragmentShader = getShader(gl, "shader-fs");
		var vertexShader = getShader(gl, "shader-vs");
		
		shaderProgram = gl.createProgram();
		gl.attachShader(shaderProgram, vertexShader);
		gl.attachShader(shaderProgram, fragmentShader);
		gl.linkProgram(shaderProgram);
		
		if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
			alert("Could not initalize shaders");
		}
		
		gl.useProgram(shaderProgram);
		
		shaderProgram.vertexPositionAttribute = gl.getAttribLocation(
			shaderProgram, "aVertexPosition");
		gl.enableVertexAttribArray(shaderProgram.vertexPositonAttribute);
		
		shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram,
			"uPMatrix");
		shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram,
			"uMVMatrix");
	}
	
	//gl-matrix.js mat4
	//http://glmatrix.net/docs/mat4.html
	//a 4x4 matrix
	var mvMatrix = mat4.create();
	var pMatrix = mat4.create();

	function setMatrixUniforms() {
		gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
		gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
		/*
		---From the webgl specification (https://www.khronos.org/registry/webgl/specs/latest/1.0/#5.14.10)---
		void uniform[1234][fi](WebGLUniformLocation? location, ...)
		void uniform[1234][fi]v(WebGLUniformLocation? location, ...)
		void uniformMatrix[234]fv(WebGLUniformLocation? location, GLboolean transpose, ...) (OpenGL ES 2.0 §2.10.4, man page)

		Each of the uniform* functions above sets the specified uniform or uniforms to the values
		provided. If the passed location is not null and was not obtained from the currently
		used program via an earlier call to getUniformLocation, an INVALID_OPERATION error will
		be generated. If the passed location is null, the data passed in will be silently ignored
		and no uniform variables will be changed. 

		If the array passed to any of the vector forms (those ending in v) has an invalid length,
		an INVALID_VALUE error will be generated. The length is invalid if it is too short for or
		is not an integer multiple of the assigned type.
		*/
	}

	var triangleVertexPositionBuffer;
	var squareVertexPositionBuffer;

	function initBuffers() {
		//WebGLBuffer? createBuffer() (OpenGL ES 2.0 §2.9, similar to glGenBuffers)

		//Create a WebGLBuffer object and initialize it with a buffer object name as if by
		//calling glGenBuffers.
		triangleVertexPositionBuffer = gl.createBuffer();
		/*
		void bindBuffer(GLenum target, WebGLBuffer? buffer) (OpenGL ES 2.0 §2.9, man page)
		
		Binds the given WebGLBuffer object to the given binding point (target), either
		ARRAY_BUFFER or ELEMENT_ARRAY_BUFFER. If the buffer is null then any buffer
		currently bound to this target is unbound. A given WebGLBuffer object may only be bound
		to one of the ARRAY_BUFFER or ELEMENT_ARRAY_BUFFER target in its lifetime. An attempt
		to bind a buffer object to the other target will generate an INVALID_OPERATION error,
		and the current binding will remain untouched.
		
		target
		A GLenum specifying the binding point (target). Possible values:
			gl.ARRAY_BUFFER: Buffer containing vertex attributes, such as vertex coordinates,
							 texture coordinate data, or vertex color data.
			gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
			When using a WebGL 2 context, the following values are available additionally:
				gl.COPY_READ_BUFFER: Buffer for copying from one buffer object to another.
				gl.COPY_WRITE_triangleVertexPositionBufferBUFFER: Buffer for copying from one buffer object to another.
				gl.TRANSFORM_FEEDBACK_BUFFER: Buffer for transform feedback operations.
				gl.UNIFORM_BUFFER: Buffer used for storing uniform blocks.
				gl.PIXEL_PACK_BUFFER: Buffer used for pixel transfer operations.
				gl.PIXEL_UNPACK_BUFFER: Buffer used for pixel transfer operations.
		buffer
		A WebGLBuffer to bind.
		*/
		gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
		var vertices = [
			0.0,  1.0,  0.0, 
			-1.0, -1.0,  0.0,
			1.0, -1.0,  0.0 
		];
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
		triangleVertexPositionBuffer.itemSize = 3;
		triangleVertexPositionBuffer.numItems = 3;
		
		squareVertexPositionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
		vertices = [
			1.0,  1.0,  0.0,
			-1.0,  1.0,  0.0,
			1.0, -1.0,  0.0,
			-1.0, -1.0,  0.0
		];
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
		squareVertexPositionBuffer.itemSize = 3;
		squareVertexPositionBuffer.numItems = 4;
	}

	function drawScene() {
		//set viewport size and clear to black
		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		console.log("viewport width: " + gl.viewportWidth + "\nviewport height: " + gl.viewportHeight);
		console.log("buffer height: " + gl.drawingBufferHeight + "\nbuffer width: " + gl.drawingBufferWidth);
		//sets up scene?
		mat4.perspective(pMatrix, 45.0, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 100.0);
		mat4.identity(mvMatrix);

		//draws triangle
		var translation = vec3.create();
		vec3.set(translation, 0.0, 0.0, -2.0);
		mat4.translate(mvMatrix, mvMatrix, translation);
		gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
		//The WebGLRenderingContext.vertexAttribPointer() method of the WebGL API specifies
		//the data formats and locations of vertex attributes in a vertex attributes array.
		//void gl.vertexAttribPointer(index, size, type, normalized, stride, offset);
		gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
			triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
		setMatrixUniforms();
		gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);
		
		//draws square
		mat4.translate(mvMatrix, mvMatrix, [2.0, 0.0, -2.0]);
		gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
			squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
		setMatrixUniforms();
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);
	}

	//start here
	function webGLStart() {
		var canvas = document.getElementById("gl");
		initGl(canvas);
		initShaders();
		initBuffers();
		
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.enable(gl.DEPTH_TEST);
		
		drawScene();
		console.log(gl.getError());
	}
//}());