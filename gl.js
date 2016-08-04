/* exported webGlStart() */
(function () {
	"use strict";

	var gl;
	function initGl(canvas) {
		try {
			gl = canvas.getContext("webgl", 
				{antialias: false });
			gl.viewportWidth = canvas.width + 8;
			gl.viewportHeight = canvas.height + 8;
		} catch (e) {
			alert("Unable to initalize webgl, please update your browser and don't use IE");
		}
	}

	function getShader(gl, id) {
		var shaderScript = document.getElementById(id);
		if (!shaderScript) {
			return null;
		}
		
		var str = "";
		var k = shaderScript.firstChild;
		while (k) {
			if (k.nodeType === 3) {
				str += k.textContent;
			}
			k = k.nextSibiling;
		}
		
		var shader;
		if (shaderScript.type === "x-shader/x-fragment") { 
			shader = gl.createShader(gl.FRAGMENT_SHADER);
		} else if (shaderScript.type === "x-shader/x-vertex") {
			shader = gl.createShader(gl.VERTEX_SHADER);
		} else {
			return null; 
		}
		
		gl.shaderSource(shader, str);
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
		
		shaderProgram.vertextPositionAttribute = gl.getAttribLocation(
			shaderProgram, "aVertexPosition");
		gl.enableVertexAttribArray(shaderProgram.vertexPositonAttribute);
		
		shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram,
			"uPMatrix");
		shaderProgram.mvMatrixUniform = gl.getUnifromLocation(shaderProgram,
			"uvMatrix");
	}

	var mvMatrix = mat4.create();
	var pMatrix = mat4.create();

	function setMatrixUniforms() {
		gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
		gl.unifromMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
	}

	var triangleVertexPositionBuffer;
	var squareVertexPositionBuffer;

	function initBuffers() {
		triangleVertexPositionBuffer = gl.createBuffer();
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
		gl.viewport(-8, -8, gl.viewportWidth, gl.viewportHeight);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
		mat4.identity(mvMatrix);
		mat4.translate(mvMatrix, [-1.5, 0.0, -7.0]);
		gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
		gl.vertexAttrivPointer(shaderProgram.vertextPositoinAttribute,
			triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
		setMatrixUniforms();
		gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);
		
		mat4.translate(mvMatrix, [3.0, 0.0, 0.0]);
		gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
		gl.vertextAttribPointer(shaderProgram.vertexPositionAttribute,
			squareVertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
		setMatrixUniforms();
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);
		
	}

	//called from html (onload of canvas element)
	function webGlStart() {
		var canvas = document.getElementById("gl");
		initGl(canvas);
		initShaders();
		initBuffers();
		
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.enable(gl.DEPTH_TEST);
		
		drawScene();
	}
	webGlStart();
}());