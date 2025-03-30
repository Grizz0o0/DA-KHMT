declare namespace Express {
  export interface Request {
    keyStore?: {
      userId: string | ObjectId
      refreshToken?: string
      refreshTokened?: [string]
      [key: string]: any
    }
    user?: {
      userId: string | ObjectId
      [key: string]: any
    }
    refreshToken?: string
    decode_forgot_password_token?: string
  }
}
