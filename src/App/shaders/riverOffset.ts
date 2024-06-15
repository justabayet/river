const bedMinWidthFactor = 0.5
const bedWidthFactor = 2.5

const SEED_LEFT = 0.1
const SEED_RIGHT = 0.2
export const BED_SIZE = 1.25

function getRiverSideOffsetLeft(y: number, x: number, textureData: Uint8ClampedArray): number {
  return getRiverSideOffset(y, x, SEED_LEFT, textureData)
}

function getRiverSideOffsetRight(y: number, x: number, textureData: Uint8ClampedArray): number {
  return getRiverSideOffset(y, x, SEED_RIGHT, textureData)
}

function getRiverSideOffset(y: number, x: number, seed: number, textureData: Uint8ClampedArray): number {
  const inputX = -(y / 70)
  const inputY = x / 70
  const edgePerlin = (inputX + inputY) / 2

  const textureY = (255 - seed * 255) * 256
  const textureX = (edgePerlin % 1) * 255
  const index = Math.floor(textureY + textureX)

  const offsetFactor = (textureData[index * 4] / 255) * bedWidthFactor
  const result = (x * bedMinWidthFactor) + (x * offsetFactor)
  return result
}

export {
  getRiverSideOffsetLeft,
  getRiverSideOffsetRight
}