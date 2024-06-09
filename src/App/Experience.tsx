import Ground from './Ground'
import { Sky } from '@react-three/drei'

function Experience(): JSX.Element {
  const groundSize = 5

  return (
    <group position={[0, 0, 0]}>
      <Ground size={groundSize} />

      <ambientLight intensity={0.5} />
      <spotLight position={[-20, 10, 15]} intensity={10} decay={1} />
      <Sky distance={45000} sunPosition={[-1, 1, 0]} inclination={0} />
    </group>
  )
}

export default Experience