import { MeshProps, ReactThreeFiber, extend, useFrame } from '@react-three/fiber'
import bedVertexShader from './shaders/bed/vertex.glsl'
import bedFragmentShader from './shaders/bed/fragment.glsl'
import { shaderMaterial, useKeyboardControls, useTexture } from '@react-three/drei'
import { ShaderMaterial, Texture, Color, RepeatWrapping, Vector2 } from 'three'
import { useRef } from 'react'
import { useControls } from 'leva'

interface BedMaterial extends ShaderMaterial {
  time: number
  bedGroundColor: Color
  bedBottomColor: Color
  perlinTexture: Texture
  groundSize: number
  characterPosition: Vector2
  bedWidthFactor: number
  bedMinWidthFactor: number
  dryGroundElevation: number
  tileSize: number
}

const defaultBedGroundColor = new Color(0xffcb7e)
const defaultBedBottomColor = new Color(0xff0000)

const shaderDefault = {
  time: 0,
  bedGroundColor: defaultBedGroundColor,
  bedBottomColor: defaultBedBottomColor,
  perlinTexture: null,
  groundSize: 1,
  characterPosition: new Vector2(),
  bedWidthFactor: 5,
  bedMinWidthFactor: 0.5,
  dryGroundElevation: 0.4,
  tileSize: 0
}

const BedMaterial = shaderMaterial(
  shaderDefault,
  bedVertexShader,
  bedFragmentShader
)

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      bedMaterial: ReactThreeFiber.Object3DNode<BedMaterial, typeof BedMaterial>
    }
  }
}

extend({ BedMaterial })

interface BedProps extends MeshProps {
  size?: number
}

function Bed({ size = 5, ...props }: BedProps): JSX.Element {
  const bedMaterial = useRef<BedMaterial>(null)
  const width = size * 0.25

  const perlinTexture = useTexture('./perlin.png', (texture) => {
    texture.wrapS = RepeatWrapping
    texture.wrapT = RepeatWrapping
  })

  const {
    bedWidthFactor,
    bedMinWidthFactor,
    bedGroundColor,
    bedBottomColor,
    dryGroundElevation
  } = useControls({
    bedWidthFactor: shaderDefault.bedWidthFactor,
    bedMinWidthFactor: shaderDefault.bedMinWidthFactor,
    bedGroundColor: `#${shaderDefault.bedGroundColor.getHexString()}`,
    bedBottomColor: `#${shaderDefault.bedBottomColor.getHexString()}`,
    dryGroundElevation: shaderDefault.dryGroundElevation
  })

  const [, getKeys] = useKeyboardControls()

  useFrame(({ clock }, delta) => {
    if (bedMaterial.current != null) {
      bedMaterial.current.time = clock.elapsedTime

      const { forward, backward } = getKeys()

      const distanceDelta = delta * 3.0

      if (forward) {
        bedMaterial.current.characterPosition.y += distanceDelta
      } else if (backward) {
        bedMaterial.current.characterPosition.y -= distanceDelta
      }
    }
  })

  return (
    <mesh {...props} rotation={[- Math.PI / 2, 0, 0]}>
      <planeGeometry args={[width, size, 20, 20]} />
      <bedMaterial
        ref={bedMaterial}
        perlinTexture={perlinTexture}
        bedWidthFactor={bedWidthFactor}
        bedMinWidthFactor={bedMinWidthFactor}
        groundSize={width}
        bedGroundColor={bedGroundColor}
        bedBottomColor={bedBottomColor}
        dryGroundElevation={dryGroundElevation}
        tileSize={size}
      // wireframe
      />
    </mesh>
  )
}

export default Bed
