import express from 'express'
import { asyncHandler } from '~/helper/asyncHandler'
import PaymentsController from '~/controllers/payments.controllers'
import { validateRequest } from '~/middlewares/validate.middleware'
import { authentication } from '~/middlewares/auth.middlewares'
import { authenticationSchema } from '~/requestSchemas/users.request'

const paymentsRouter = express.Router()

// Handle MoMo IPN
paymentsRouter.post('/momo/ipn', asyncHandler(PaymentsController.paymentMoMoIpn))

paymentsRouter.use(validateRequest({ headers: authenticationSchema }), authentication)

// Create a payment
paymentsRouter.post('/momo', asyncHandler(PaymentsController.paymentMoMo))

export default paymentsRouter
