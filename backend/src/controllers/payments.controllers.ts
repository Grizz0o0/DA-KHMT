import { ParamsDictionary } from 'express-serve-static-core'
import { NextFunction, Request, Response } from 'express'
import { OK, Created } from '~/responses/success.response'
import PaymentsService from '~/services/payments.services'
import {
  getListPaymentTypeQuery,
  getPaymentByIdSchema,
  paymentMoMoSchema,
  paymentMoMoSchemaType,
  updatePaymentSchema
} from '~/requestSchemas/payments.request'
import { PaymentStatus } from '~/constants/payments'
import { generateOrderId } from '~/utils/payment.utils'
import { PaymentMethod } from '~/constants/payments'
import { NotFoundError, UnauthorizedError } from '~/responses/error.response'
import databaseService from '~/services/database.services'
import { convertToObjectId } from '~/utils/mongo.utils'
class PaymentsController {
  paymentMoMo = async (req: Request, res: Response) => {
    const booking = await databaseService.bookings.findOne({ _id: convertToObjectId(req.body.bookingId) })
    if (!booking) throw new NotFoundError('Booking not found')
    const userId = req.user?.userId
    if (!userId) throw new UnauthorizedError('Missing userId in header')

    const orderId = generateOrderId()
    const paymentBody = paymentMoMoSchema.parse({
      ...req.body,
      orderId,
      paymentMethod: PaymentMethod.MOMO,
      amount: booking.totalPrice
    })

    await PaymentsService.createPayment({ payload: paymentBody, userId })
    const momoRes = await PaymentsService.paymentMoMo(paymentBody)
    new OK({
      message: 'MoMo payment link created',
      metadata: momoRes
    }).send(res)
  }

  paymentMoMoIpn = async (req: Request, res: Response) => {
    const result = await PaymentsService.paymentMoMoIpn(req.body)
    new OK({
      message: 'MoMo IPN handled',
      metadata: result
    }).send(res)
  }

  updatePaymentStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resultParams = updatePaymentSchema.params.parse(req.params)
      const resultBody = updatePaymentSchema.body.parse(req.body)

      const payment = await PaymentsService.updatePaymentStatus(resultParams.paymentId, resultBody.status)
      new OK({
        message: 'Update payment status successfully',
        metadata: payment
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  getListPayments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { payments, pagination } = await PaymentsService.getListPayments(req.query as getListPaymentTypeQuery)
      new OK({
        message: 'Get list payments successfully',
        metadata: { payments, pagination }
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  getPaymentById = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    try {
      const resultParams = getPaymentByIdSchema.params.parse(req.params)
      const payment = await PaymentsService.getPaymentById(resultParams.paymentId)
      new OK({
        message: 'Get Payment By Id success',
        metadata: { payment }
      }).send(res)
    } catch (error) {
      next(error)
    }
  }
}

export default new PaymentsController()
