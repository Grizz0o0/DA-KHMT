import { UserAuthProvider, UserGender, UserRole, UserVerifyStatus } from '~/constants/users'

export interface RegisterReqBody {
  username: string
  email: string
  password: string
  phoneNumber?: string
  verify?: UserVerifyStatus
  avatar?: string
  authProvider?: UserAuthProvider
}

export interface LoginReqBody {
  email: string
  password: string
}

export interface ForgotPasswordReqBody {
  email: string
}

export interface VerifyForgotPasswordReqBody {
  forgotPasswordToken: string
}

export interface ResetPasswordReqBody {
  password: string
  forgotPasswordToken: string
}

export interface ChangePasswordReqBody {
  userId: string
  password: string
  newPassword: string
}

export interface GetUserByIdReqBody {
  id: string
}

export interface DeleteMeReqBody {
  id: string
}

export interface UpdateMeReqBody {
  username?: string
  email?: string
  avatar?: string
  coverPhoto?: string
  phoneNumber?: string
  dateOfBirth?: string | Date
  gender?: UserGender
  address?: string
}

export interface GoogleTokenBody {
  access_token: string
  refresh_token: string
  expires_in: string
  scope: string
  token_type: string
  id_token: string
}

export interface GoogleUserInfo {
  id: string
  email: string
  verified_email: boolean
  name: string
  given_name: string
  family_name: string
  picture: string
}
