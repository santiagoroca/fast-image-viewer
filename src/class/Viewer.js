import { vec3, mat4 } from '../lib/gl-matrix';
import BasicFragment from '../lib/BasicFragment'
import BasicVertex from '../lib/BasicVertex'
import GridSystem from './GridSystem'

class Viewer {

	/**
	 * [Create webgl canvas, assign handler to global variable]
	 * @param  {[type]} handler   [description]
	 * @param  {[type]} container [description]
	 * @return {[type]}           [description]
	 */
	constructor (handler, container) {
        const width = container.offsetWidth;
        const height = container.offsetHeight;
        const vfov = 45;
        const hfov = (2 * Math.atan (Math.tan(vfov * .5) * width / height));
        const zpos = -Math.max(
            (0.5 / Math.tan(vfov * 0.5)),
            (0.5 / Math.tan(hfov * 0.5))
        );

        this.LOWER_BOUND = -0.06231128944633957;
        this.canvas = this.__createCanvas(container);
        this.webgl = this.__initializeWebGL(this.canvas);
        this.shader = this.__initializeShaders(this.webgl);
        this.gridSystem = new GridSystem(handler, this.webgl, this.LOWER_BOUND, zpos);
        this.projectionMatrix = mat4.create();
        mat4.perspective(this.projectionMatrix, 45, width / height, 0.01, 2.0);

        //Mouse Event Variables Block
        this.isLeftClickPressed = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.target = [-0.5, -0.5, 0];
        this.tpCache = [];
        this.tapAttempt = [];
        this.rect = [0, 0, this.canvas.offsetWidth, this.canvas.offsetHeight];
        this.previousDeltaBetween = 0;
        this.TOUCH_THRESHOLD = document.body.clientWidth / 40;
        this.target = vec3.add(this.target, this.target, vec3.scale([0, 0, 1], [0, 0, 1], zpos));

        // Create wrappers for touch events
        this.ontouchstart = (event) => this.touchStart(event);
        this.ontouchend = (event) => this.touchEnd(event);
        this.ontouchmove = (event) => this.touchMove(event);
        this.onzoom = (event) => this.zoom(event);
        this.onpan = (event) => this.pan(event);

        //Context listener for touch events
        this.canvas.addEventListener('touchstart', this.ontouchstart);
        this.canvas.addEventListener('touchend', this.ontouchend);
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('wheel', this.onMouseWheel.bind(this));

        //Global Listeners
        document.addEventListener('mouseup', this.onMouseUp.bind(this));
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        document.addEventListener('touchmove', this.ontouchmove);
        document.documentElement.addEventListener('gesturestart', function (event) {
            event.preventDefault();
        }, false);

        //Trigger First Render
        this.calculateMatrix();
    }

    /**
     * Creates a new Canvas matching the container dimensions and appends it to it
     * @param {DOMEl} container
     * @private
     */
    __createCanvas (container) {
        const width = container.offsetWidth;
        const height = container.offsetHeight;
        const canvas = document.createElement('canvas');

        //Configure canvas dimensions
        canvas.className = 'fast-svg-viewer';
        canvas.width = width;
        canvas.height = height;
        container.appendChild(canvas);

        return canvas;
    }

	__initializeWebGL (canvas) {
        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;
        const webgl = this.canvas.getContext('webgl');

        //Configure WebGL settings
        webgl.viewport(0, 0, width, height);
        webgl.disable(webgl.DEPTH_TEST);
        webgl.disable(webgl.BLEND);
        webgl.disable(webgl.DITHER);
        webgl.disable(webgl.POLYGON_OFFSET_FILL);
        webgl.disable(webgl.SAMPLE_ALPHA_TO_COVERAGE);
        webgl.disable(webgl.SAMPLE_COVERAGE);
        webgl.enable(webgl.CULL_FACE);
        webgl.getExtension('OES_element_index_uint');
        webgl.getExtension('OES_standard_derivatives');
        webgl.s3tcExt = webgl.getExtension('WEBGL_compressed_texture_s3tc') ||
        webgl.getExtension('MOZ_WEBGL_compressed_texture_s3tc') ||
        webgl.getExtension('WEBKIT_WEBGL_compressed_texture_s3tc');

        return webgl;
    }

