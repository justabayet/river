import { InstancedMeshProps, useFrame } from '@react-three/fiber'
import { useMemo, useState } from 'react'
import { Quaternion, Euler, CanvasTexture, Vector3, Vector2, RepeatWrapping } from 'three'
import Grass from './Grass'
import { useTexture } from '@react-three/drei'
import { getTextureData } from './utils/textureData'
import { BED_SIZE, getRiverSideOffsetLeft, getRiverSideOffsetRight } from '../shaders/riverOffset'

interface GrassDynamicProps extends InstancedMeshProps {
  size?: number
  y?: number
  position?: [number, number, number]
  textureInteractionX: CanvasTexture
  textureInteractionY: CanvasTexture
}

function GrassDynamic({ y = 0, textureInteractionX, textureInteractionY, size = 5, ...props }: GrassDynamicProps): JSX.Element {
  const boundaries: [number, number, number, number] = useMemo(() => [-size / 2, size / 2, -size / 2, size / 2], [size])
  const count = 10 * 1000
  console.log(y)

  const perlinTexture = useTexture('./perlin.png', (texture) => {
    texture.wrapS = RepeatWrapping
    texture.wrapT = RepeatWrapping
    texture.colorSpace = ''
  })

  const instances = useMemo(() => {
    const textureData = getTextureData(perlinTexture)
    const instances = []
    const width = boundaries[1] - boundaries[0]
    const height = boundaries[3] - boundaries[2]

    for (let i = 0; i < count; i++) {
      const positionRandom = new Vector2(Math.random(), Math.random())

      const offsetWidth = positionRandom.x * width
      const offsetHeight = positionRandom.y * height

      const newX = boundaries[0] + offsetWidth
      const newY = boundaries[2] + offsetHeight

      const noGrassWidth = BED_SIZE - 0.1

      const riverOffsetY = - (y + newY)

      const riverLeftX = getRiverSideOffsetLeft(riverOffsetY, (-noGrassWidth / 2), textureData)
      const riverRightX = getRiverSideOffsetRight(riverOffsetY, (noGrassWidth / 2), textureData)

      const limit = 2.5
      if (newX < riverRightX && newX > riverLeftX ||
        newX > limit || newX < -limit ||
        newY > limit || newY < -limit) {
        continue
      }

      const rotationFactor = (Math.random() - 0.5) * 1.5
      instances.push({
        translation: new Vector3(newX, 0, newY),
        rotation: new Quaternion().setFromEuler(new Euler(0, Math.PI * rotationFactor / 2, 0)),
        scale: new Vector3(1, 1, 1)
      })
    }
    return instances
  }, [boundaries, count, perlinTexture, y])

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
