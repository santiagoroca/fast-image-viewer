import Grid from './Grid'
import MathHelper from './Math'

class GridSystem {

	/**
	 * [Create array of Grids]
	 * @return {[type]} [description]
	 */
	constructor (handler, webgl, min, max, division_ratio = 5) {
	    this.division_ratio = division_ratio;
	    this.handler = handler;
	    this.min = min;
	    this.max = max;
	    this.gridSystem = [];

	    for (let i = 0; i < division_ratio; i++) {
            this.gridSystem.push(new Grid(handler, webgl, Math.pow(2, i)))
        }

        this.activeIndex = 0;
        this.activeGrid = this.gridSystem[this.activeIndex];
        this.handler.__resize(this.activeGrid.scale);
        this.activeGrid.activate(webgl, handler);
    }

	/**
	 * [Choose which Grid to render, if it has changed, clean all other Grids and ask handler to resize to correct size]
	 * @return {[type]} [description]
	 */
	render (projMatrix, rect, webgl, shader, mvMatrix, planes) {
	    const raycastHitPosition = MathHelper.getRaycastHitCoordinates(
            projMatrix,
            mvMatrix,
            rect
        );

	    if (raycastHitPosition) {
	        let index = raycastHitPosition * (this.division_ratio - 1) / (this.max-this.min);
	            index *= -1;
	            index = Math.min(Math.max(0, index), this.division_ratio - 1);
	            index = this.division_ratio - 1 - parseInt(index);

            if (this.activeIndex != index) {
                this.activeGrid.deactivate(webgl);
                this.activeIndex = index;
                this.activeGrid = this.gridSystem[this.activeIndex];
                this.handler.__resize(this.activeGrid.scale);
                this.activeGrid.activate(webgl, this.handler);
            }
        }

        this.activeGrid.render(webgl, shader, planes);
	}

}

export default GridSystem