uniform vec3 depthColor;
uniform vec3 surfaceColor;
varying vec2 vUv;
varying vec3 vPos;
varying float dryGroundOffset;
varying float edgeElevation;
varying vec3 vWorldPos;
void main()
{
    float edgeness = 0.5 + dryGroundOffset - edgeElevation;
    float heightFactor = (vPos.z + 0.1) * 5.0;

    vec3 white = vec3(1.0, 1.0, 1.0);
    vec3 ground = vec3(1.0, 0.37, 0.22);

    vec3 water = mix(depthColor, surfaceColor, heightFactor);
    vec3 foam = white;

    float isFoam = smoothstep(0.4, 0.45, edgeness);
    float isGround = smoothstep(0.49, 0.5, edgeness);

    vec3 color = mix(water, foam, isFoam);
    color = mix(color, ground, isGround);

    gl_FragColor = vec4(color, .8);
    // gl_FragColor = vec4(vUv, 1.0, .8);
    // gl_FragColor = vec4(vWorldPos.xz, 1.0, 1.0);
    #include <colorspace_fragment>;
}