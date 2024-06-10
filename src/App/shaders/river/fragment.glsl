uniform vec3 depthColor;
uniform vec3 surfaceColor;
varying vec2 vUv;
varying vec3 uPos;

void main()
{
    vec3 color = mix(depthColor, surfaceColor, (uPos.z + 0.1) * 5.0);
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>;
}