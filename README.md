
# Fast Image Viewer

Fast Image Viewer (FIV) allows you to Render Really big big, huge, files into a canvas and manipulate those images as if they were a Visualization tool in browser, all of this, simply embeded into any DOM Element.

FIV was mainly created to render Huge SVG files, and navigate them in a browser, at 60fps, always keeping a low (RAM/VRAM) memory footprint.

Under the hood, fast image viewer, uses WebGL. It creates a Grid of the original image and renders it into several Quads. FIV will smartly identify the size of the current device and start with a texture matching the highest dimension between the width and the height (or the closest power of two dimension). As you get closer to the Image, FIV will start subdividing the Grid into smaller pieces, while doubling the size of each Quadrant into the GRID to keep a low memory footprint, but a high resolution.

# How to Install

    npm install fast-image-viewer

# How to Implement

FIV provides you with the base Handler which runs the Image (PNG, PDF, SVG, etc) lifecycle. The Handler will first create a Canvas as a container used to Generate each of the GRIDS, and then call the **load** function which will, as defined for the implementer, load the resources into the class. Once the file has been loaded (Sync), the draw function will be called. The draw function is in charge of drawing to the Canvas the desired resources. After draw function exit, the Canvas should contain the final image that will then, be displayed into the viewer.

    class SVGHandler extends FastSvgViewer.Handler {

                /**
                 * [load description]
                 * @return {Promise} [description]
                 */
                load (BASE_URL) {
                    let request = new XMLHttpRequest();
                    let $this = this;

                    request.open('GET', BASE_URL, false);
                    request.send(null);

                    const documentFragment = document.createDocumentFragment();
                    const div = document.createElement('div');
                    documentFragment.appendChild(div);
                    div.innerHTML = request.responseText;
                    $this.viewBox = div
                        .getElementsByTagName('svg')[0]
                        .getAttribute('viewBox')
                        .split(' ')
                        .map(Number);

                    const paths = div.getElementsByTagName('path');
                    $this.data = [];
                    for (let i = 0; i < paths.length; i++) {
                        $this.data[i] = {
                            path: new Path2D(paths[i].getAttribute('d')),
                            fill: paths[i].getAttribute('fill')
                        }
                    }
                }

                /**
                 * [Draw imageData]
                 * @return {Promise}
                 */
                draw () {
	                this.context.lineWidth = 20;
	                this.context.strokeStyle = "#444";

	                for (let i = 0; i < this.data.length; i++) {
	                    this.context.fillStyle = this.data[i].fill;
	                    this.context.fill(this.data[i].path);
	                }
                }

                /**
                 * [Clear all references]
                 * @return {[type]} [description]
                 */
                clear () {
	                super.clear();
	                this.data = null;
                }

            }

            FastSvgViewer.register({
                'svg': SVGHandler
            });

            const div = document.getElementById('viewer-container');
            const instance = new FastSvgViewer.default(div, 'assets/icon-github.svg');


# Base Handler

    class Handler {

	    /**
	     * Receives a URL
	     * Creates the main canvas
	     * Calls the load function defined by the implementer
	     * Calls the draw function defined by the implementer
	     * If you extend the constructor remember to call super
	     */
	    constructor (url) {}

		// YOU SHOULD NOT USE THIS FUNCTION
	    /**
	     * Creates a canvas with the active Size
	     * Size should not be modified directly by the implementer
	     */
	    __createCanvas () {}

		// YOU SHOULD NOT USE THIS FUNCTION
	    /**
	     * Deletes the current instance of the canvas
	     */
	    __deleteCanvas () {}

		// YOU SHOULD NOT USE THIS FUNCTION
	    /**
	     * Resize the current canvas to the desired size
	     * @param  {[int]} scale [size]
	     */
	    __resize (scale) {}

		// YOU SHOULD NOT USE THIS FUNCTION
	    /**
	     * Get a square from the canvas matching the provided coordinates
	     * @param  {Number} x [coordinate x of canvas slice to redraw]
	     * @param  {Number} y [coordinate y of canvas slice to redraw]
	     * @return {ImageData}  [New ImageData from canvas slice]
	     */
	    __getAt (x, y) {}

		// YOU SHOULD NOT USE THIS FUNCTION
	    /**
	     * Returns the transparency map of the current canvas
	     * @return {ImageData} [New ImageData from canvas slice]
	     * @private
	     */
	    __getTransparencyMap () {}

	    /**
	     * This function should be extended by the implementer
	     * Beeing in charge of loading all the necesary resources
	     * To display the image in the viewer
	     */
	    load (BASE_URL) {}

	    /**
	     * This method should be extended by the implementer
	     * Beeing in charge of defining a way of drawing the
	     * Resources into the Canvas
	     */
	    draw () {}

	    /**
	     * This Function should be extended by the implementer
	     * Beeing in charge of calling the super.clear() method
	     * and clearing all of the resources loaded in the load()
	     * function or any other defined function
	     */
	    clear () {}

    }
