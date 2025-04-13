import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  changePasswordReqBodyType,
  deleteUserReqParamsType,
  forgotPasswordReqBodyType,
  getUserByIdReqParamsType,
  loginReqBodyType,
  registerReqBodyType,
  resetPasswordReqBodyType,
  updateMeReqBodyType,
  verifyForgotPasswordReqBodyType
} from '~/requestSchemas/users.request'
import { Created, OK, SuccessResponse } from '~/responses/success.response'
import userService from '~/services/users.services'
import { UnauthorizedError } from '~/responses/error.response'

class UserController {
  register = async (req: Request<ParamsDictionary, any, registerReqBodyType>, res: Response, next: NextFunction) => {
    try {
      const result = await userService.register(req.body)
      new Created({
        message: 'Register success',
        metadata: result
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  oAuthGoogle = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    try {
      const { userId, accessToken, refreshToken } = await userService.oAuthGoogle(req.query.code as string)
      // Chuyển hướng về client với accessToken và refreshToken
      return res.redirect(
        ` http://localhost:3052/login/oauth?userId=${userId}&access_token=${accessToken}&refresh_token=${refreshToken}`
      )
    } catch (error) {
      next(error)
    }
  }

  login = async (req: Request<ParamsDictionary, any, loginReqBodyType>, res: Response, next: NextFunction) => {
    try {
      const result = await userService.login(req.body)
      new SuccessResponse({
        message: 'Login success',
        metadata: result
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  logout = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    try {
      const result = await userService.logout(req?.keyStore)
      new OK({
        message: 'Logout success',
        metadata: result
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  handlerRefreshToken = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    try {
      const result = await userService.handlerRefreshToken(req?.refreshToken as string)
      new OK({
        message: 'Refresh token success',
        metadata: result
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  forgotPassword = async (
    req: Request<ParamsDictionary, any, forgotPasswordReqBodyType>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await userService.forgotPassword(req.body)
      new OK({
        message: 'Forgot password success',
        metadata: result
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  verifyForgotPassword = async (
    req: Request<ParamsDictionary, any, verifyForgotPasswordReqBodyType>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await userService.verifyForgotPassword(req.body)
      new OK({
        message: 'Verify token success',
        metadata: result
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  resetPassword = async (
    req: Request<ParamsDictionary, any, resetPasswordReqBodyType>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await userService.resetPassword(req.body)
      new OK({
        message: 'Reset password success',
        metadata: result
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  changePassword = async (
    req: Request<ParamsDictionary, any, changePasswordReqBodyType>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { password, newPassword, confirm_newPassword } = req.body
      const userId = req.user?.userId
      if (!userId) {
        throw new UnauthorizedError('User authentication required')
      }
      const result = await userService.changePassword(userId, { password, newPassword, confirm_newPassword })

      new OK({
        message: 'Change password success',
        metadata: result
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  deleteUser = async (
    req: Request<ParamsDictionary, any, deleteUserReqParamsType>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await userService.deleteUser(req.params.id)
      new OK({
        message: 'Delete success',
        metadata: { deletedUser: result }
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  updateMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId

      if (!userId) {
        throw new UnauthorizedError('User authentication required')
      }

      const result = await userService.updateMe(userId, req.body)

      new OK({
        message: 'Update profile success',
        metadata: result
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  getUserById = async (
    req: Request<ParamsDictionary, any, getUserByIdReqParamsType>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = await userService.getUserById(req.params.id)
      new OK({
        message: 'Get user by ID success',
        metadata: { user }
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  getAllUsers = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    try {
      const users = await userService.getAllUsers()
      new OK({
        message: 'Get all users success',
        metadata: { users }
      }).send(res)
    } catch (error) {
      next(error)
    }
  }
}

export default new UserController()
