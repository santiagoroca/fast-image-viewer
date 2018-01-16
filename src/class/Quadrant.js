import dxt1 from '../lib/dxt1';

class Quadrant {

	/**
	 * [Create quadrant, buffers, get texture, bla bla bla]
	 * @return {[type]} [description]
	 */
	constructor (handler, webgl, scale, x, y) {

        let quadrant_size = (1 / scale),
            min_x = x * quadrant_size,
            max_x = x * quadrant_size + quadrant_size,
            min_y = y * quadrant_size,
            max_y = y * quadrant_size + quadrant_size;

        //Bind Data to Buffers and Upload to WebGL
        this.verticesBuffer = webgl.createBuffer();
        webgl.bindBuffer(webgl.ARRAY_BUFFER, this.verticesBuffer);
        webgl.bufferData(webgl.ARRAY_BUFFER, new Float32Array([

            // front
            min_x, min_y, 0,
            max_x, min_y, 0,
            max_x, max_y, 0,
            min_x, max_y, 0

        ]).buffer, webgl.STATIC_DRAW);

        quadrant_size = (1 / scale),
            min_x = x * quadrant_size,
            max_x = x * quadrant_size + quadrant_size,
            min_y = 1 - y * quadrant_size - quadrant_size,
            max_y = min_y + quadrant_size;

        this.transparentBuffer = webgl.createBuffer();
        webgl.bindBuffer(webgl.ARRAY_BUFFER, this.transparentBuffer);
        webgl.bufferData(webgl.ARRAY_BUFFER, new Float32Array([

            // front colors
            min_x, max_y,
            max_x, max_y,
            max_x, min_y,
            min_x, min_y

        ]).buffer, webgl.STATIC_DRAW);

        this.colorsBuffer = webgl.createBuffer();
        webgl.bindBuffer(webgl.ARRAY_BUFFER, this.colorsBuffer);
        webgl.bufferData(webgl.ARRAY_BUFFER, new Float32Array([

            // front colors
            0.0, 1.0,
            1.0, 1.0,
            1.0, 0.0,
            0.0, 0.0

        ]).buffer, webgl.STATIC_DRAW);

        this.facesBuffer = webgl.createBuffer();
        webgl.bindBuffer(webgl.ELEMENT_ARRAY_BUFFER, this.facesBuffer);
        webgl.bufferData(webgl.ELEMENT_ARRAY_BUFFER, new Uint32Array([

            // front
            0, 1, 2,
            2, 3, 0

        ]).buffer, webgl.STATIC_DRAW);

        quadrant_size = 512;
        let canvas_x = x * quadrant_size,
            canvas_y = scale * quadrant_size - y * quadrant_size - quadrant_size;

        webgl.activeTexture(webgl.TEXTURE0);
        this.mainTexture = webgl.createTexture();
        webgl.bindTexture(webgl.TEXTURE_2D, this.mainTexture);
        webgl.compressedTexImage2D(
            webgl.TEXTURE_2D,
            0,
            webgl.s3tcExt.COMPRESSED_RGBA_S3TC_DXT1_EXT,
            quadrant_size,
            quadrant_size,
            0,
            dxt1.compress(handler.__getAt(canvas_x, canvas_y))
        );
        webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MAG_FILTER, webgl.NEAREST);
        webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MIN_FILTER, webgl.LINEAR);
	}

	/**
	 * [Render single quadrant]
	 * @return {[type]} [description]
	 */
	render (webgl, shader) {
        webgl.bindTexture(webgl.TEXTURE_2D, this.mainTexture);

        webgl.bindBuffer(webgl.ARRAY_BUFFER, this.verticesBuffer);
        webgl.vertexAttribPointer(shader.vertexPositionAttribute, 3, webgl.FLOAT, false, 0, 0);

        webgl.bindBuffer(webgl.ARRAY_BUFFER, this.colorsBuffer);
        webgl.vertexAttribPointer(shader.colorVertexAttribute, 2, webgl.FLOAT, false, 0, 0);

        webgl.bindBuffer(webgl.ARRAY_BUFFER, this.transparentBuffer);
        webgl.vertexAttribPointer(shader.transparentVertexAttribute, 2, webgl.FLOAT, false, 0, 0);

        webgl.bindBuffer(webgl.ELEMENT_ARRAY_BUFFER, this.facesBuffer);
        webgl.drawElements(webgl.TRIANGLES, 6, webgl.UNSIGNED_INT, 0);
	}

    /**
     * [Clears the quadrant]
     * @return {[type]} [description]
     */
    clear (webgl) {
        webgl.deleteBuffer(this.verticesBuffer);
        webgl.deleteBuffer(this.colorsBuffer);
        webgl.deleteBuffer(this.facesBuffer);
        webgl.deleteBuffer(this.transparentBuffer);
        webgl.deleteTexture(this.mainTexture);
    }

}

export default Quadrant