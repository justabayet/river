import { Sky } from '@react-three/drei'
import River from './River'
import Bed from './Bed'
import Walls from './Walls'

function Experience(): JSX.Element {
  const groundSize = 5

  return (
    <group position={[0, 0, 0]}>
      <Walls size={groundSize} />

      <group rotation={[-0.05, Math.PI, 0]} position={[0, -0.1, 0]}>
        <River size={groundSize} position={[0, 0.3, 0]} />
        <Bed size={groundSize} position={[0, 0.1, 0]} />
      </group>

      <ambientLight intensity={0.5} />
      <spotLight position={[-20, 10, 15]} intensity={10} decay={1} />
      <Sky distance={45000} sunPosition={[-1, 1, 0]} inclination={0} />
    </group>
  )
}

export default Experience