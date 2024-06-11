#include ../includes/simplex2D.glsl

uniform float time;
uniform sampler2D perlinTexture;
uniform float groundSize;
uniform vec2 characterPosition;
uniform float riverWidthFactor;
uniform float riverMinWidthFactor;
uniform float dryGroundElevation;
uniform float riverHeight;
varying float dryGroundOffset;
varying float edgeElevation;
varying vec3 vPos;
varying vec2 vUv;
varying vec3 vWorldPos;

#define LEFT_EDGE_SEED 0.1
#define RIGHT_EDGE_SEED 0.2
#define WAVES_SEED 0.21

float getEdgeOffset(float seed, vec2 worldUv) {
  float edgePerlinX = worldUv.y / 70.0;

  float offsetFactor = texture(perlinTexture, vec2(edgePerlinX, seed)).r
    * riverWidthFactor;

  return (position.x * riverMinWidthFactor) - position.x + (position.x * offsetFactor);
}

void main()
{
  vec4 newPos = vec4(position, 1.0);
  vec4 worldPos = modelMatrix * newPos;

  vec2 worldUv = worldPos.xz + (characterPosition / 5.0);

  float leftness = 1.0 - clamp(uv.x, 0.0, 0.5) * 2.0;
  float isLeft = step(0.5, 1.0 - uv.x);

  float rightness = (clamp(uv.x, 0.5, 1.0) - 0.5) * 2.0;
  float isRight = step(0.5001, uv.x);

  float route =
    getEdgeOffset(LEFT_EDGE_SEED, worldUv) * leftness +
    getEdgeOffset(RIGHT_EDGE_SEED, worldUv) * rightness;
  newPos.x += route;

  float speed = 1.0;

  float waveSizeFactor = 1.0 / 100.0;
  float waveFrequencyNoise = texture(perlinTexture, vec2(uv.y, WAVES_SEED)).r;
  float waveFrequency = 0.5;

  float waves = sin((
    waveFrequencyNoise * 5.0 + 
    worldUv.y * 1.0 + 
    time * 6.0 * speed) * waveFrequency) * waveSizeFactor;
  newPos.z += waves;

  float riddleFactor = 1.0 / 50.0;
  float perlinCombi = (texture(perlinTexture,vec2(worldUv.x + time / 100.0, worldUv.y + time * speed) / 7.0).x * 2.0);
  float riddleRandom = snoise(vec2(worldUv.x * 2.0, worldUv.y * .5 + time));// * perlinCombi;
  float riddle = riddleRandom * riddleFactor;
  float riddleBoundaries = smoothstep(0.9, 0.5, uv.x) * smoothstep(0.1, 0.5, uv.x);
  float riddleElevation = 
    riddle * step(0.5, 1.0 - leftness) * isLeft +
    riddle * step(0.5, 1.0 - rightness) * isRight;
  newPos.z += riddleElevation;

  float edgeElevationFactor = 0.3;

  dryGroundOffset = 
    dryGroundElevation * pow(smoothstep(0.0, 1.0, leftness), 3.0) +
    dryGroundElevation * pow(smoothstep(0.0, 1.0, rightness), 3.0);

  float edgeElevationOffset = dryGroundOffset * edgeElevationFactor;
  
  newPos.z += edgeElevationOffset;

  edgeElevation = newPos.z + riverHeight;

  vec4 modelPosition = modelMatrix * newPos;
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;
  vUv = uv;
  vPos = newPos.xyz;
  vWorldPos = modelPosition.xyz;
}