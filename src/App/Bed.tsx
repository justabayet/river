import { MeshProps, ReactThreeFiber, extend, useFrame } from '@react-three/fiber'
import bedVertexShader from './shaders/bed/vertex.glsl'
import bedFragmentShader from './shaders/bed/fragment.glsl'
import { shaderMaterial, useTexture } from '@react-three/drei'
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
  heightDryGround: number
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
  heightDryGround: 0.4,
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
    characterPositionY,
    bedWidthFactor,
    bedMinWidthFactor,
    bedGroundColor,
    bedBottomColor,
    heightDryGround
  } = useControls({
    characterPositionY: {
      value: shaderDefault.characterPosition.y,
      min: -100,
      max: 100,
      step: 0.1,
    },
    bedWidthFactor: shaderDefault.bedWidthFactor,
    bedMinWidthFactor: shaderDefault.bedMinWidthFactor,
    bedGroundColor: `#${shaderDefault.bedGroundColor.getHexString()}`,
    bedBottomColor: `#${shaderDefault.bedBottomColor.getHexString()}`,
    heightDryGround: shaderDefault.heightDryGround
  })

  useFrame(({ clock }) => {
    if (bedMaterial.current != null) {
      bedMaterial.current.time = clock.elapsedTime
    }
  })

  return (
    <mesh {...props} rotation={[- Math.PI / 2, 0, 0]}>
      <planeGeometry args={[width, size, 20, 20]} />
      <bedMaterial
        ref={bedMaterial}
        perlinTexture={perlinTexture}
        characterPosition={new Vector2(0, characterPositionY)}
        bedWidthFactor={bedWidthFactor}
        bedMinWidthFactor={bedMinWidthFactor}
        groundSize={width}
        bedGroundColor={bedGroundColor}
        bedBottomColor={bedBottomColor}
        heightDryGround={heightDryGround}
        tileSize={size}
      // wireframe
      />
    </mesh>
  )
}

export default Bed
