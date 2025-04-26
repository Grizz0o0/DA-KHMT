import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response } from 'express'
import { OK, Created } from '~/responses/success.response'
import PaymentsService from '~/services/payments.services'
import { paymentMoMoSchema, paymentMoMoSchemaType } from '~/requestSchemas/payments.request'
import { PaymentStatus } from '~/constants/payments'
import { generateOrderId } from '~/utils/payment.utils'
import { PaymentMethod } from '~/constants/payments'
import { NotFoundError } from '~/responses/error.response'
import databaseService from '~/services/database.services'
import { convertToObjectId } from '~/utils/mongo.utils'
class PaymentsController {
  public static async paymentMoMo(req: Request, res: Response) {
    const booking = await databaseService.bookings.findOne({ _id: convertToObjectId(req.body.bookingId) })
    if (!booking) throw new NotFoundError('Booking not found')

    const orderId = generateOrderId()
    const paymentBody = paymentMoMoSchema.parse({
      ...req.body,
      orderId,
      paymentMethod: PaymentMethod.MOMO,
      amount: booking.totalPrice
    })

    await PaymentsService.createPayment(paymentBody)
    const momoRes = await PaymentsService.paymentMoMo(paymentBody)
    new OK({
      message: 'MoMo payment link created',
      metadata: momoRes
    }).send(res)
  }

  public static async paymentMoMoIpn(req: Request, res: Response) {
    const result = await PaymentsService.paymentMoMoIpn(req.body)
    new OK({
      message: 'MoMo IPN handled',
      metadata: result
    }).send(res)
  }
}

export default PaymentsController
