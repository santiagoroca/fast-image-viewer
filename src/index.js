import Viewer from './class/Viewer'
import _Handler from './class/Handler'

let HANDLERS = [];

class FastSvgViewer {

	constructor (container, file) {
	    const extension = file.match(/(?!\.)[^.]+$/i)[0];
	    const handler = HANDLERS[extension];

	    if (!handler) {
	        throw(`No handler associated for file of type ${extension}`);
        }

		//TODO make imports and get extension from file
		const viewer = new Viewer(new handler(file), container);
	}

}

export default FastSvgViewer
export const Handler = _Handler
export const register = (handler) => {
    Object.assign(HANDLERS, handler);
}