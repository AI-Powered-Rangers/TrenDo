// 사용자가 첨부한 이미지를 압축해 data URL로 변환.
// localStorage 용량을 고려해 max width/height 1280px, JPEG 0.85 품질로 다운스케일.

export async function fileToCompressedDataURL(
  file: File,
  maxSize = 1280,
  quality = 0.85,
): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('이미지 파일만 첨부할 수 있어요.')
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error ?? new Error('파일 읽기 실패'))
    reader.readAsDataURL(file)
  })

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const ratio = Math.min(1, maxSize / Math.max(img.width, img.height))
      const w = Math.round(img.width * ratio)
      const h = Math.round(img.height * ratio)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(dataUrl)
        return
      }
      ctx.drawImage(img, 0, 0, w, h)
      try {
        resolve(canvas.toDataURL('image/jpeg', quality))
      } catch (err) {
        reject(err)
      }
    }
    img.onerror = () => reject(new Error('이미지 디코드 실패'))
    img.src = dataUrl
  })
}
