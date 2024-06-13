import { Sky } from '@react-three/drei'
import River from './River'
import Bed from './Bed'
import GrassTile from './GrassTile'
import Walls from './Walls'

function Experience(): JSX.Element {
  const groundSize = 5

  return (
    <group position={[0, 0, 0]}>
      <GrassTile position={[0, 0.4, 0]} />

      <Walls />

      <group position={[0, -0.1, 0]}>
        <River size={groundSize} position={[0, 0.3, 0]} />
        <Bed size={groundSize} position={[0, 0.1, 0]} />
      </group>

      <ambientLight intensity={0.5} />
      <spotLight position={[-20, 10, 15]} intensity={100} decay={1} />
      <Sky distance={45000} sunPosition={[0, 0.5, -1]} inclination={0} />
    </group>
  )
}

export default Experience