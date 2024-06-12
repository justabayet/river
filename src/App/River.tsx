import { MeshProps, ReactThreeFiber, extend, useFrame } from '@react-three/fiber'
import riverVertexShader from './shaders/river/vertex.glsl'
import riverFragmentShader from './shaders/river/fragment.glsl'
import { shaderMaterial, useKeyboardControls, useTexture } from '@react-three/drei'
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
  dryGroundElevation: number
  riverHeight: number
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
  dryGroundElevation: 0.4,
  riverHeight: 0.2
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
    riverWidthFactor,
    riverMinWidthFactor,
    surfaceColor,
    depthColor,
    dryGroundElevation
  } = useControls({
    riverWidthFactor: shaderDefault.riverWidthFactor,
    riverMinWidthFactor: shaderDefault.riverMinWidthFactor,
    surfaceColor: `#${shaderDefault.surfaceColor.getHexString()}`,
    depthColor: `#${shaderDefault.depthColor.getHexString()}`,
    dryGroundElevation: shaderDefault.dryGroundElevation
  })


  const [, getKeys] = useKeyboardControls()

  useFrame(({ clock }, delta) => {
    if (riverMaterial.current != null) {
      riverMaterial.current.time = clock.elapsedTime

      const { forward, backward } = getKeys()

      const distanceDelta = delta * 20.0

      if (forward) {
        riverMaterial.current.characterPosition.y += distanceDelta
      } else if (backward) {
        riverMaterial.current.characterPosition.y -= distanceDelta
      }
    }
  })


  return (
    <mesh {...props} rotation={[- Math.PI / 2, 0, 0]}>
      <planeGeometry args={[width, size, 10, 10]} />
      <riverMaterial
        ref={riverMaterial}
        perlinTexture={perlinTexture}
        riverWidthFactor={riverWidthFactor}
        riverMinWidthFactor={riverMinWidthFactor}
        groundSize={width}
        surfaceColor={surfaceColor}
        depthColor={depthColor}
        dryGroundElevation={dryGroundElevation}
        transparent
        opacity={0.7}
      // wireframe
      />
    </mesh>
  )
}

export default River
