import 'dotenv/config'
import bcrypt from 'bcrypt'
import {
  createAccessToken,
  createRefreshToken,
  createForgotPasswordToken,
  createVerifyEmailToken
} from '~/utils/authUtils'
import {
  RegisterReqBody,
  LoginReqBody,
  ForgotPasswordReqBody,
  VerifyForgotPasswordReqBody,
  ResetPasswordReqBody,
  ChangePasswordReqBody,
  UpdateMeReqBody,
  GoogleTokenBody,
  GoogleUserInfo
} from '~/models/requests/users.request'
import { userSchema } from '~/models/schemas/users.schema'
import { BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError } from '~/responses/error.response'
import databaseService from '~/services/database.services'
import RefreshTokenService from '~/services/refreshToken.services'
import { getInfoData, omitInfoData } from '~/utils/objectUtils'
import { verifyToken } from '~/utils/jwtUtils'
import { convertToObjectId } from '~/utils/mongoUtils'
import { UserAuthProvider, UserVerifyStatus } from '~/constants/users'
import axios from 'axios'
import { generateRandomPassword } from '~/utils/cryptoUtils'

class UserService {
  static getUserByEmail = async (email: string) => {
    const foundUser = await databaseService.users.findOne({ email })
    if (!foundUser) throw new NotFoundError('Not found user')

    return omitInfoData({
      fields: ['verify', 'authProvider', 'verifyEmailToken', 'forgotPasswordToken'],
      object: foundUser
    })
  }

  static getUserById = async (userId: string) => {
    console.log(`userId:::${userId}`)
    const foundUser = await databaseService.users.findOne({ _id: convertToObjectId(userId) })
    if (!foundUser) throw new NotFoundError('Not found user')

    return omitInfoData({
      fields: [
        'verify',
        'authProvider',
        'verifyEmailToken',
        'forgotPasswordToken',
        'password',
        'createdAt',
        'updatedAt'
      ],
      object: foundUser
    })
  }

  static getAllUsers = async () => {
    const foundUsers = await databaseService.users.find({}).toArray()
    if (!foundUsers.length) throw new NotFoundError('Not found users')

    return foundUsers.map((user) =>
      omitInfoData({
        fields: [
          'verify',
          'authProvider',
          'verifyEmailToken',
          'forgotPasswordToken',
          'password',
          'createdAt',
          'updatedAt'
        ],
        object: user
      })
    )
  }

  static login = async (payload: LoginReqBody) => {
    const foundUser = await databaseService.users.findOne({ email: payload.email })
    if (!foundUser) throw new NotFoundError('Not found email')

    const match = await bcrypt.compare(payload.password, foundUser.password)
    if (!match) throw new BadRequestError('Password is not match')

    const [accessToken, refreshToken] = await Promise.all([
      createAccessToken({
        payload: { userId: foundUser._id.toString(), email: foundUser.email },
        secretKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
      }),
      createRefreshToken({
        payload: { userId: foundUser._id.toString(), email: foundUser.email },
        secretKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
      })
    ])

    if (!accessToken || !refreshToken) throw new BadRequestError('Error creating tokens')
    const decodeRefreshToken = await verifyToken(refreshToken, process.env.JWT_SECRET_REFRESH_TOKEN as string)
    await RefreshTokenService.upsertRefreshToken({
      userId: foundUser._id,
      refreshToken,
      expiresAt: new Date((decodeRefreshToken.exp as number) * 1000)
    })
    return {
      user: getInfoData({ fields: ['_id', 'username', 'email', 'phoneNumber'], object: foundUser }),
      tokens: { accessToken, refreshToken }
    }
  }

  static register = async (payload: RegisterReqBody) => {
    const holderUser = await databaseService.users.findOne({ email: payload.email })
    if (holderUser) throw new BadRequestError('Email already registered !')

    const passwordHash = bcrypt.hashSync(payload.password, 10)

    const parseUser = userSchema.parse({ ...payload, password: passwordHash })
    const newUser = await databaseService.users.insertOne(parseUser)

    const foundUser = await databaseService.users.findOne({ _id: newUser.insertedId })
    if (!foundUser) throw new NotFoundError('User registration failed')

    const [accessToken, refreshToken] = await Promise.all([
      createAccessToken({
        payload: { userId: foundUser._id.toString(), email: foundUser.email },
        secretKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
      }),
      createRefreshToken({
        payload: { userId: foundUser._id.toString(), email: foundUser.email },
        secretKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
      })
    ])
    if (!accessToken || !refreshToken) throw new BadRequestError('Error creating tokens')

    const decodeRefreshToken = await verifyToken(refreshToken, process.env.JWT_SECRET_REFRESH_TOKEN as string)
    await RefreshTokenService.upsertRefreshToken({
      userId: foundUser._id,
      refreshToken,
      expiresAt: new Date((decodeRefreshToken.exp as number) * 1000)
    })

    return {
      user: getInfoData({ fields: ['_id', 'username', 'email', 'phoneNumber'], object: foundUser }),
      tokens: { accessToken, refreshToken }
    }
  }

