import { MeshProps } from '@react-three/fiber'
import { Color } from 'three'

interface WallsProps extends MeshProps {
  size?: number
}

const color = new Color(0xff8154)

function Walls({ size = 5, ...props }: WallsProps): JSX.Element {
  const depth = size / 20
  const height = size * 0.12
  const posOffset = ((size + depth) / 2) + 0.02

  const width = size * 1.3

  return (
    <group position={[0, 0.28, 0]}>
      <mesh {...props} position={[0, 0, -posOffset]}>
        <boxGeometry args={[width, height, depth, 1, 1, 1]} />
        <meshStandardMaterial color={color} />
      </mesh>

      <mesh {...props} position={[0, 0, posOffset]}>
        <boxGeometry args={[width, height, depth, 1, 1, 1]} />
        <meshStandardMaterial color={color} />
      </mesh>

      <mesh {...props} rotation={[0, Math.PI / 2, 0]} position={[-posOffset, 0, 0]}>
        <boxGeometry args={[width, height, depth, 1, 1, 1]} />
        <meshStandardMaterial color={color} />
      </mesh>

      <mesh {...props} rotation={[0, Math.PI / 2, 0]} position={[posOffset, 0, 0]}>
        <boxGeometry args={[width, height, depth, 1, 1, 1]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  )
}

export default Walls
