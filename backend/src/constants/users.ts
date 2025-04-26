export enum UserVerifyStatus {
  Unverified,
  Verified,
  Banned
}
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  STAFF = 'staff'
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
