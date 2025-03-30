import { JwtPayload } from 'jsonwebtoken'

export interface TokenPayload extends JwtPayload {
  userId: string
  [key: string]: any
}

export interface CreateTokenPairParams {
  payload: TokenPayload
  secretKey: string
}
