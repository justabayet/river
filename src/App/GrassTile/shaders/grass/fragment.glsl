uniform vec3 uBaseColor;
uniform vec3 uTipColor;
varying vec2 vUv;
varying float vOscillation;
uniform float sunInfluence;
uniform float sunIntensity;
uniform vec3 sunColor;
uniform vec3 reflectionColor;
varying vec3 vPos;

void main()
{
    vec3 color = mix(uBaseColor, uTipColor, vUv.y * vUv.y);

    color = mix(color, sunColor, sunIntensity);

    float mixOscillation = pow((vOscillation + 0.5), 1.5) * sunInfluence; // [0;0.8]
    color = mix(color, reflectionColor, mixOscillation);

    float isOutTop = 1.0 - step(vPos.z, -2.5);
    float isOutBot = step(vPos.z, 2.5);

    float isOut = isOutTop * isOutBot;
    if(isOut == 0.0) {
        discard;
    }

    gl_FragColor = vec4(color, 1.0);
    // gl_FragColor = vec4(vec3(vOscillation + 0.5), 1.0);
    #include <colorspace_fragment>;
}