uniform vec3 depthColor;
uniform vec3 surfaceColor;
varying vec2 vUv;
varying vec3 vPos;
varying float heightGroundEdge;
varying float heightWaterEdge;

void main()
{
    float heightFactor = (vPos.z + 0.1) * 5.0;

    vec3 white = vec3(1.0, 1.0, 1.0);

    vec3 water = mix(depthColor, surfaceColor, heightFactor);
    vec3 foam = white;

    vec3 color = mix(water, foam, smoothstep(0.55, 0.6, heightGroundEdge));

    gl_FragColor = vec4(color, .8);
    // gl_FragColor = vec4(vec3(riddleElevation * 10.0 + 0.25) * 2.0, 1.0);
    #include <colorspace_fragment>;
}