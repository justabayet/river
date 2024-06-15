import { Sky, useKeyboardControls } from '@react-three/drei'
import River from './River'
import Bed from './Bed'
import GrassTile from './GrassTile'
import Walls from './Walls'
import { Group } from 'three'
import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'


function Experience(): JSX.Element {
  const tileGroupRef = useRef<Group>(null)

  const [, getKeys] = useKeyboardControls()

  const [currentTileIndex, setCurrentTileIndex] = useState<number>(0)

  useFrame((_, delta) => {
    if (tileGroupRef.current != null) {
      const { forward, backward } = getKeys()

      const distanceDelta = -delta * 20.0 / 5.0

      if (forward) {
        tileGroupRef.current.position.z += distanceDelta
      } else if (backward) {
        tileGroupRef.current.position.z -= distanceDelta
      }

      tileGroupRef.current.position.z += distanceDelta * 0.1

      const posIndex = Math.floor((tileGroupRef.current.position.z + 2.5) / 5)
      setCurrentTileIndex(-posIndex)
    }
  })

  const groundSize = 5

  return (
    <group position={[0, 0, 0]}>
      <group>
        <River size={groundSize} position={[0, 0.3, 0]} />
        <Bed size={groundSize} position={[0, 0.1, 0]} />
      </group>

      <Walls />
      <group ref={tileGroupRef} position={[0, 0.45, 0]}>
        <GrassTile position={[0, 0, currentTileIndex * 5 - 5]} key={currentTileIndex - 1} />
        <GrassTile position={[0, 0, currentTileIndex * 5]} key={currentTileIndex} />
        <GrassTile position={[0, 0, currentTileIndex * 5 + 5]} key={currentTileIndex + 1} />
      </group>

      <ambientLight intensity={0.5} />
      <spotLight position={[-20, 10, 15]} intensity={100} decay={1} />
      <Sky distance={45000} sunPosition={[0, 0.5, -1]} inclination={0} />
    </group>
  )
}

export default Experience