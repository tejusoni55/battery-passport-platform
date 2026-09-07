import { randomUUID } from 'crypto'
import path from 'path'
import mongoose from 'mongoose'
import { deleteObject, getPresignedDownloadUrl, putObject } from '../../config/minio'
import { ApiError } from '../../utils/api-error'
import { DocumentModel } from './document.model'

export async function uploadDocument(file: Express.Multer.File, uploadedBy: string) {
  const s3Key = `${randomUUID()}${path.extname(file.originalname)}`
  await putObject(s3Key, file.buffer, file.mimetype)

  return DocumentModel.create({
    fileName: file.originalname,
    mimeType: file.mimetype,
    fileSize: file.size,
    s3Key,
    uploadedBy,
  })
}

export async function listDocuments() {
  return DocumentModel.find().sort({ createdAt: -1 })
}

export async function getDownloadUrl(id: string) {
  const document = await findDocumentById(id)
  return getPresignedDownloadUrl(document.s3Key)
}

export async function deleteDocument(id: string) {
  const document = await findDocumentById(id)
  await deleteObject(document.s3Key)
  await DocumentModel.findByIdAndDelete(id)
}

async function findDocumentById(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid document id')
  }
  const document = await DocumentModel.findById(id)
  if (!document) {
    throw new ApiError(404, 'Document not found')
  }
  return document
}
