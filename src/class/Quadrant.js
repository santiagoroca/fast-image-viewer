import dxt1 from '../lib/dxt1';

class Quadrant {

	/**
	 * [Create quadrant, buffers, get texture, bla bla bla]
	 * @return {[type]} [description]
	 */
	constructor (handler, webgl, scale, x, y) {
	    this.handler = handler;
	    this.webgl = webgl;
	    this.scale = scale;
	    this.x = x;
	    this.y = y;

        let quadrant_size = (1 / scale),
            min_x = x * quadrant_size,
            min_y = y * quadrant_size;

        //This will define a "sphere" through which we'll
        //Determine if the current quadrant is, or not visible
        //For the current frustum
        //TODO Fix the ratio to point to the corner of the square
        const cx = min_x + quadrant_size / 2;
        const cy = min_y + quadrant_size / 2;
        const m_t_c = [cx - min_x, cy - min_y];
        const length = Math.sqrt(m_t_c[0] * m_t_c[0] + m_t_c[1] * m_t_c[1]);
        this.sphere = {
            x: cx,
            y: cy,
            z: 0,
            r: length
        };

        //Quadrant not intialized and not ready to render
        this.initialized = false;
	}

	build () {
        let quadrant_size = (1 / this.scale),
            min_x = this.x * quadrant_size,
            max_x = this.x * quadrant_size + quadrant_size,
            min_y = this.y * quadrant_size,
            max_y = this.y * quadrant_size + quadrant_size;

        //Bind Data to Buffers and Upload to WebGL
        this.verticesBuffer = this.webgl.createBuffer();
        this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, this.verticesBuffer);
        this.webgl.bufferData(this.webgl.ARRAY_BUFFER, new Float32Array([

            // front
            min_x, min_y, 0,
            max_x, min_y, 0,
            max_x, max_y, 0,
            min_x, max_y, 0

        ]).buffer, this.webgl.STATIC_DRAW);

        this.colorsBuffer = this.webgl.createBuffer();
        this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, this.colorsBuffer);
        this.webgl.bufferData(this.webgl.ARRAY_BUFFER, new Float32Array([

            // front colors
            0.0, 1.0,
            1.0, 1.0,
            1.0, 0.0,
            0.0, 0.0

        ]).buffer, this.webgl.STATIC_DRAW);

        this.facesBuffer = this.webgl.createBuffer();
        this.webgl.bindBuffer(this.webgl.ELEMENT_ARRAY_BUFFER, this.facesBuffer);
        this.webgl.bufferData(this.webgl.ELEMENT_ARRAY_BUFFER, new Uint32Array([

            // front
            0, 1, 2,
            2, 3, 0

        ]).buffer, this.webgl.STATIC_DRAW);

        quadrant_size = this.handler.BASE_SIZE;
        let canvas_x = this.x * quadrant_size,
            canvas_y = this.scale * quadrant_size - this.y * quadrant_size - quadrant_size;

        const {
            defaultMap,
            transparencyMap
        } = this.handler.__getAt(canvas_x, canvas_y);

        this.webgl.activeTexture(this.webgl.TEXTURE0);
        this.mainTexture = this.webgl.createTexture();
        this.webgl.bindTexture(this.webgl.TEXTURE_2D, this.mainTexture);
        this.webgl.compressedTexImage2D(
            this.webgl.TEXTURE_2D,
            0,
            this.webgl.s3tcExt.COMPRESSED_RGBA_S3TC_DXT1_EXT,
            quadrant_size,
            quadrant_size,
            0,
            dxt1.compress(defaultMap)
        );
        this.webgl.texParameteri(this.webgl.TEXTURE_2D, this.webgl.TEXTURE_MAG_FILTER, this.webgl.NEAREST);
        this.webgl.texParameteri(this.webgl.TEXTURE_2D, this.webgl.TEXTURE_MIN_FILTER, this.webgl.NEAREST);
        this.webgl.texParameteri(this.webgl.TEXTURE_2D, this.webgl.TEXTURE_WRAP_S, this.webgl.CLAMP_TO_EDGE);
        this.webgl.texParameteri(this.webgl.TEXTURE_2D, this.webgl.TEXTURE_WRAP_T, this.webgl.CLAMP_TO_EDGE);

        this.transparencyTexture = this.webgl.createTexture();
        this.webgl.activeTexture(this.webgl.TEXTURE1);
        this.webgl.bindTexture(this.webgl.TEXTURE_2D, this.transparencyTexture);
        this.webgl.compressedTexImage2D(
            this.webgl.TEXTURE_2D,
            0,
            this.webgl.s3tcExt.COMPRESSED_RGBA_S3TC_DXT1_EXT,
            this.handler.BASE_SIZE,
            this.handler.BASE_SIZE,
            0,
            dxt1.compress(transparencyMap)
        );
        this.webgl.texParameteri(this.webgl.TEXTURE_2D, this.webgl.TEXTURE_MAG_FILTER, this.webgl.NEAREST);
        this.webgl.texParameteri(this.webgl.TEXTURE_2D, this.webgl.TEXTURE_MIN_FILTER, this.webgl.NEAREST);
        this.webgl.texParameteri(this.webgl.TEXTURE_2D, this.webgl.TEXTURE_WRAP_S, this.webgl.CLAMP_TO_EDGE);
        this.webgl.texParameteri(this.webgl.TEXTURE_2D, this.webgl.TEXTURE_WRAP_T, this.webgl.CLAMP_TO_EDGE);

        //Quadrant already intialized and ready to render
        this.initialized = true;
    }

	/**
	 * [Render single quadrant]
	 * @return {[type]} [description]
	 */
	render (webgl, shader) {
	    if (!this.initialized) {
	        this.build()
        }

        this.webgl.activeTexture(this.webgl.TEXTURE1);
        this.webgl.bindTexture(this.webgl.TEXTURE_2D, this.transparencyTexture);

        this.webgl.activeTexture(this.webgl.TEXTURE0);
        webgl.bindTexture(webgl.TEXTURE_2D, this.mainTexture);

        webgl.bindBuffer(webgl.ARRAY_BUFFER, this.verticesBuffer);
        webgl.vertexAttribPointer(shader.vertexPositionAttribute, 3, webgl.FLOAT, false, 0, 0);

        webgl.bindBuffer(webgl.ARRAY_BUFFER, this.colorsBuffer);
        webgl.vertexAttribPointer(shader.colorVertexAttribute, 2, webgl.FLOAT, false, 0, 0);

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
        webgl.flush();
    }

}

export default Quadrant