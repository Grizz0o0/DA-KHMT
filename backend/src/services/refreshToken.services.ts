import { CreateRefreshTokenReqBody, UpdateRefreshTokenReqBody } from '~/models/requests/refreshTokens.request'
import databaseService from '~/services/database.services'
import { convertToObjectId } from '../utils/mongoUtils'
import { ObjectId } from 'mongodb'

class RefreshTokenService {
  static upsertRefreshToken = async ({ userId, refreshToken, expiresAt }: CreateRefreshTokenReqBody) => {
    try {
      const filter = { userId }
      const update = {
        $set: {
          refreshTokenUsed: [],
          refreshToken,
          expiresAt
        }
      }
      const option = { upsert: true, returnDocument: 'after' as const }

      const tokens = await databaseService.refreshTokens.findOneAndUpdate(filter, update, option)
      return tokens?.refreshToken || null
    } catch (error) {
      throw new Error('Failed to create/update key token')
    }
  }

  static findByUserId = async (userId: string) => {
    return await databaseService.refreshTokens.findOne({ userId: convertToObjectId(userId) })
  }

  static findByRefreshTokenUsed = async (refreshToken: string) => {
    return await databaseService.refreshTokens.findOne({ refreshTokened: refreshToken })
  }

  static findByRefreshToken = async (refreshToken: string) => {
    return await databaseService.refreshTokens.findOne({ refreshToken })
  }

  static deleteByUserId = async (userId: string) => {
    return await databaseService.refreshTokens.findOneAndDelete({ userId: convertToObjectId(userId) })
  }

  static updateRefreshToken = async ({
    userId,
    refreshToken,
    newRefreshToken,
    newExpiresAt
  }: UpdateRefreshTokenReqBody) => {
    const filter = { userId },
      update = {
        $set: { refreshToken: newRefreshToken, expiresAt: newExpiresAt },
        $addToSet: { refreshTokenUsed: refreshToken }
      },
      option = { returnDocument: 'after' as const }
    return await databaseService.refreshTokens.findOneAndUpdate(filter, update, option)
  }
}

export default RefreshTokenService
