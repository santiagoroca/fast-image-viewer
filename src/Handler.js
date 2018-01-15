class Handler {

    /**
     * [Load resource]
     * @return {[type]} [description]
     */
    constructor (url) {
        this.BASE_SIZE = 512;
        this.SIZE = BASE_SIZE;
        BASE_URL =  url

        this.__createCanvas();

        this.load(BASE_URL)
            .then(this.draw);
    }

    /**
     * [Create a new canvas with the desired size]
     * @return {[type]} [description]
     */
    __createCanvas () {
        this.canvas = document.createElement('canvas');

        //Set Canvas Size
        this.canvas.width = this.SIZE;
        this.canvas.height = this.SIZE;

        //Create 2D context 
        this.ctx = this.canvas.getContext('2d');
    }

    /**
     * [Delete currently active canvas]
     * @return {[type]} [description]
     */
    __deleteCanvas () {
        this.canvas = null;
        this.ctx = null;
    }

    /**
     * [generate new draw when the scale changed]
     * @param  {[int]} scale [size]
     * @return {[type]}  [description]
     */
    __resize (scale) {
        this.SIZE = this.BASE_SIZE * scale;

        this.__deleteCanvas();

        this.__createCanvas();

        this.draw();
    }

    /**
     * [Return the image data matching the coordinates x, y, 512, 512]
     * @param  {[int]} x [coordinate x of canvas slice to redraw]
     * @param  {[int]} y [coordinate y of canvas slice to redraw]
     * @return {[ImageData]}  [New ImageData from canvas slice]
     */
    __getAt (x, y) {
        return this.ctx.getImageData(x, y, this.BASE_SIZE, this.BASE_SIZE);
    }

    /**
     * [load description]
     * @return {Promise} [description]
     */
    load (BASE_URL) {
        new Promise()._resolve();
    }

    /**
     * [Draw imageData]
     * @return {void}
     */
    draw () {}

    /**
     * [Clear all references]
     * @return {[type]} [description]
     */
    clear () {
    }

}

export default Handler