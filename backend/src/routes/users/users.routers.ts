import { Router } from 'express'
import userController from '~/controllers/users.controllers'
import { asyncHandler } from '~/helper/asyncHandler'
import { authentication, authenticationV2, authorizeRoles } from '~/middlewares/auth.middlewares'
import { validateRequest } from '~/middlewares/validate.middleware'
import {
  loginSchema,
  registerSchema,
  authenticationV2Schema,
  authenticationSchema,
  changePasswordSchema,
  deleteUserSchema,
  getUserByIdSchema,
  resetPasswordSchema,
  verifyForgotPasswordSchema,
  forgotPasswordSchema,
  updateMeSchema
} from '~/requestSchemas/users.request'
import { UserRole } from '~/constants/users'
const userRouter = Router()

userRouter.post('/register', validateRequest({ body: registerSchema.body }), asyncHandler(userController.register))
userRouter.post('/login', validateRequest({ body: loginSchema.body }), asyncHandler(userController.login))
userRouter.get('/oauth/google', asyncHandler(userController.oAuthGoogle))
userRouter.post(
  '/forgot-password',
  validateRequest({ body: forgotPasswordSchema.body }),
  asyncHandler(userController.forgotPassword)
)
userRouter.post(
  '/verify-forgot-password',
  validateRequest({ body: verifyForgotPasswordSchema.body }),
  asyncHandler(userController.verifyForgotPassword)
)
userRouter.post(
  '/reset-password',
  validateRequest({ body: resetPasswordSchema.body }),
  asyncHandler(userController.resetPassword)
)
userRouter.post(
  '/refresh-token',
  validateRequest({ headers: authenticationV2Schema }),
  authenticationV2,
  asyncHandler(userController.handlerRefreshToken)
)
userRouter.get('', asyncHandler(userController.getAllUsers))
userRouter.get(
  '/me',
  validateRequest({ headers: authenticationSchema }),
  authentication,
  asyncHandler(userController.getMe)
)
userRouter.get('/:id', validateRequest({ params: getUserByIdSchema.params }), asyncHandler(userController.getUserById))

userRouter.use(validateRequest({ headers: authenticationSchema }), authentication)

userRouter.post('/logout', asyncHandler(userController.logout))
userRouter.post(
  '/change-password',
  validateRequest({ body: changePasswordSchema.body }),
  asyncHandler(userController.changePassword)
)
userRouter.delete(
  '/:id',
  validateRequest({ params: deleteUserSchema.params }),
  authorizeRoles(UserRole.ADMIN),
  asyncHandler(userController.deleteUser)
)
userRouter.patch('/', validateRequest({ body: updateMeSchema.body }), asyncHandler(userController.updateMe))

export default userRouter
