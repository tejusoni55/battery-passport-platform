import { NextFunction, Request, Response } from 'express'
import { ApiError } from '../../utils/api-error'
import { deleteDocument, getDownloadUrl, listDocuments, updateDocument, uploadDocument } from './document.service'
import { validateUpdateInput } from './document.validation'

export async function upload(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated')
    }
    if (!req.file) {
      throw new ApiError(400, 'A file is required')
    }
    const document = await uploadDocument(req.file, req.user.userId)
    res.status(201).json(document)
  } catch (err) {
    next(err)
  }
}

export async function list(_req: Request, res: Response, next: NextFunction) {
  try {
    const documents = await listDocuments()
    res.json(documents)
  } catch (err) {
    next(err)
  }
}

export async function downloadUrl(req: Request, res: Response, next: NextFunction) {
  try {
    const url = await getDownloadUrl(req.params.docId)
    res.json({ url })
  } catch (err) {
    next(err)
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const input = validateUpdateInput(req.body)
    const document = await updateDocument(req.params.docId, input)
    res.json(document)
  } catch (err) {
    next(err)
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteDocument(req.params.docId)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}
