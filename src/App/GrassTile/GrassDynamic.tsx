import { InstancedMeshProps, useFrame } from '@react-three/fiber'
import { useMemo, useState } from 'react'
import { Quaternion, Euler, CanvasTexture, Vector3, Vector2 } from 'three'
import Grass from './Grass'

interface GrassDynamicProps extends InstancedMeshProps {
  size?: number
  position?: [number, number, number]
  textureInteractionX: CanvasTexture
  textureInteractionY: CanvasTexture
}
let rgba: Uint8ClampedArray

const img = new Image()
img.src = './perlin.png'
img.onload = () => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  canvas.width = img.width
  canvas.height = img.height

  ctx!.drawImage(img, 0, 0)

  rgba = ctx!.getImageData(
    0, 0, img.width, img.height
  ).data
}

function getRiverSide(y: number, x: number, seed: number): number {
  const inputX = (y / 70)
  const edgePerlinX = inputX / 2
  const textureY = seed * 256 * 256
  const textureX = (edgePerlinX % 1) * 256
  const index = Math.floor(textureY + textureX)

  const offsetFactor = (rgba[index * 4] / 255) * 5
  const newPos = (x * offsetFactor)
  return x * 0.5 + newPos
}

const SEED_LEFT = 0.1
const SEED_RIGHT = 0.2

function GrassDynamic({ textureInteractionX, textureInteractionY, size = 5, ...props }: GrassDynamicProps): JSX.Element {
  const boundaries: [number, number, number, number] = useMemo(() => [-size / 2, size / 2, -size / 2, size / 2], [size])
  const count = 10 * 1000

  const instances = useMemo(() => {
    const instances = []
    const width = boundaries[1] - boundaries[0]
    const height = boundaries[3] - boundaries[2]

    for (let i = 0; i < count; i++) {
      const bedSize = 1.25
      const positionRandom = new Vector2(Math.random(), Math.random())
      const uv = positionRandom.clone()
      uv.y = 1 - uv.y


      const offsetWidth = positionRandom.x * width
      const offsetHeight = positionRandom.y * height

      const rotationFactor = (Math.random() - 0.5) * 1.5

      const x = boundaries[0] + offsetWidth
      const y = boundaries[2] + offsetHeight

      const riverLeftX = 0.3 + getRiverSide(y, -bedSize / 2, SEED_LEFT)
      const riverRightX = 2.9 - getRiverSide(y, bedSize / 2, SEED_RIGHT)

      const limit = 2.45
      if (x < riverRightX && x > riverLeftX || x > limit || x < -limit) {
        i--
        continue
      }

      instances.push({
        translation: new Vector3(x, 0, y),
        rotation: new Quaternion().setFromEuler(new Euler(0, Math.PI * rotationFactor / 2, 0)),
        scale: new Vector3(1, 1, 1)
      })
    }
    return instances
  }, [boundaries, count])

  const [distanceTier, setDistanceTier] = useState<number>(3)

  const center = useMemo(() => {
    return props.position ? new Vector3(...props.position) : new Vector3()
  }, [props.position])

  useFrame(({ camera }) => {
    const distance = camera.position.distanceTo(center)
    const index = Math.floor(distance / 20)
    setDistanceTier(Math.max(1, Math.min(3, index)))
  })

  const sharedParams = useMemo(() => {
    return {
      groundSize: size,
      textureInteractionX: textureInteractionX,
      textureInteractionY: textureInteractionY,
      center
    }
  }, [size, textureInteractionX, textureInteractionY, center])

  return (
    <>
      {distanceTier == 3 && <Grass instances={instances} nbVSegments={1} {...sharedParams} {...props} />}
      {distanceTier == 2 && <Grass instances={instances} nbVSegments={2} {...sharedParams} {...props} />}
      {distanceTier == 1 && <Grass instances={instances} nbVSegments={3} {...sharedParams} {...props} />}
    </>
  )
}

export default GrassDynamic
