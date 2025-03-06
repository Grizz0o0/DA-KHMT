import { Router } from 'express'
import { loginController, registerController } from '~/controllers/users.controllers'
import { loginValidator } from '~/middlewares/users.middlewares'
const UserRouter = Router()

UserRouter.post('/login', loginValidator, loginController)
UserRouter.post('/register', registerController)

export default UserRouter
