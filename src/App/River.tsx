import { MeshProps, ReactThreeFiber, extend, useFrame } from '@react-three/fiber'
import riverVertexShader from './shaders/river/vertex.glsl'
import riverFragmentShader from './shaders/river/fragment.glsl'
import { shaderMaterial, useTexture } from '@react-three/drei'
import { ShaderMaterial, Texture, Color, RepeatWrapping, Vector2 } from 'three'
import { useRef } from 'react'
import { useControls } from 'leva'

interface RiverMaterial extends ShaderMaterial {
  time: number
  surfaceColor: Color
  depthColor: Color
  perlinTexture: Texture
  groundSize: number
  characterPosition: Vector2
  riverWidthFactor: number
  riverMinWidthFactor: number
  heightDryGround: number
}

const defaultSurfaceColor = new Color(0, .7, 1.0)
const defaultDepthColor = new Color(0, .3, 1.0)

const shaderDefault = {
  time: 0,
  surfaceColor: defaultSurfaceColor,
  depthColor: defaultDepthColor,
  perlinTexture: null,
  groundSize: 1,
  characterPosition: new Vector2(),
  riverWidthFactor: 5,
  riverMinWidthFactor: 0.5,
  heightDryGround: 0.4
}

const RiverMaterial = shaderMaterial(
  shaderDefault,
  riverVertexShader,
  riverFragmentShader
)

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      riverMaterial: ReactThreeFiber.Object3DNode<RiverMaterial, typeof RiverMaterial>
    }
  }
}

extend({ RiverMaterial })

interface RiverProps extends MeshProps {
  size?: number
}

function River({ size = 5, ...props }: RiverProps): JSX.Element {
  const riverMaterial = useRef<RiverMaterial>(null)
  const width = size / 4

  const perlinTexture = useTexture('./perlin.png', (texture) => {
    texture.wrapS = RepeatWrapping
    texture.wrapT = RepeatWrapping
  })

  const {
    characterPositionY,
    riverWidthFactor,
    riverMinWidthFactor,
    surfaceColor,
    depthColor,
    heightDryGround
  } = useControls({
    characterPositionY: {
      value: shaderDefault.characterPosition.y,
      min: -100,
      max: 100,
      step: 0.1,
    },
    riverWidthFactor: shaderDefault.riverWidthFactor,
    riverMinWidthFactor: shaderDefault.riverMinWidthFactor,
    surfaceColor: `#${shaderDefault.surfaceColor.getHexString()}`,
    depthColor: `#${shaderDefault.depthColor.getHexString()}`,
    heightDryGround: shaderDefault.heightDryGround
  })

  useFrame(({ clock }) => {
    if (riverMaterial.current != null) {
      riverMaterial.current.time = clock.elapsedTime
    }
  })

  return (
    <mesh {...props} rotation={[- Math.PI / 2, 0, 0]}>
      <planeGeometry args={[width, size, 20, 20]} />
      <riverMaterial
        ref={riverMaterial}
        perlinTexture={perlinTexture}
        characterPosition={new Vector2(0, characterPositionY)}
        riverWidthFactor={riverWidthFactor}
        riverMinWidthFactor={riverMinWidthFactor}
        groundSize={width}
        surfaceColor={surfaceColor}
        depthColor={depthColor}
        heightDryGround={heightDryGround}
        transparent
        opacity={0.7}
      // wireframe
      />
    </mesh>
  )
}

export default River
