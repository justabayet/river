import { GroupProps, ThreeEvent } from '@react-three/fiber'
import { useRef } from 'react'
import { useCanvasTexture } from './hooks/useCanvasTexture'
import GrassDynamic from './GrassDynamic'
import InteractionPanel from './InteractionPanel'
import { Group, Vector2 } from 'three'
import { drawImageX, drawImageY } from './utils/canvasUtil'

interface GrassTileProps extends GroupProps {
  size?: number
  position?: [number, number, number]
}

function GrassTile({ size = 5, position, ...props }: GrassTileProps): JSX.Element {
  const previousPosition = useRef<Vector2 | null>(null)

  const { drawTrail: drawSwipeX, texture: textureSwipeX } = useCanvasTexture('canvas-swipe-x', { drawImage: drawImageX })
  const { drawTrail: drawSwipeY, texture: textureSwipeY } = useCanvasTexture('canvas-swipe-y', { x: 300, drawImage: drawImageY })

  const groupRef = useRef<Group>(null)

  return (
    <group position={position} {...props} ref={groupRef}>
      <GrassDynamic
        size={size}
        textureInteractionX={textureSwipeX}
        textureInteractionY={textureSwipeY}
        y={position && position[2]} />


      <InteractionPanel
        size={size}
        position={[0, 0.3, 0]}
        onPointerMove={(event: ThreeEvent<PointerEvent>) => {
          if (event.uv) {
            if (previousPosition.current != null) {
              drawSwipeX(previousPosition.current, event.uv)
              drawSwipeY(previousPosition.current, event.uv)
            }
            previousPosition.current = event.uv
          }
        }}
        onPointerOut={() => {
          previousPosition.current = null
        }} />
    </group>
  )
}

export default GrassTile
