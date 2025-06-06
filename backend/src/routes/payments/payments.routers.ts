import express from 'express'
import { asyncHandler } from '~/helper/asyncHandler'
import paymentsController from '~/controllers/payments.controllers'
import { validateRequest } from '~/middlewares/validate.middleware'
import { authentication, authorizeRoles } from '~/middlewares/auth.middlewares'
import {
  getPaymentByIdSchema,
  updatePaymentSchema,
  getListPaymentSchema,
  paymentMoMoSchema
} from '~/requestSchemas/payments.request'
import { authenticationSchema } from '~/requestSchemas/users.request'
import { UserRole } from '~/constants/users'

const paymentsRouter = express.Router()

// Public route - IPN callback từ MoMo
paymentsRouter.post('/momo/ipn', asyncHandler(paymentsController.paymentMoMoIpn))

// Authenticated routes
paymentsRouter.use(validateRequest({ headers: authenticationSchema }), authentication)

// Tạo thanh toán qua MoMo
paymentsRouter.post('/momo', validateRequest({ body: paymentMoMoSchema }), asyncHandler(paymentsController.paymentMoMo))

paymentsRouter.use(authorizeRoles(UserRole.ADMIN))
// Cập nhật trạng thái thanh toán
paymentsRouter.patch(
  '/:paymentId/status',
  validateRequest(updatePaymentSchema),
  asyncHandler(paymentsController.updatePaymentStatus)
)

// Lấy danh sách thanh toán (filter, pagination)
paymentsRouter.get(
  '/',
  validateRequest({ query: getListPaymentSchema.query }),
  asyncHandler(paymentsController.getListPayments)
)

// Lấy chi tiết thanh toán theo ID
paymentsRouter.get(
  '/:paymentId',
  validateRequest(getPaymentByIdSchema),
  asyncHandler(paymentsController.getPaymentById)
)

export default paymentsRouter
