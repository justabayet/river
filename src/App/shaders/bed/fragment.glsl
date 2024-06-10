uniform vec3 bedGroundColor;
uniform vec3 bedBottomColor;
varying vec2 vUv;
varying vec3 uPos;
varying float heightFactor;

void main()
{
    vec3 color = mix(bedBottomColor, bedGroundColor, pow(heightFactor, 2.0));
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>;
}