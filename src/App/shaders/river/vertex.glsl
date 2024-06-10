uniform float time;
uniform sampler2D perlinTexture;
uniform float groundSize;
uniform vec2 characterPosition;
uniform float riverWidthFactor;
uniform float riverMinWidthFactor;
uniform float heightDryGround;

varying float heightWaterEdge;
varying float heightGroundEdge;
varying vec3 vPos;
varying vec2 vUv;

#define LEFT_EDGE_SEED 0.1
#define RIGHT_EDGE_SEED 0.2
#define WAVES_SEED 0.21

float getEdgeOffset(float seed) {
  vec2 worldUv = uv + (characterPosition / 5.0);
  float edgePerlinX = worldUv.y / 10.0;

  float offsetFactor = texture(perlinTexture, vec2(edgePerlinX, seed)).r
    * riverWidthFactor;

  return (position.x * riverMinWidthFactor) - position.x + (position.x * offsetFactor);
}

void main()
{
  vec4 newPos = vec4(position, 1.0);

  vec2 worldUv = uv + (characterPosition / 5.0);

  float wavesSizeFactor = 1.0 / 30.0;
  float currentSpeed = 1.0;

  float waveFrequencyNoise = texture(perlinTexture, vec2(uv.y, WAVES_SEED)).r;

  float waves = sin(waveFrequencyNoise * 5.0 + worldUv.y * 20.0 + time * 6.0 * currentSpeed) * wavesSizeFactor;
  newPos.z += waves;

  float riddles = (texture(perlinTexture, vec2(uv.x, uv.y + time * currentSpeed)).x  - 0.25) / 10.0;
  float riddlesBoundaries = smoothstep(0.9, 0.5, uv.x) * smoothstep(0.1, 0.5, uv.x);
  float riddleElevation = riddles * riddlesBoundaries;
  newPos.z += riddleElevation;

  float leftness = 1.0 - clamp(uv.x, 0.0, 0.5) * 2.0;
  float isLeft = step(0.5, 1.0 - uv.x);
  newPos.x += getEdgeOffset(LEFT_EDGE_SEED) * leftness;

  float rightness = (clamp(uv.x, 0.5, 1.0) - 0.5) * 2.0;
  newPos.x += getEdgeOffset(RIGHT_EDGE_SEED) * rightness;

  float heightEdgeFactor = 0.3;

  heightGroundEdge = 
    heightDryGround * pow(smoothstep(0.0, 1.0, leftness), 3.0) +
    heightDryGround * pow(smoothstep(0.0, 1.0, rightness), 3.0);

  float heightEdge = heightGroundEdge * heightEdgeFactor;
  
  heightGroundEdge /= heightDryGround;
  
  newPos.z += heightEdge;

  vec4 modelPosition = modelMatrix * newPos;
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;
  vUv = uv;
  vPos = newPos.xyz;
}