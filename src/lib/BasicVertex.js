let BasicVertext = [

    "attribute lowp vec3 aVertexPosition;",
    "attribute lowp vec2 aVertexColor;",
    "attribute lowp vec2 tVertexColor;",

    "uniform mat4 uPMVMatrix;",

    "varying vec2 vLightWeighting;",
    "varying vec2 tLightWeighting;",

    "void main(void) {",
    "	gl_Position = uPMVMatrix * vec4(aVertexPosition, 1.0);",
    "	vLightWeighting = aVertexColor;",
    "	tLightWeighting = tVertexColor;",
    "}"

].join('');

export default BasicVertext