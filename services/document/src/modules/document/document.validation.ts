import multer from 'multer'
import { ApiError } from '../../utils/api-error'

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024

export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
})

interface UpdateDocumentBody {
  fileName?: unknown
}

export function validateUpdateInput(body: UpdateDocumentBody): { fileName: string } {
  if (typeof body?.fileName !== 'string' || body.fileName.trim().length === 0) {
    throw new ApiError(400, 'fileName is required')
  }
  return { fileName: body.fileName.trim() }
}
