import 'dotenv/config'
import databaseService from '~/services/database.services'
import bcrypt from 'bcrypt'
import { UserRole } from '~/constants/users'
import { userSchema } from '~/models/users.model'

export const initAdminAccount = async () => {
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminEmail || !adminPassword) return

  const existingAdmin = await databaseService.users.findOne({ email: adminEmail })
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10)
    const parseUser = userSchema.parse({
      email: adminEmail,
      password: hashedPassword,
      role: UserRole.ADMIN,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    await databaseService.users.insertOne(parseUser)
    console.log('Admin account initialized')
  } else {
    console.log('Admin already exists')
  }
}
