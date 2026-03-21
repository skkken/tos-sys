'use client'

import { useState } from 'react'
import { CameraInput, type UploadResult } from '@/components/receipts/camera-input'
import { ReceiptForm } from '@/components/receipt/receipt-form'

export default function NewReceiptPage() {
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleUploadComplete(result: UploadResult) {
    setError(null)
    setUploadResult(result)
  }

  function handleError(message: string) {
    setError(message)
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="mb-6 text-xl font-bold">領収書を登録</h1>

      <div className="space-y-6">
        <CameraInput
          onUploadComplete={handleUploadComplete}
          onError={handleError}
        />

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {uploadResult && (
          <ReceiptForm
            storagePath={uploadResult.storagePath}
            ocrResult={uploadResult.ocrResult}
          />
        )}
      </div>
    </div>
  )
}
