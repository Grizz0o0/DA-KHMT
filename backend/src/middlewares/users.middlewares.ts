import { Response, Request, NextFunction } from 'express'
import { HEADER } from '../constants/auth'
import { NotFoundError, UnauthorizedError } from '../responses/error.response'
import KeyService from '~/services/refreshToken.services'
import { verifyToken } from '~/utils/jwtUtils'

export const authentication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.headers[HEADER.CLIENT_ID]
    if (!userId) throw new UnauthorizedError('Missing client ID')
    const keyStore = await KeyService.findByUserId(userId as string)
    if (!keyStore) throw new NotFoundError('KeyStore not found for user ID')

    const accessToken = req.headers[HEADER.AUTHORIZATION] as string
    if (!accessToken) throw new UnauthorizedError('Missing access token')

    const decode = await verifyToken(accessToken, process.env.JWT_SECRET_ACCESS_TOKEN as string)
    console.log(`decode::: ${decode}`)
    if (userId !== (await decode).userId) throw new UnauthorizedError('Invalid user ID in token')

    req.keyStore = keyStore
    req.user = decode
    return next()
  } catch (error) {
    console.error('Error in authentication middleware:', error)
    next(new UnauthorizedError('Authentication failed'))
  }
}

export const authenticationV2 = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.headers[HEADER.CLIENT_ID]
    if (!userId) throw new UnauthorizedError('Missing client ID')
    console.log(`userId:::${userId}`)

    const keyStore = await KeyService.findByUserId(userId as string)
    console.log(keyStore)
    if (!keyStore) throw new NotFoundError('KeyStore not found for user ID')

    const refreshToken = req.headers[HEADER.REFRESHTOKEN] as string
    if (!refreshToken) throw new UnauthorizedError('Missing refreshToken')

    const decode = await verifyToken(refreshToken, process.env.JWT_SECRET_REFRESH_TOKEN as string)
    console.log(`decode::: ${decode}`)
    if (userId !== (await decode).userId) throw new UnauthorizedError('Invalid user ID in token')

    req.refreshToken = refreshToken
    req.keyStore = keyStore
    req.user = decode
    return next()
  } catch (error) {
    console.error('Error in authenticationV2 middleware:', error)
    next(new UnauthorizedError('AuthenticationV2 failed'))
  }
}
