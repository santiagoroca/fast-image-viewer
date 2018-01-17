let BasicVertext = [

    "attribute highp vec3 aVertexPosition;",
    "attribute highp vec2 aVertexColor;",

    "uniform highp mat4 uPMVMatrix;",

    "varying vec2 vLightWeighting;",

    "void main(void) {",
    "	gl_Position = uPMVMatrix * vec4(aVertexPosition, 1.0);",
    "	vLightWeighting = aVertexColor;",
    "}"

].join('');

export default BasicVertext