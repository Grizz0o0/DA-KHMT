import { ObjectId } from 'mongodb'
import { UserAuthProvider, UserGender, UserRole, UserVerifyStatus } from '~/constants/users'
export default class User {
  _id: ObjectId
  username: string
  email: string
  password: string
  phoneNumber: string
  dateOfBirth?: Date
  gender: UserGender
  address: string
  avatar: string
  coverPhoto: string
  role: UserRole
  verify: UserVerifyStatus
  authProvider: UserAuthProvider
  tickets: ObjectId[]
  verifyEmailToken: string
  forgotPasswordToken: string
  createdAt: Date
  updatedAt: Date

  constructor({
    username = '',
    email,
    password,
    phoneNumber = '',
    avatar = '',
    coverPhoto = '',
    dateOfBirth,
    gender = UserGender.Other,
    address = '',
    role = UserRole.Customer,
    verify = UserVerifyStatus.Unverified,
    authProvider = UserAuthProvider.Local,
    tickets = [],
    verifyEmailToken = '',
    forgotPasswordToken = ''
  }: {
    username?: string
    email: string
    password: string
    phoneNumber?: string
    dateOfBirth?: string | Date
    gender?: UserGender
    address?: string
    avatar?: string
    coverPhoto?: string
    role?: UserRole
    verify?: UserVerifyStatus
    authProvider?: UserAuthProvider
    tickets?: string[]
    verifyEmailToken?: string
    forgotPasswordToken?: string
  }) {
    this._id = new ObjectId()
    this.username = username
    this.email = email.toLowerCase().trim()
    this.password = password
    this.phoneNumber = phoneNumber
    this.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : undefined
    this.gender = gender
    this.address = address
    this.role = role
    this.avatar = avatar
    this.coverPhoto = coverPhoto
    this.verify = verify
    this.authProvider = authProvider
    this.tickets = tickets.map((ticket) => new ObjectId(ticket))
    this.verifyEmailToken = verifyEmailToken
    this.forgotPasswordToken = forgotPasswordToken
    this.createdAt = new Date()
    this.updatedAt = new Date()
  }
}
