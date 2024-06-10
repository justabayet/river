uniform float time;
uniform sampler2D perlinTexture;
uniform float groundSize;
uniform vec2 characterPosition;
uniform float riverWidthFactor;
uniform float riverMinWidthFactor;

varying vec3 uPos;
varying vec2 vUv;

#define LEFT_EDGE_SEED 0.1
#define RIGHT_EDGE_SEED 0.2

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
  float heightOffset = sin(worldUv.y * 20.0 + time)
    / 10.0; // [-0.1, 0.1]
  newPos.z += heightOffset;

  float isLeft = 1.0 - clamp(uv.x, 0.0, 0.5) * 2.0;
  newPos.x += getEdgeOffset(LEFT_EDGE_SEED) * isLeft;

  float isRight = (clamp(uv.x, 0.5, 1.0) - 0.5) * 2.0;
  newPos.x += getEdgeOffset(RIGHT_EDGE_SEED) * isRight;

  vec4 modelPosition = modelMatrix * newPos;
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;
  vUv = uv;
  uPos = newPos.xyz;
}