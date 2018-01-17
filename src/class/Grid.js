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
        this.enabled = false;
	}

    //For now will create again the transparency texture and
    //Create all the Quadrants
	activate (webgl, handler) {
	    return new Promise((resolve, reject) => {

            if (!this.enabled) {
                //Could be done with i / this.scale and i % this.scale but would be less clear
                for (let i = 0; i < this.scale; i++) {
                    for (let j = 0; j < this.scale; j++) {
                        this.grid[(i *  this.scale) + j] = new Quadrant(handler, webgl, this.scale, j, i);
                    }
                }

                this.enabled = true;
            }

        });
    }

    //For now it will clear all the Quadrants
    deactivate (webgl) {
        for (let quadrant in this.grid) {
            this.grid[quadrant].clear(webgl);
            this.grid[quadrant] = null;
        }

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