import {
  createRefreshTokenTypeBody,
  updateRefreshTokenTypeBody,
  createRefreshTokenSchema,
  updateRefreshTokenSchema,
  findByUserIdSchema,
  findByRefreshTokenSchema,
  deleteByUserIdSchema
} from '~/requestSchemas/refreshTokens.request'
import databaseService from '~/services/database.services'
import { convertToObjectId } from '../utils/mongo.utils'
import { ObjectId } from 'mongodb'

class RefreshTokenService {
  static upsertRefreshToken = async ({ userId, refreshToken, expiresAt }: createRefreshTokenTypeBody) => {
    try {
      const validatedData = createRefreshTokenSchema.parse({ userId, refreshToken, expiresAt })

      const filter = { userId: validatedData.userId }
      const update = {
        $set: {
          refreshTokenUsed: [],
          refreshToken: validatedData.refreshToken,
          expiresAt: validatedData.expiresAt
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
    console.log(`userId:::${userId}`)
    const { userId: validatedUserId } = findByUserIdSchema.parse({ userId })
    return await databaseService.refreshTokens.findOne({ userId: validatedUserId })
  }

  static findByRefreshTokenUsed = async (refreshToken: string) => {
    const { refreshToken: validatedRefreshToken } = findByRefreshTokenSchema.parse({ refreshToken })

    return await databaseService.refreshTokens.findOne({ refreshTokened: validatedRefreshToken })
  }

  static findByRefreshToken = async (refreshToken: string) => {
    const { refreshToken: validatedRefreshToken } = findByRefreshTokenSchema.parse({ refreshToken })

    return await databaseService.refreshTokens.findOne({ refreshToken: validatedRefreshToken })
  }

  static deleteByUserId = async (userId: string) => {
    const { userId: validatedUserId } = deleteByUserIdSchema.parse({ userId })

    return await databaseService.refreshTokens.findOneAndDelete({ userId: validatedUserId })
  }

  static updateRefreshToken = async ({
    userId,
    refreshToken,
    newRefreshToken,
    newExpiresAt
  }: updateRefreshTokenTypeBody) => {
    const validatedData = updateRefreshTokenSchema.parse({
      userId,
      refreshToken,
      newRefreshToken,
      newExpiresAt
    })

    const filter = { userId: validatedData.userId },
      update = {
        $set: { refreshToken: validatedData.newRefreshToken, expiresAt: validatedData.newExpiresAt },
        $addToSet: { refreshTokenUsed: validatedData.refreshToken }
      },
      option = { returnDocument: 'after' as const }
    return await databaseService.refreshTokens.findOneAndUpdate(filter, update, option)
  }
}

export default RefreshTokenService
