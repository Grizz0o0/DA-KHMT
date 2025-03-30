import { verify } from 'jsonwebtoken'
import { TokenPayload } from '~/types/auth'

export const verifyToken = async (token: string, keySecret: string): Promise<TokenPayload> => {
  return verify(token, keySecret) as TokenPayload
}
