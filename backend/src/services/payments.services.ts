import { ObjectId } from 'mongodb'
import 'dotenv/config'
import databaseService from '~/services/database.services'
import axios from 'axios'
import { generateSignature } from '~/utils/payment.utils'
import { NotFoundError } from '~/responses/error.response'
import { MomoPaymentConfirmResponse, MomoPaymentInitResponse } from '~/types/payments.types'
import { PaymentMethod, PaymentStatus } from '~/constants/payments'
import { paymentMoMoSchemaType } from '~/requestSchemas/payments.request'
import { momoConfig } from '~/config/payment.config'
import { buildRawSignature } from '~/utils/payment.utils'
import { paymentSchema } from '~/models/payments.model'
class PaymentsService {
  static async createPayment(payload: paymentMoMoSchemaType) {
    const parsedPayment = paymentSchema.parse(payload)
    const payment = await databaseService.payments.insertOne(parsedPayment)
    return payment
  }

  static async paymentMoMo(paymentBody: paymentMoMoSchemaType) {
    const { accessKey, secretKey, partnerCode, redirectUrl, ipnUrl, hostname, path, partnerName, storeId } = momoConfig
    const { amount, lang, orderId, orderInfo } = paymentBody

    if (!accessKey || !secretKey) {
      throw new NotFoundError('MOMO_ACCESS_KEY or MOMO_SECRET_KEY is not defined')
    }
    const requestType = 'payWithMethod'
    const requestId = orderId
    const extraData = ''
    const autoCapture = true
    const orderGroupId = ''
    const rawSignature = buildRawSignature({
      accessKey,
      amount,
      extraData,
      ipnUrl,
      orderId,
      orderInfo,
      partnerCode,
      redirectUrl,
      requestId,
      requestType
    })
    const signature = generateSignature({ rawSignature, secretKey })

    const requestBody = JSON.stringify({
      partnerCode,
      partnerName, // Tên đối tác
      storeId, // Mã cửa hàng
      requestId, // Mã yêu cầu
      amount, // Số tiền min 1.000 VND, max 20.000.000 VND
      orderId, // Mã đơn hàng
      orderInfo, // Thông tin đơn hàng
      redirectUrl, // URL chuyển hướng
      ipnUrl, // URL thông báo
      lang, // Ngôn ngữ
      requestType, // Loại yêu cầu
      extraData, // Dữ liệu bổ sung
      signature, // Chữ ký
      autoCapture, // Tự động thu hộ
      orderGroupId // Mã nhóm đơn hàng
    })
    const options = { method: 'POST', headers: { 'Content-Type': 'application/json' }, data: requestBody }
    const { data } = await axios.post(`https://${hostname}${path}`, requestBody, options)

    return data as MomoPaymentInitResponse
  }

  static async paymentMoMoIpn(body: MomoPaymentConfirmResponse) {
    const { orderId, resultCode, transId, responseTime, message } = body
    const newStatus = resultCode === 0 ? PaymentStatus.SUCCESS : PaymentStatus.FAILED

    const payment = await databaseService.payments.findOne({ orderId })
    if (!payment) throw new NotFoundError('Payment not found')

    const updated = await databaseService.payments.updateOne(
      { orderId },
      {
        $set: {
          status: newStatus,
          transactionId: transId.toString(),
          paymentDate: new Date(responseTime)
        },
        $currentDate: { updatedAt: true }
      }
    )

    if (updated.modifiedCount === 0) throw new Error('Failed to update payment status')

    return {
      message,
      status: newStatus
    }
  }
}

export default PaymentsService
