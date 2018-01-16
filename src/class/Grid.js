import Quadrant from './Quadrant'
import dxt1 from '../lib/dxt1'
import _Math from '../class/Math'

class Grid {

	/**
	 * [Create empty Quadrant's array]
	 * @return {[type]} [description]
	 */
	constructor (handler, webgl, scale) {
        this.scale = scale;
        this.grid = [];
	}

    //For now will create again the transparency texture and
    //Create all the Quadrants
	activate (webgl, handler) {
	    return new Promise((resolve, reject) => {
            this.transparencyTexture = webgl.createTexture();

            webgl.activeTexture(webgl.TEXTURE1);
            webgl.bindTexture(webgl.TEXTURE_2D, this.transparencyTexture);
            webgl.compressedTexImage2D(
                webgl.TEXTURE_2D,
                0,
                webgl.s3tcExt.COMPRESSED_RGBA_S3TC_DXT1_EXT,
                512 * this.scale,
                512 * this.scale,
                0,
                dxt1.compress(handler.__getTransparencyMap())
            );
            webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MAG_FILTER, webgl.NEAREST);
            webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MIN_FILTER, webgl.LINEAR);
            webgl.activeTexture(webgl.TEXTURE0);

            console.time('asd');
            //Could be done with i / this.scale and i % this.scale but would be less clear
            for (let i = 0; i < this.scale; i++) {
                for (let j = 0; j < this.scale; j++) {
                    this.grid[(i *  this.scale) + j] = new Quadrant(handler, webgl, this.scale, j, i);
                }
            }
            console.timeEnd('asd');
        });
    }

    //For now it will clear all the Quadrants
    deactivate (webgl) {
        for (let quadrant in this.grid) {
            this.grid[quadrant].clear(webgl);
            this.grid[quadrant] = null;
        }

        webgl.deleteTexture(this.transparencyTexture);
        webgl.flush();
    }

	/**
	 * [Render currently active Quadrants, check if position match a quadrant, create it otherwise]
	 * @return {[type]} [description]
	 */
	render (webgl, shader, planes) {
        webgl.clearColor(0.0, 0.0, 0.0, 0.0);

        for (let quadrant in this.grid) {
            if (_Math.testSphereThruPlanes(this.grid[quadrant].sphere, planes)) {
                this.grid[quadrant].render(webgl, shader)
            }
        }
	}

}

export default Grid