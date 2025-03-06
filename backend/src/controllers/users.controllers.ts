import { Request, Response } from 'express'
import databaseService from '~/services/database.services'

export const loginController = (req: Request, res: Response) => {
  return res.json({ message: 'Login successful' })
}

export const registerController = (req: Request, res: Response) => {
  const { email, password } = req.body
  databaseService.users.insertOne({
    email,
    password
  })
  return res.json({ message: 'Register successful' })
}
