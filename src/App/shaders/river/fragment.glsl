uniform vec3 depthColor;
uniform vec3 surfaceColor;
varying vec2 vUv;
varying vec3 vPos;
varying float dryGroundOffset;
varying float edgeElevation;
varying vec3 vWorldPos;
varying float riddleElevation;
uniform vec3 bedGroundColor;
uniform vec3 bedBottomColor;
varying float dryGroundHeightFactor;

void main()
{
    float edgeness = 0.5 + dryGroundOffset - edgeElevation;
    float heightFactor = (vPos.z + 0.1) * 5.0;

    vec3 white = vec3(1.0, 1.0, 1.0);
    vec3 ground = mix(bedBottomColor, bedGroundColor, pow(dryGroundHeightFactor, 2.0));

    vec3 water = mix(depthColor, surfaceColor, heightFactor);
    vec3 foam = mix(water, white, 0.3);

    float isFoam = smoothstep(0.4, 0.45, edgeness);
    float isGround = smoothstep(0.49, 0.5, edgeness);

    float isMiddleFoam = smoothstep(0.45, 0.55, riddleElevation * 30.0);
    isMiddleFoam = clamp(isMiddleFoam - 0.99, 0.0, 1.0);

    vec3 color = mix(water, foam, isFoam);
    color = mix(color, foam, isMiddleFoam);
    color = mix(color, ground, isGround);

    gl_FragColor = vec4(color, .8);
    // gl_FragColor = vec4(vUv, 1.0, .8);
    // gl_FragColor = vec4(vWorldPos.xz, 1.0, 1.0);
    #include <colorspace_fragment>;
}