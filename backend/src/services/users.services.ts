import 'dotenv/config'
import bcrypt from 'bcrypt'
import {
  createAccessToken,
  createRefreshToken,
  createForgotPasswordToken,
  createVerifyEmailToken
} from '~/utils/auth.utils'
import {
  registerReqBodyType,
  loginReqBodyType,
  forgotPasswordReqBodyType,
  verifyForgotPasswordReqBodyType,
  resetPasswordReqBodyType,
  changePasswordReqBodyType,
  updateMeReqBodyType,
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyForgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateMeSchema
} from '~/requestSchemas/users.request'
import { userSchema } from '~/models/users.model'
import { BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError } from '~/responses/error.response'
import databaseService from '~/services/database.services'
import RefreshTokenService from '~/services/refreshToken.services'
import { getInfoData, omitInfoData } from '~/utils/object.utils'
import { verifyToken } from '~/utils/jwt.utils'
import { convertToObjectId } from '~/utils/mongo.utils'
import { UserAuthProvider, UserVerifyStatus, UserGender, UserRole } from '~/constants/users'
import axios from 'axios'
import { generateRandomPassword } from '~/utils/crypto.utils'
import { GoogleTokenBody, GoogleUserInfo } from '~/types/auths.types'

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

  static login = async (payload: loginReqBodyType) => {
    const parseResult = await loginSchema.body.safeParseAsync(payload)
    if (!parseResult.success) {
      throw new BadRequestError('Invalid login data: ' + JSON.stringify(parseResult.error.flatten().fieldErrors))
    }
    const validatedData = parseResult.data

    const foundUser = await databaseService.users.findOne({ email: validatedData.email })
    if (!foundUser) throw new NotFoundError('Not found email')

    const isPasswordMatch = await bcrypt.compare(validatedData.password, foundUser.password)
    if (!isPasswordMatch) throw new BadRequestError('Password is not match')

    const [accessToken, refreshToken] = await Promise.all([
      createAccessToken({
        payload: { userId: foundUser._id.toString(), email: foundUser.email, role: foundUser.role },
        secretKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
      }),
      createRefreshToken({
        payload: { userId: foundUser._id.toString(), email: foundUser.email, role: foundUser.role },
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

  static register = async (payload: registerReqBodyType) => {
    const parseResult = await registerSchema.body.safeParseAsync(payload)
    if (!parseResult.success) {
      throw new BadRequestError('Invalid registration data: ' + JSON.stringify(parseResult.error.flatten().fieldErrors))
    }
    const validatedData = parseResult.data

    // Kiểm tra email đã tồn tại chưa
    const holderUser = await databaseService.users.findOne({ email: validatedData.email })
    if (holderUser) throw new BadRequestError('Email already registered !')

    // Kiểm tra username đã tồn tại chưa
    const existingUsername = await databaseService.users.findOne({ username: validatedData.username })
    if (existingUsername) throw new BadRequestError('Username already taken !')

    try {
      // Mã hóa mật khẩu
      const passwordHash = bcrypt.hashSync(validatedData.password, 10)

      const parseUser = userSchema.parse({ ...validatedData, password: passwordHash, role: UserRole.USER })
      const newUser = await databaseService.users.insertOne(parseUser)

      const foundUser = await databaseService.users.findOne({ _id: newUser.insertedId })
      if (!foundUser) throw new NotFoundError('User registration failed')

      // Tạo token
      const [accessToken, refreshToken] = await Promise.all([
        createAccessToken({
          payload: { userId: foundUser._id.toString(), email: foundUser.email, role: foundUser.role },
          secretKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
        }),
        createRefreshToken({
          payload: { userId: foundUser._id.toString(), email: foundUser.email, role: foundUser.role },
          secretKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
        })
      ])
      if (!accessToken || !refreshToken) throw new BadRequestError('Error creating tokens')

      // Lưu refresh token
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
    } catch (error) {
      // Xử lý các lỗi khác trong quá trình đăng ký
      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        throw error
      }
      console.error('Registration error:', error)
      throw new BadRequestError('Registration failed. Please try again later.')
    }
  }

  private static async getOAuthGoogleToken(code: string) {
    // Kiểm tra các biến môi trường OAuth cần thiết
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) {
      throw new BadRequestError('Missing OAuth environment variables')
    }

    const body = {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    }

    try {
      const { data } = await axios.post<GoogleTokenBody>('https://oauth2.googleapis.com/token', body, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      return data
    } catch (error) {
      console.error('Error getting Google OAuth token:', error)
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
            payload: {
              userId: foundUser._id.toString(),
              email: foundUser.email,
              role: foundUser.role,
              verify: UserVerifyStatus.Verified
            },
            secretKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
          }),
          createRefreshToken({
            payload: {
              userId: foundUser._id.toString(),
              email: foundUser.email,
              role: foundUser.role,
              verify: UserVerifyStatus.Verified
            },
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
        const payload = {
          username: userInfo.name,
          email: userInfo.email,
          password,
          confirm_password: password,
          phoneNumber: '',
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
    return getInfoData({ fields: ['_id', 'user'], object: del })
  }

  static handlerRefreshToken = async (refreshToken: string) => {
    // Kiểm tra refreshToken hết hạn chưa. Nếu hết hạn thì buộc logout
    const foundToken = await RefreshTokenService.findByRefreshTokenUsed(refreshToken)
    if (foundToken) {
      const { userId, email, role } = await verifyToken(refreshToken, process.env.JWT_SECRET_REFRESH_TOKEN as string)

      await RefreshTokenService.deleteByUserId(userId.toString())
      throw new BadRequestError('Something wrong happen !! pls relogin')
    }

    // RefreshToken chưa hết hạn
    const holderToken = await RefreshTokenService.findByRefreshToken(refreshToken)
    if (!holderToken) throw new UnauthorizedError('User not registered')
    const { userId, email, role } = await verifyToken(refreshToken, process.env.JWT_SECRET_REFRESH_TOKEN as string)

    const [accessToken, newRefreshToken] = await Promise.all([
      createAccessToken({
        payload: { userId, email, role },
        secretKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
      }),
      createRefreshToken({
        payload: { userId, email, role },
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
      user: { userId, email, role },
      tokens: getInfoData({ fields: ['refreshToken', 'refreshTokenUsed'], object: newTokens })
    }
  }

  static forgotPassword = async (payload: forgotPasswordReqBodyType) => {
    const parseResult = await forgotPasswordSchema.body.safeParseAsync(payload)
    if (!parseResult.success) {
      throw new BadRequestError(
        'Invalid forgot password data: ' + JSON.stringify(parseResult.error.flatten().fieldErrors)
      )
    }
    const validatedData = parseResult.data

    const foundUser = await databaseService.users.findOne({ email: validatedData.email })
    if (!foundUser) throw new NotFoundError('Email not registered')
    const secretKey = process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
    const forgotPasswordToken = await createForgotPasswordToken({
      payload: {
        userId: foundUser._id.toString(),
        email: foundUser.email,
        role: foundUser.role,
        type: 'forgot-password'
      },
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

  static verifyForgotPassword = async (payload: verifyForgotPasswordReqBodyType) => {
    const parseResult = await verifyForgotPasswordSchema.body.safeParseAsync(payload)
    if (!parseResult.success) {
      throw new BadRequestError('Invalid verification data: ' + JSON.stringify(parseResult.error.flatten().fieldErrors))
    }
    const validatedData = parseResult.data

    const decode = await verifyToken(
      validatedData.forgotPasswordToken,
      process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
    )
    if (!decode) throw new BadRequestError('forgot_token decode fail')

    const foundUser = await databaseService.users.findOne({ _id: convertToObjectId(decode.userId.toString()) })
    if (!foundUser) throw new NotFoundError('User not found')
    return decode
  }

  static resetPassword = async (payload: resetPasswordReqBodyType) => {
    const parseResult = await resetPasswordSchema.body.safeParseAsync(payload)
    if (!parseResult.success) {
      throw new BadRequestError(
        'Invalid reset password data: ' + JSON.stringify(parseResult.error.flatten().fieldErrors)
      )
    }
    const validatedData = parseResult.data

    const decode = await verifyToken(
      validatedData.forgotPasswordToken,
      process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
    )
    if (!decode) throw new BadRequestError('forgot_token decode fail')

    const foundUser = await databaseService.users.findOne({ _id: convertToObjectId(decode.userId.toString()) })
    if (!foundUser) throw new NotFoundError('User not found')

    const passwordHash = bcrypt.hashSync(validatedData.password, 10)
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
        returnDocument: 'after'
      }
    )
    return {
      user: getInfoData({ fields: ['_id', 'username', 'email', 'phoneNumber', 'role'], object: result })
    }
  }

  static changePassword = async (userId: string, payload: changePasswordReqBodyType) => {
    const parseResult = await changePasswordSchema.body.safeParseAsync(payload)
    if (!parseResult.success) {
      throw new BadRequestError(
        'Invalid change password data: ' + JSON.stringify(parseResult.error.flatten().fieldErrors)
      )
    }
    const validatedData = parseResult.data

    const foundUser = await databaseService.users.findOne({ _id: convertToObjectId(userId) })
    if (!foundUser) throw new NotFoundError('Not found user')

    const isPasswordMatch = await bcrypt.compare(validatedData.password, foundUser.password)
    if (!isPasswordMatch) throw new BadRequestError('Password is not match')

    const passwordHash = bcrypt.hashSync(validatedData.newPassword, 10)
    const result = await databaseService.users.findOneAndUpdate(
      { _id: foundUser._id },
      { $set: { password: passwordHash }, $currentDate: { updatedAt: true } },
      { returnDocument: 'after' }
    )
    return getInfoData({ fields: ['_id', 'username', 'email', 'phoneNumber', 'role'], object: result })
  }

  static deleteUser = async (userId: string) => {
    const [delUser, delToken] = await Promise.all([
      databaseService.users.findOneAndDelete({ _id: convertToObjectId(userId) }),
      RefreshTokenService.deleteByUserId(userId)
    ])
    if (!delUser || !delToken) throw new BadRequestError('Delete user or token fail')

    return getInfoData({ fields: ['_id', 'user', 'refreshToken', 'refreshTokenUsed'], object: delUser })
  }

  static updateMe = async (userId: string, payload: updateMeReqBodyType) => {
    const parseResult = await updateMeSchema.body.safeParseAsync(payload)
    if (!parseResult.success) {
      throw new BadRequestError('Invalid update data: ' + JSON.stringify(parseResult.error.flatten().fieldErrors))
    }
    const validatedData = parseResult.data

    const foundUser = await databaseService.users.findOne({ _id: convertToObjectId(userId) })
    if (!foundUser) throw new NotFoundError('Not found user')

    const result = await databaseService.users.findOneAndUpdate(
      { _id: convertToObjectId(userId) },
      {
        $set: { ...validatedData },
        $currentDate: { updatedAt: true }
      },
      { returnDocument: 'after' }
    )
    return omitInfoData({
      fields: ['verify', 'authProvider', 'verifyEmailToken', 'forgotPasswordToken', 'password', 'role'],
      object: result
    })
  }
}

export default UserService
