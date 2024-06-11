import { MeshProps } from '@react-three/fiber'

interface WallsProps extends MeshProps {
  size?: number
}

function Walls({ size = 5, ...props }: WallsProps): JSX.Element {
  const height = size / 5
  const depth = size / 20
  return (
    <group position={[0, 0.1, 0]}>
      <mesh {...props} rotation={[0, Math.PI / 2, 0]} position={[-size / 2, 0, 0]}>
        <boxGeometry args={[size, height, depth, 1, 1, 1]} />
        <meshStandardMaterial color={'white'} />
      </mesh>

      <mesh {...props} rotation={[0, Math.PI / 2, 0]} position={[size / 2, 0, 0]}>
        <boxGeometry args={[size, height, depth, 1, 1, 1]} />
        <meshStandardMaterial color={'white'} />
      </mesh>

      <mesh {...props} rotation={[0, 0, 0]} position={[0, 0, size / 2]}>
        <boxGeometry args={[size, height, depth, 1, 1, 1]} />
        <meshStandardMaterial color={'white'} />
      </mesh>

      <mesh {...props} rotation={[0, 0, 0]} position={[0, 0, -size / 2]}>
        <boxGeometry args={[size, height, depth, 1, 1, 1]} />
        <meshStandardMaterial color={'white'} />
      </mesh>
    </group>
  )
}

export default Walls
