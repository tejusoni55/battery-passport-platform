import { Schema, model } from 'mongoose'

export interface DocumentRecord {
  fileName: string
  mimeType: string
  fileSize: number
  s3Key: string
  uploadedBy: string
  createdAt: Date
  updatedAt: Date
}

const documentSchema = new Schema<DocumentRecord>(
  {
    fileName: { type: String, required: true, trim: true },
    mimeType: { type: String, required: true, trim: true },
    fileSize: { type: Number, required: true, min: 0 },
    s3Key: { type: String, required: true, unique: true },
    uploadedBy: { type: String, required: true },
  },
  { timestamps: true }
)

export const DocumentModel = model<DocumentRecord>('Document', documentSchema)
