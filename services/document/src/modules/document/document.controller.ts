import { NextFunction, Request, Response } from 'express'
import { ApiError } from '../../utils/api-error'
import { deleteDocument, getDownloadUrl, listDocuments, uploadDocument } from './document.service'

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
    const url = await getDownloadUrl(req.params.id)
    res.json({ url })
  } catch (err) {
    next(err)
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteDocument(req.params.id)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}
