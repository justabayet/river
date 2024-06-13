import { Sky } from '@react-three/drei'
import River from './River'
import Bed from './Bed'
import GrassTile from './GrassTile'

function Experience(): JSX.Element {
  const groundSize = 5

  return (
    <group position={[0, 0, 0]}>

      <GrassTile position={[0, 0.4, 0]} />

      <group position={[-5, -0.1, 0]} rotation={[0, Math.PI / 2, 0]}>
        <River size={groundSize} position={[0, 0.3, 0]} />
        <Bed size={groundSize} position={[0, 0.1, 0]} />
      </group>
      <group position={[-10, -0.1, 0]} rotation={[0, Math.PI / 2, 0]}>
        <River size={groundSize} position={[0, 0.3, 0]} />
        <Bed size={groundSize} position={[0, 0.1, 0]} />
      </group>
      <group position={[0, -0.1, -5]}>
        <River size={groundSize} position={[0, 0.3, 0]} />
        <Bed size={groundSize} position={[0, 0.1, 0]} />
      </group>
      <group position={[0, -0.1, 0]}>
        <River size={groundSize} position={[0, 0.3, 0]} />
        <Bed size={groundSize} position={[0, 0.1, 0]} />
      </group>
      <group position={[0, -0.1, 5]}>
        <River size={groundSize} position={[0, 0.3, 0]} />
        <Bed size={groundSize} position={[0, 0.1, 0]} />
      </group>
      <group position={[0, -0.1, 10]}>
        <River size={groundSize} position={[0, 0.3, 0]} />
        <Bed size={groundSize} position={[0, 0.1, 0]} />
      </group>
      <group position={[0, -0.1, 15]}>
        <River size={groundSize} position={[0, 0.3, 0]} />
        <Bed size={groundSize} position={[0, 0.1, 0]} />
      </group>
      <group position={[0, -0.1, 20]}>
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