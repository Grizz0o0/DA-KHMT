import { Router } from 'express'
import userController from '~/controllers/users.controllers'
import { asyncHandler } from '~/helper/asyncHandler'
import { authentication, authenticationV2 } from '~/middlewares/users.middlewares'
import {
  loginValidator,
  registerValidator,
  logoutValidator,
  refreshTokenValidator,
  forgotPassWordValidator,
  verifyForgotPassWordValidator,
  resetPasswordValidator,
  changePasswordValidator,
  deleteUserValidator,
  getUserByIdValidator,
  updateMeValidator
} from '~/validators/user.validator'
import { validate } from '~/middlewares/validate.middleware'
import { sanitizeRequest } from '~/middlewares/common.middlewares'
import { UpdateMeReqBody } from '~/models/requests/users.request'
const userRouter = Router()

userRouter.post('/register', validate(registerValidator), asyncHandler(userController.register))
userRouter.get('/oauth/google', asyncHandler(userController.oAuthGoogle))
userRouter.post('/login', validate(loginValidator), asyncHandler(userController.login))
userRouter.post('/forgot-password', validate(forgotPassWordValidator), asyncHandler(userController.forgotPassword))
userRouter.post(
  '/verify-forgot-password',
  validate(verifyForgotPassWordValidator),
  asyncHandler(userController.verifyForgotPassword)
)
userRouter.post('/reset-password', validate(resetPasswordValidator), asyncHandler(userController.resetPassword))
userRouter.post(
  '/refresh-token',
  validate(refreshTokenValidator),
  authenticationV2,
  asyncHandler(userController.handlerRefreshToken)
)
userRouter.get('', asyncHandler(userController.getAllUsers))
userRouter.get('/:id', validate(getUserByIdValidator), asyncHandler(userController.getUserById))

userRouter.use(authentication)

userRouter.post('/logout', validate(logoutValidator), asyncHandler(userController.logout))
userRouter.post('/change-password', validate(changePasswordValidator), asyncHandler(userController.changePassword))
userRouter.delete('/:id', validate(deleteUserValidator), asyncHandler(userController.deleteUser))
userRouter.patch(
  '/:id',
  validate(updateMeValidator),
  sanitizeRequest<UpdateMeReqBody>([
    'username',
    'phoneNumber',
    'email',
    'gender',
    'dateOfBirth',
    'address',
    'coverPhoto',
    'avatar'
  ]),
  asyncHandler(userController.updateUser)
)

export default userRouter
