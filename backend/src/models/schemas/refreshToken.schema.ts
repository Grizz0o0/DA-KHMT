import { ObjectId } from 'mongodb'

export default class RefreshToken {
  _id: ObjectId
  userId: ObjectId
  refreshToken?: string
  refreshTokened?: string[]
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
  constructor({
    userId,
    refreshToken,
    refreshTokened,
    expiresAt
  }: {
    userId: ObjectId
    refreshToken?: string
    refreshTokened?: string[]
    expiresAt?: Date
  }) {
    this._id = new ObjectId()
    this.userId = userId
    this.refreshToken = refreshToken
    this.refreshTokened = refreshTokened ?? []
    this.expiresAt = expiresAt ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    this.createdAt = new Date()
    this.updatedAt = new Date()
  }
}
