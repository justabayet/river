import { MeshProps } from '@react-three/fiber'

interface GroundProps extends MeshProps {
  size?: number
}

function Ground({ size = 5, ...props }: GroundProps): JSX.Element {
  return (
    <mesh {...props} rotation={[- Math.PI / 2, 0, 0]}>
      <boxGeometry args={[size, size, size / 20, 1, 1, 1]} />
      <meshStandardMaterial color={'white'} />
    </mesh>
  )
}

export default Ground
