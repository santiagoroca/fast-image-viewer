class Handler {

	/**
	 * [Load resource]
	 * @return {[type]} [description]
	 */
	constructor (file) {
		this.BASE_SIZE = 512;
		this.SIZE = BASE_SIZE;
		//Create canvas
		//call load
		//call draw
	}

	/**
	 * [Create a new canvas with the desired size]
	 * @return {[type]} [description]
	 */
	__createCanvas () {
		//Create new canvas using the this.SIZE
	}

	/**
	 * [Delete currently active canvas]
	 * @return {[type]} [description]
	 */
	__deleteCanvas () {

	}

	/**
	 * [load description]
	 * @return {Promise} [description]
	 */
	load () {}

	/**
	 * [Defined by children handler]
	 * @return {Promise} [description]
	 */
	draw () {}

	/**
	 * [Clear all references]
	 * @return {[type]} [description]
	 */
	clear () {}

	/**
	 * [Scale the Canvas scale * BASE_WIDTH(512)]
	 * @return {[type]} [description]
	 */
	__resize (scale) {
		this.SIZE = this.BASE_SIZE * scale;
		//Resize canvas
		//call redraw
	}

	/**
	 * [Return the image data matching the coordinates x, y, 512, 512]
	 * @param  {[type]} x [description]
	 * @param  {[type]} y [description]
	 * @return {[type]}   [description]
	 */
	__getAt (x, y) {
		//return an image data from x, y, to 512, 512
	}

}

export default Handler