import { Sky } from '@react-three/drei'
import River from './River'
import Bed from './Bed'
import GrassTile from './GrassTile'
import Walls from './Walls'

interface TileProps {
  y?: number
}

function Tile({ y = 0 }: TileProps): JSX.Element {
  const groundSize = 5

  return (
    <group>
      <GrassTile position={[0, 0.45, y]} />
      <River size={groundSize} position={[0, 0.3, y]} />
      <Bed size={groundSize} position={[0, 0.1, y]} />
    </group>
  )
}

function Experience(): JSX.Element {

  return (
    <group position={[0, 0, 0]}>
      {/* <Tile y={-5} /> */}
      <Tile />
      {/* <Tile y={5} />
      <Tile y={10} /> */}

      <Walls />

      <ambientLight intensity={0.5} />
      <spotLight position={[-20, 10, 15]} intensity={100} decay={1} />
      <Sky distance={45000} sunPosition={[0, 0.5, -1]} inclination={0} />
    </group>
  )
}

export default Experience