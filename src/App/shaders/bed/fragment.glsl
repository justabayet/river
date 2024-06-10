uniform vec3 bedGroundColor;
uniform vec3 bedBottomColor;
varying vec2 vUv;
varying vec3 uPos;
varying float heightFactor;

void main()
{
    vec3 color = mix(bedBottomColor, bedGroundColor, heightFactor);
    gl_FragColor = vec4(color, .8);
    #include <colorspace_fragment>;
}