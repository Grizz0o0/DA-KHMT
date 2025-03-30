export enum UserVerifyStatus {
  Unverified,
  Verified,
  Banned
}

export enum UserRole {
  Customer = 'customer',
  Staff = 'staff',
  Admin = 'admin'
}

export enum UserGender {
  Male = 'male',
  Female = 'female',
  Other = 'other'
}

export enum UserAuthProvider {
  Local = 'local',
  Google = 'google',
  Facebook = 'facebook'
}
