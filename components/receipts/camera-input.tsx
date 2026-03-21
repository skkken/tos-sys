'use client'

import { useRef, useState } from 'react'
import { Camera, ImagePlus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { UploadResult } from '@/lib/types/receipt'

export type { UploadResult }

interface CameraInputProps {
  onUploadComplete: (result: UploadResult) => void
  onError: (error: string) => void
}

const MAX_SIZE = 5 * 1024 * 1024 // 5MB

async function resizeImage(file: File): Promise<Blob> {
  if (file.size <= MAX_SIZE) return file

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let { width, height } = img
      const ratio = Math.sqrt(MAX_SIZE / file.size)
      width = Math.floor(width * ratio)
      height = Math.floor(height * ratio)
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Canvas not supported'))
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Resize failed'))),
        'image/jpeg',
        0.85
      )
    }
    img.onerror = () => reject(new Error('画像の読み込みに失敗しました'))
    img.src = URL.createObjectURL(file)
  })
}

export function CameraInput({ onUploadComplete, onError }: CameraInputProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      onError('JPEG/PNG形式の画像を選択してください')
      return
    }

    setPreviewUrl(URL.createObjectURL(file))
    setIsUploading(true)

    try {
      const resized = await resizeImage(file)
      if (resized.size > MAX_SIZE) {
        onError('画像サイズを5MB以下に縮小できませんでした。別の画像を選択してください')
        return
      }
      const formData = new FormData()
      formData.append('file', resized, file.name)

      const res = await fetch('/api/receipts/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'アップロードに失敗しました')
      }

      const result: UploadResult = await res.json()
      onUploadComplete(result)
    } catch (e) {
      onError(e instanceof Error ? e.message : 'アップロードに失敗しました')
    } finally {
      setIsUploading(false)
    }
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  return (
    <div className="space-y-4">
      <input
        ref={cameraRef}
        type="file"
        accept="image/jpeg,image/png"
        capture="environment"
        className="hidden"
        onChange={onChange}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={onChange}
      />

      {previewUrl ? (
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="領収書プレビュー"
            className="h-full w-full object-contain"
          />
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Loader2 className="size-8 animate-spin text-white" />
              <span className="ml-2 text-white">解析中...</span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex aspect-[3/4] w-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25">
          <p className="text-sm text-muted-foreground">領収書を撮影または選択してください</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          size="lg"
          disabled={isUploading}
          onClick={() => cameraRef.current?.click()}
        >
          <Camera className="mr-2 size-4" />
          撮影
        </Button>
        <Button
          variant="outline"
          size="lg"
          disabled={isUploading}
          onClick={() => galleryRef.current?.click()}
        >
          <ImagePlus className="mr-2 size-4" />
          選択
        </Button>
      </div>
    </div>
  )
}
