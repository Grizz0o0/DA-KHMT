import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  ChangePasswordReqBody,
  DeleteMeReqBody,
  ForgotPasswordReqBody,
  LoginReqBody,
  RegisterReqBody,
  ResetPasswordReqBody,
  UpdateMeReqBody,
  VerifyForgotPasswordReqBody
} from '~/models/requests/users.request'
import { Created, OK, SuccessResponse } from '~/responses/success.response'
import userService from '~/services/users.services'

class UserController {
  register = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response, next: NextFunction) => {
    new Created({
      message: 'Register success',
      metadata: await userService.register(req.body)
    }).send(res)
  }

  oAuthGoogle = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    try {
      const { userId, accessToken, refreshToken } = await userService.oAuthGoogle(req.query.code as string)
      // Chuyển hướng về client với accessToken và refreshToken
      return res.redirect(
        `http://localhost:3000/login/oauth?userId=${userId}&access_token=${accessToken}&refresh_token=${refreshToken}`
      )
    } catch (error) {
      next(error)
    }
  }

  login = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response, next: NextFunction) => {
    new SuccessResponse({
      message: 'Login success',
      metadata: await userService.login(req.body)
    }).send(res)
  }

  logout = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    new OK({
      message: 'Logout success',
      metadata: await userService.logout(req?.keyStore)
    }).send(res)
  }

  handlerRefreshToken = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    new OK({
      message: 'Refresh token success',
      metadata: await userService.handlerRefreshToken(req?.refreshToken as string)
    }).send(res)
  }

  forgotPassword = async (
    req: Request<ParamsDictionary, any, ForgotPasswordReqBody>,
    res: Response,
    next: NextFunction
  ) => {
    new OK({
      message: 'Forgot password success',
      metadata: await userService.forgotPassWord(req.body)
    }).send(res)
  }

  verifyForgotPassword = async (
    req: Request<ParamsDictionary, any, VerifyForgotPasswordReqBody>,
    res: Response,
    next: NextFunction
  ) => {
    new OK({
      message: 'Verify forgot password success',
      metadata: await userService.verifyForgotPassWord(req.body)
    }).send(res)
  }

  resetPassword = async (
    req: Request<ParamsDictionary, any, ResetPasswordReqBody>,
    res: Response,
    next: NextFunction
  ) => {
    new OK({
      message: 'Reset password success',
      metadata: await userService.resetPassWord({
        password: req.body.password,
        forgotPasswordToken: req.body.forgotPasswordToken
      })
    }).send(res)
  }

  changePassword = async (
    req: Request<ParamsDictionary, any, ChangePasswordReqBody>,
    res: Response,
    next: NextFunction
  ) => {
    new OK({
      message: 'Change password success',
      metadata: await userService.changePassword({
        userId: req.user?.userId,
        password: req.body.password,
        newPassword: req.body.newPassword
      })
    }).send(res)
  }

  deleteUser = async (req: Request<ParamsDictionary, any, DeleteMeReqBody>, res: Response, next: NextFunction) => {
    new OK({
      message: 'Delete success',
      metadata: await userService.deleteUser(req.params.id)
    }).send(res)
  }

  updateUser = async (req: Request<ParamsDictionary, any, UpdateMeReqBody>, res: Response, next: NextFunction) => {
    new OK({
      message: 'Update success',
      metadata: await userService.updateUser({ payload: req.body, userId: req.user?.userId })
    }).send(res)
  }

  getUserById = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    new OK({
      message: 'getUserById success',
      metadata: await userService.getUserById(req.params.id)
    }).send(res)
  }

  getAllUsers = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    new OK({
      message: 'getAllUser success',
      metadata: await userService.getAllUsers()
    }).send(res)
  }
}

export default new UserController()
