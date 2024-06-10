import { MeshProps } from '@react-three/fiber'

interface GroundProps extends MeshProps {
  size?: number
}

function Ground({ size = 5, ...props }: GroundProps): JSX.Element {
  const height = size / 20
  return (
    <mesh {...props} rotation={[- Math.PI / 2, 0, 0]} position={[0, -height / 2, 0]}>
      <boxGeometry args={[size, size, height, 1, 1, 1]} />
      <meshStandardMaterial color={'white'} />
    </mesh>
  )
}

export default Ground
