import { ObjectId } from 'mongodb'
export interface CreateRefreshTokenReqBody {
  userId: ObjectId
  refreshToken?: string
  exp?: Date
}

export interface UpdateRefreshTokenReqBody {
  userId: ObjectId
  refreshToken: string
  newRefreshToken: string
  newExp?: Date
}