  private static async getOAuthGoogleToken(code: string) {
    const body = {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    }
    try {
      const { data } = await axios.post('https://oauth2.googleapis.com/token', body, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      return data as GoogleTokenBody
    } catch (error) {
      throw new BadRequestError('Failed to get Google OAuth token')
    }
  }

  private static async getGoogleUserInfo(access_token: string, id_token: string) {
    try {
      const { data } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
        params: {
          access_token,
          alt: 'json'
        },
        headers: {
          Authorization: `Bearer ${id_token}`
        }
      })
      return data as GoogleUserInfo
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired access token')
    }
  }

  static oAuthGoogle = async (code: string) => {
    try {
      const { access_token, id_token } = await this.getOAuthGoogleToken(code)
      const userInfo = await this.getGoogleUserInfo(access_token, id_token)
      if (!userInfo.verified_email) {
        throw new ForbiddenError('Google email is not verified')
      }

      const foundUser = await databaseService.users.findOne({ email: userInfo.email })
      let accessToken, refreshToken, userId

      // Nếu tài khoản đã được tạo trước đấy rồi
      if (foundUser?.email) {
        ;[accessToken, refreshToken] = await Promise.all([
          createAccessToken({
            payload: { userId: foundUser._id.toString(), email: foundUser.email, verify: 1 },
            secretKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
          }),
          createRefreshToken({
            payload: { userId: foundUser._id.toString(), email: foundUser.email, verify: 1 },
            secretKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
          })
        ])
        if (!accessToken || !refreshToken) throw new BadRequestError('Error creating tokens')

        const decodeRefreshToken = await verifyToken(refreshToken, process.env.JWT_SECRET_REFRESH_TOKEN as string)
        await RefreshTokenService.upsertRefreshToken({
          userId: foundUser._id,
          refreshToken,
          expiresAt: new Date((decodeRefreshToken.exp as number) * 1000)
        })
        userId = foundUser._id
      }
      // Nếu tài khoản chưa được tạo trước đấy => Tạo tài khoản mới
      else {
        const password = generateRandomPassword()
        const payload: RegisterReqBody = {
          username: userInfo.name,
          email: userInfo.email,
          password,
          verify: UserVerifyStatus.Verified,
          avatar: userInfo.picture,
          authProvider: UserAuthProvider.Google
        }
        const metadata = await this.register(payload)
        accessToken = metadata?.tokens.accessToken
        refreshToken = metadata?.tokens.refreshToken
        userId = metadata?.user._id
      }
      return { userId, accessToken, refreshToken }
    } catch (error) {
      throw new UnauthorizedError(`Google OAuth failed`)
    }
  }

  static logout = async (keyStore: any) => {
    const del = await RefreshTokenService.deleteByUserId(keyStore.userId)
    return getInfoData({ fields: ['_id', 'user', 'refreshToken', 'refreshTokenUsed'], object: del })
  }

  static handlerRefreshToken = async (refreshToken: string) => {
    // Kiểm tra refreshToken hết hạn chưa. Nếu hết hạn thì buộc logout
    const foundToken = await RefreshTokenService.findByRefreshTokenUsed(refreshToken)
    if (foundToken) {
      const { userId, email } = await verifyToken(refreshToken, process.env.JWT_SECRET_REFRESH_TOKEN as string)
      console.log({ userId, email })

      await RefreshTokenService.deleteByUserId(userId)
      throw new BadRequestError('Something wrong happen !! pls relogin')
    }

    // RefreshToken chưa hết hạn
    const holderToken = await RefreshTokenService.findByRefreshToken(refreshToken)
    if (!holderToken) throw new UnauthorizedError('User not registered')
    const { userId, email } = await verifyToken(refreshToken, process.env.JWT_SECRET_REFRESH_TOKEN as string)

    const [accessToken, newRefreshToken] = await Promise.all([
      createAccessToken({
        payload: { userId, email },
        secretKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
      }),
      createRefreshToken({
        payload: { userId, email },
        secretKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
      })
    ])

    if (!accessToken || !newRefreshToken) throw new BadRequestError('Error creating tokens')
    databaseService.refreshTokens.updateOne(
      { userId: holderToken.userId },
      {
        $set: {
          refreshToken: newRefreshToken
        },
        $addToSet: {
          refreshTokenUsed: refreshToken
        }
      }
    )
    const decodeRefreshToken = await verifyToken(newRefreshToken, process.env.JWT_SECRET_REFRESH_TOKEN as string)
    const newTokens = await RefreshTokenService.updateRefreshToken({
      userId: holderToken.userId,
      refreshToken,
      newRefreshToken: newRefreshToken,
      newExpiresAt: new Date((decodeRefreshToken.exp as number) * 1000)
    })

    return {
      user: { userId, email },
      tokens: getInfoData({ fields: ['refreshToken', 'refreshTokenUsed'], object: newTokens })
    }
  }

  static forgotPassWord = async (payload: ForgotPasswordReqBody) => {
    const foundUser = await databaseService.users.findOne({ email: payload.email })
    if (!foundUser) throw new NotFoundError('Email not registered')
    const secretKey = process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
    const forgotPasswordToken = await createForgotPasswordToken({
      payload: { userId: foundUser._id.toString(), email: foundUser.email, type: 'forgot-password' },
      secretKey
    })

    await databaseService.users.updateOne(
      { _id: foundUser._id },
      {
        $set: { forgotPasswordToken: forgotPasswordToken as string },
        $currentDate: {
          updatedAt: true
        }
      }
    )
    return { forgotPasswordToken }
  }

  static verifyForgotPassWord = async (payload: VerifyForgotPasswordReqBody) => {
    const decode = await verifyToken(
      payload.forgotPasswordToken,
      process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
    )
    if (!decode) throw new BadRequestError('forgot_token decode fail')

    const foundUser = await databaseService.users.findOne({ _id: convertToObjectId(decode.userId) })
    if (!foundUser) throw new NotFoundError('User not found')
    return decode
  }

  static resetPassWord = async (payload: ResetPasswordReqBody) => {
    const decode = await verifyToken(
      payload.forgotPasswordToken,
      process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
    )
    if (!decode) throw new BadRequestError('forgot_token decode fail')

    const foundUser = await databaseService.users.findOne({ _id: convertToObjectId(decode.userId) })
    if (!foundUser) throw new NotFoundError('User not found')

    const passwordHash = bcrypt.hashSync(payload.password, 10)
    const result = await databaseService.users.findOneAndUpdate(
      { _id: foundUser._id },
      {
        $set: {
          password: passwordHash,
          forgotPasswordToken: ''
        },
        $currentDate: {
          updatedAt: true
        }
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    )
    return {
      user: getInfoData({ fields: ['_id', 'username', 'email', 'phoneNumber'], object: result })
    }
  }

  static changePassword = async (payload: ChangePasswordReqBody) => {
    const foundUser = await databaseService.users.findOne({ _id: convertToObjectId(payload.userId) })
    if (!foundUser) throw new NotFoundError('Not found user')

    const match = await bcrypt.compare(payload.password, foundUser.password)
    if (!match) throw new BadRequestError('Password is not match')

    const passwordHash = bcrypt.hashSync(payload.newPassword, 10)
    const result = await databaseService.users.findOneAndUpdate(
      { _id: foundUser._id },
      { $set: { password: passwordHash }, $currentDate: { updatedAt: true } },
      { upsert: true, returnDocument: 'after' }
    )
    return getInfoData({ fields: ['_id', 'username', 'email', 'phoneNumber'], object: result })
  }

  static deleteUser = async (userId: string) => {
    const [delUser, delToken] = await Promise.all([
      databaseService.users.findOneAndDelete({ _id: convertToObjectId(userId) }),
      RefreshTokenService.deleteByUserId(userId)
    ])
    if (!delUser || !delToken) throw new BadRequestError('Delete user or token fail')

    return getInfoData({ fields: ['_id', 'user', 'refreshToken', 'refreshTokenUsed'], object: delUser })
  }

  static updateUser = async ({ payload, userId }: { payload: UpdateMeReqBody; userId: string }) => {
    const foundUser = await databaseService.users.findOne({ _id: convertToObjectId(userId) })
    if (!foundUser) throw new NotFoundError('Not found user')

    if (payload.dateOfBirth) {
      payload.dateOfBirth = new Date(payload.dateOfBirth)
    }

    const result = await databaseService.users.findOneAndUpdate(
      { _id: convertToObjectId(userId) },
      { $set: { ...(payload as UpdateMeReqBody & { dateOfBirth?: Date }) }, $currentDate: { updatedAt: true } },
      { upsert: true, returnDocument: 'after' }
    )
    return omitInfoData({
      fields: ['verify', 'authProvider', 'verifyEmailToken', 'forgotPasswordToken', 'password'],
      object: result
    })
  }
}

export default UserService
