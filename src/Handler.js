class Handler {

	/**
	 * [Defined by children handler]
	 * @return {[type]} [description]
	 */
	draw () {}

	/**
	 * [Load resource]
	 * @return {[type]} [description]
	 */
	load () {}

	/**
	 * [Clear all references]
	 * @return {[type]} [description]
	 */
	clear () {}

	/**
	 * [Scale the Canvas scale * BASE_WIDTH(512)]
	 * @return {[type]} [description]
	 */
	resize (scale) {
		
	}

	/**
	 * [Return the image data matching the coordinates x, y, 512, 512]
	 * @param  {[type]} x [description]
	 * @param  {[type]} y [description]
	 * @return {[type]}   [description]
	 */
	getAt (x, y) {

	}

}

export default Handler