    __initializeShaders (webgl) {
        const shaderProgram = webgl.createProgram();
        const fragmentShader = webgl.createShader(webgl.FRAGMENT_SHADER);
        const vertextShader = webgl.createShader(webgl.VERTEX_SHADER);

        webgl.shaderSource(fragmentShader, BasicFragment);
        webgl.compileShader(fragmentShader);

        if (!webgl.getShaderParameter(fragmentShader, webgl.COMPILE_STATUS)) {
            return null;
        }

        //Configure Vertext Shader
        webgl.shaderSource(vertextShader, BasicVertex);
        webgl.compileShader(vertextShader);

        if (!webgl.getShaderParameter(vertextShader, webgl.COMPILE_STATUS)) {
            return null;
        }

        webgl.attachShader(shaderProgram, vertextShader);
        webgl.attachShader(shaderProgram, fragmentShader);
        webgl.linkProgram(shaderProgram);
        webgl.useProgram(shaderProgram);

        //Configure Shader attributes
        shaderProgram.vertexPositionAttribute = webgl.getAttribLocation(shaderProgram, "aVertexPosition");
        shaderProgram.transparentVertexAttribute = webgl.getAttribLocation(shaderProgram, "tVertexColor");
        shaderProgram.colorVertexAttribute = webgl.getAttribLocation(shaderProgram, "aVertexColor");
        shaderProgram.pPMVatrixUniform = webgl.getUniformLocation(shaderProgram, "uPMVMatrix");

        webgl.enableVertexAttribArray(shaderProgram.colorVertexAttribute);
        webgl.enableVertexAttribArray(shaderProgram.transparentVertexAttribute);
        webgl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

        webgl.uniform1i(webgl.getUniformLocation(shaderProgram, "tSampler"), 1);

        return shaderProgram;
    }

	/**
	 * [Calls the Grid System's render]
	 * @return {[type]} [description]
	 */
	render () {

	}

	/**
	 * [mouseDown description]
	 * @return {[type]} [description]
	 */
	onMouseDown () {
        this.isLeftClickPressed = event.button === 0;
        this.lastMouseX = event.x;
        this.lastMouseY = event.y;
	}

	/**
	 * [mouseUp description]
	 * @return {[type]} [description]
	 */
	onMouseUp () {
        this.isLeftClickPressed = false;
	}

	/**
	 * [mouseMove description]
	 * @return {[type]} [description]
	 */
	onMouseMove () {
        if (!this.isLeftClickPressed) {
            return;
        }

        let right = vec3.scale([1, 0, 0], [1, 0, 0], -(this.lastMouseX - event.x) * 0.001);
        let up = vec3.scale([0, 1, 0], [0, 1, 0], (this.lastMouseY - event.y) * 0.001);

        this.target = vec3.add(this.target, this.target, vec3.add([], right, up));

        this.lastMouseX = event.x;
        this.lastMouseY = event.y;

        this.calculateMatrix();
	}

	/**
	 * [mouseWheel description]
	 * @return {[type]} [description]
	 */
	onMouseWheel () {
        let scroll = -event.deltaY * 0.0005;

        if (this.target[2] + scroll > this.LOWER_BOUND) {
            return;
        }

        let back = vec3.scale([0, 0, 1], [0, 0, 1], scroll);
        this.target = vec3.add(this.target, this.target, back);
        this.calculateMatrix();
	}

	/**
	 * [touchStart description]
	 * @return {[type]} [description]
	 */
	touchStart () {
        event.preventDefault();
        event.stopPropagation();

        for (let i = 0; i < event.changedTouches.length; ++i) {
            let touch = event.changedTouches[i];
            touch.timestamp = Date.now();
            this.tapAttempt.push(touch);
        }

        //Sets lastX and lastY to current mouse coordinates
        this.lastMouseX = event.changedTouches[0].clientX;
        this.lastMouseY = event.changedTouches[0].clientY;

        this.tpCache = event.targetTouches;
	}

	/**
	 * [touchEnd description]
	 * @return {[type]} [description]
	 */
	touchEnd () {
        this.canvas.addEventListener('touchstart', this.ontouchstart);
        this.canvas.addEventListener('touchmove', this.ontouchmove);

        this.canvas.removeEventListener('touchmove', this.onpan);
        this.canvas.removeEventListener('touchmove', this.onzoom);
        this.canvas.removeEventListener('touchend', this.touchend);

        this.isMouseDown = false;
        this.previousDeltaBetween = null;
        this.tpCache = [];

        this.lastTapEnd = new Date().getTime();
	}

    /**
     *
     * @param event
     */
    pan (event) {
        event.preventDefault();
        event.stopPropagation();

        let deltax = event.targetTouches[0].clientX - this.tpCache[0].clientX,
            deltay = event.targetTouches[0].clientY - this.tpCache[0].clientY;

        if (deltax >= this.TOUCH_THRESHOLD || deltax <= -this.TOUCH_THRESHOLD ||
            deltay >= this.TOUCH_THRESHOLD || deltay <= -this.TOUCH_THRESHOLD) {

            //Current mouse coordinates
            let x = event.changedTouches[0].clientX;
            let y = event.changedTouches[0].clientY;

            // X translation and Y translation setted to the difference between the last mouse
            // position and the current
            let right = vec3.scale([1, 0, 0], [1, 0, 0], -(this.lastMouseX - x) * 0.001);
            let up = vec3.scale([0, 1, 0], [0, 1, 0], (this.lastMouseY - y) * 0.001);

            this.target = vec3.add(this.target, this.target, vec3.add([], right, up));

            // Sets new Matrix Position to the Group
            requestAnimationFrame(this.calculateMatrix.bind(this));

            //Sets lastX and lastY to current mouse coordinates
            this.lastMouseX = event.changedTouches[0].clientX;
            this.lastMouseY = event.changedTouches[0].clientY;
        }

    }

