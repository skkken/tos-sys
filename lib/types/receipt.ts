export interface OCRResult {
  amount: number | null
  date: string | null
  storeName: string | null
}

export interface UploadResult {
  storagePath: string
  ocrResult: OCRResult
}
