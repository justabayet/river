uniform float time;
uniform sampler2D perlinTexture;
uniform float groundSize;
uniform float tileSize;
uniform vec2 characterPosition;
uniform float bedWidthFactor;
uniform float bedMinWidthFactor;
uniform float heightDryGround;

varying float heightFactor;
varying vec3 uPos;
varying vec2 vUv;

#define LEFT_EDGE_SEED 0.1
#define RIGHT_EDGE_SEED 0.2

float getEdgeOffset(float seed) {
  vec2 worldUv = uv + (characterPosition / 5.0);
  float edgePerlinX = worldUv.y / 10.0;

  float offsetFactor = texture(perlinTexture, vec2(edgePerlinX, seed)).r
    * bedWidthFactor;

  return (position.x * bedMinWidthFactor) - position.x + (position.x * offsetFactor);
}

void main()
{
  vec4 newPos = vec4(position, 1.0);

  vec2 worldUv = uv + (characterPosition / 5.0);
  float heightOffset = sin(worldUv.y * 20.0 + time * 2.0)
    / 10.0; // [-0.1, 0.1]
  // newPos.z += heightOffset;

  float leftness = 1.0 - clamp(uv.x, 0.0, 0.5) * 2.0;
  float isLeft = step(0.5, 1.0 - uv.x);
  newPos.x += getEdgeOffset(LEFT_EDGE_SEED) * leftness;
  // newPos.x -= 0.5 * leftness;

  float rightness = (clamp(uv.x, 0.5, 1.0) - 0.5) * 2.0;
  float isRight = step(0.5, uv.x);
  newPos.x += getEdgeOffset(RIGHT_EDGE_SEED) * rightness;

  float heightGroundOffset = 
    heightDryGround * pow(smoothstep(0.0, 1.0, leftness), 3.0) +
    heightDryGround * pow(smoothstep(0.0, 1.0, rightness), 3.0);

  newPos.z += heightGroundOffset;

  float isFirst = 1.0 - step(0.01, uv.x);
  newPos.x += (- newPos.x - tileSize / 2.0) * isLeft * isFirst;

  float isLast = step(0.99, uv.x);
  newPos.x += (- newPos.x + tileSize / 2.0) * isRight * isLast;

  heightFactor = heightGroundOffset / heightDryGround;

  vec4 modelPosition = modelMatrix * newPos;
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;
  vUv = uv;
  uPos = newPos.xyz;
}