    /**
     * Apply zoom in or zoom out to image
     * @param event
     */
    zoom (event) {
        event.preventDefault();
        event.stopPropagation();

        let delta_between =
            ((Math.abs(event.targetTouches[0].clientX - event.targetTouches[1].clientX) << 1) +
            (Math.abs(event.targetTouches[0].clientY - event.targetTouches[1].clientY) << 1)) >> 1;

        if (!this.previousDeltaBetween) {
            this.previousDeltaBetween = delta_between;
        }

        //Retrieves amount scrolled
        let scroll = -(delta_between - this.previousDeltaBetween) * 5,
            back = vec3.scale([0, 0, 1], [0, 0, 1], -scroll * 0.00005);

        if (this.target[2] - (scroll * 0.00005) > this.LOWER_BOUND) {
            return;
        }

        this.target = vec3.add(this.target, this.target, back);
        this.calculateMatrix();
    }

	/**
	 * [calculateMatrix description]
	 * @return {[type]} [description]
	 */
	calculateMatrix () {
        let mvMatrix = mat4.identity(mat4.create());
        let pMVPMatrixUniform = [];

        mvMatrix = mat4.translate(mvMatrix, mvMatrix, this.target);
        mat4.multiply (pMVPMatrixUniform, this.projectionMatrix, mvMatrix);
        this.webgl.uniformMatrix4fv(this.shader.pPMVatrixUniform, false, pMVPMatrixUniform);

        /*
            Create the 4 lateral planes
        */
        const planes = [

            // // Right clipping plane.
            // {
            //     x: pMVPMatrixUniform[8] - pMVPMatrixUniform[0],
            //     y: pMVPMatrixUniform[9] - pMVPMatrixUniform[1],
            //     z: pMVPMatrixUniform[10] - pMVPMatrixUniform[2],
            //     w: pMVPMatrixUniform[11] - pMVPMatrixUniform[3]
            // },
            //
            // // Left clipping plane.
            // {
            //     x: pMVPMatrixUniform[8] + pMVPMatrixUniform[0],
            //     y: pMVPMatrixUniform[9] + pMVPMatrixUniform[1],
            //     z: pMVPMatrixUniform[10] + pMVPMatrixUniform[2],
            //     w: pMVPMatrixUniform[11] + pMVPMatrixUniform[3]
            // },
            //
            // // Bottom clipping plane.
            // {
            //     x: pMVPMatrixUniform[8] + pMVPMatrixUniform[4],
            //     y: pMVPMatrixUniform[9] + pMVPMatrixUniform[5],
            //     z: pMVPMatrixUniform[10] + pMVPMatrixUniform[6],
            //     w: pMVPMatrixUniform[11] + pMVPMatrixUniform[7]
            // },
            //
            // // Top clipping plane.
            // {
            //     x: pMVPMatrixUniform[8] - pMVPMatrixUniform[4],
            //     y: pMVPMatrixUniform[9] - pMVPMatrixUniform[5],
            //     z: pMVPMatrixUniform[10] - pMVPMatrixUniform[6],
            //     w: pMVPMatrixUniform[11] - pMVPMatrixUniform[7]
            // }

            // Right clipping plane.
            {
                x: pMVPMatrixUniform[3] - pMVPMatrixUniform[0],
                y: pMVPMatrixUniform[7] - pMVPMatrixUniform[4],
                z: pMVPMatrixUniform[11] - pMVPMatrixUniform[8],
                w: pMVPMatrixUniform[15] - pMVPMatrixUniform[12]
            },

            // Left clipping plane.
            {
                x: pMVPMatrixUniform[3] + pMVPMatrixUniform[0],
                y: pMVPMatrixUniform[7] + pMVPMatrixUniform[4],
                z: pMVPMatrixUniform[11] + pMVPMatrixUniform[8],
                w: pMVPMatrixUniform[15] + pMVPMatrixUniform[12]
            },

            // Bottom clipping plane.
            {
                x: pMVPMatrixUniform[3] + pMVPMatrixUniform[1],
                y: pMVPMatrixUniform[7] + pMVPMatrixUniform[5],
                z: pMVPMatrixUniform[11] + pMVPMatrixUniform[9],
                w: pMVPMatrixUniform[15] + pMVPMatrixUniform[13]
            },

            // Top clipping plane.
            {
                x: pMVPMatrixUniform[3] - pMVPMatrixUniform[1],
                y: pMVPMatrixUniform[7] - pMVPMatrixUniform[5],
                z: pMVPMatrixUniform[11] - pMVPMatrixUniform[9],
                w: pMVPMatrixUniform[15] - pMVPMatrixUniform[13]
            }

        ];


        requestAnimationFrame(() => {
            this.gridSystem.render(
                this.projectionMatrix,
                this.rect,
                this.webgl,
                this.shader,
                mvMatrix,
                planes
            )
        });
	}

}

export default Viewer
