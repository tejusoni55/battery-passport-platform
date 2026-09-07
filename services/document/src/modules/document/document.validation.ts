import multer from 'multer'
import { ApiError } from '../../utils/api-error'

const ALLOWED_MIME_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new ApiError(400, 'Unsupported file type. Allowed types: PDF, PNG, JPG, JPEG'))
    }
    cb(null, true)
  },
})
