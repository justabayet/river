import { Texture } from 'three'


export function getTextureData(texture: Texture): Uint8ClampedArray {
  const img: HTMLImageElement = texture.image
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  canvas.width = img.width
  canvas.height = img.height

  ctx!.drawImage(img, 0, 0)

  const imageData = ctx!.getImageData(
    0, 0, img.width, img.height
  )

  return imageData.data
}