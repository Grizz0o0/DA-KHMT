import { ObjectId } from 'mongodb'
export interface CreateRefreshTokenReqBody {
  userId: ObjectId
  refreshToken?: string
  expiresAt?: Date
}

export interface UpdateRefreshTokenReqBody {
  userId: ObjectId
  refreshToken: string
  newRefreshToken: string
  newExpiresAt?: Date
}
