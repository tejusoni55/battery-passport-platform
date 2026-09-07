import { Schema, model } from 'mongoose'

export type UserRole = 'admin' | 'user'

export interface UserDocument {
  email: string
  password: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], required: true },
  },
  { timestamps: true }
)

export const UserModel = model<UserDocument>('User', userSchema)
