const handlers = {
	'svg': SVGHandler
}

class SVGViewer {

	constructor (file) {
		//TODO make imports and get extension from file
		const viewer = new Viewer(new handlers[file.extension](file));	
	}

}

export default SVGViewer
export const register = (register) => {
	Object.assign(handlers, register);
}