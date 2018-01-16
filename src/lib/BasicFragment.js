let BasicFragment = [

    "#extension GL_OES_standard_derivatives : enable\n",

    "precision highp float;",

    "uniform sampler2D uSampler;",
    "uniform sampler2D tSampler;",

    "varying vec2 vLightWeighting;",
    "varying vec2 tLightWeighting;",

    "vec3 normals(vec3 pos) {",
    "    vec3 fdx = dFdx(pos);",
    "    vec3 fdy = dFdy(pos);",
    "    return normalize(cross(fdx, fdy));",
    "}",

    "void main() {",
    "    gl_FragColor = vec4(texture2D(uSampler, vLightWeighting).rgb, texture2D(tSampler, tLightWeighting).g);",
    "}"

].join('');

export default BasicFragment