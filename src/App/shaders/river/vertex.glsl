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
varying float riddleElevation;
varying vec3 vPos;
varying vec2 vUv;
varying vec3 vWorldPos;
varying float dryGroundHeightFactor;

#define LEFT_EDGE_SEED 0.1
#define RIGHT_EDGE_SEED 0.2
#define WAVES_SEED 0.21

float getEdgeOffset(float seed, vec2 worldUv) {
  float edgePerlinX = worldUv.y / 70.0;
  float edgePerlinY = worldUv.x / 70.0;

  float offsetFactor = texture(perlinTexture, vec2((edgePerlinX + edgePerlinY) / 2.0, seed)).r
    * riverWidthFactor;

  return (position.x * riverMinWidthFactor) - position.x + (position.x * offsetFactor);
}

float spikeSin(float sinX) {
  return 1.0 - abs(sin(sinX));
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
  float waveFrequencyNoise = texture(perlinTexture, vec2(worldUv.y, WAVES_SEED)).r;
  float waveFrequency = 0.5;

  float waves = spikeSin((
    waveFrequencyNoise * 5.0 + 
    worldUv.y * 1.0 + 
    time * 6.0 * speed) * waveFrequency) * waveSizeFactor;
  newPos.z += waves;

  float riddleFactor = 1.0 / 30.0;
  float riddleRandom = snoise(vec2(worldUv.x * 2.0, worldUv.y * .5 + time));
  float riddle = riddleRandom * riddleFactor;
  float riddleBoundaries = smoothstep(0.9, 0.5, uv.x) * smoothstep(0.1, 0.5, uv.x);

  float riddleFrequencyNoise = texture(
    perlinTexture,
    vec2((worldUv.y + time * speed) / 20.0, WAVES_SEED)).r;
  riddle += (riddleFrequencyNoise - 0.25) * 0.1;

  riddleElevation = 
    riddle * smoothstep(0.35, 0.5, 1.0 - leftness) * isLeft +
    riddle * smoothstep(0.35, 0.5, 1.0 - rightness) * isRight;

  newPos.z += riddleElevation;

  float edgeElevationFactor = 0.3;

  dryGroundOffset = 
    dryGroundElevation * pow(smoothstep(0.0, 1.0, leftness), 3.0) +
    dryGroundElevation * pow(smoothstep(0.0, 1.0, rightness), 3.0);
  dryGroundHeightFactor = dryGroundOffset / dryGroundElevation;

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