import { ObjectId } from 'mongodb'
import 'dotenv/config'
import databaseService from '~/services/database.services'
import axios from 'axios'
import { generateSignature } from '~/utils/payment.utils'
import { BadRequestError, NotFoundError } from '~/responses/error.response'
import { MomoPaymentConfirmResponse, MomoPaymentInitResponse } from '~/types/payments.types'
import { PaymentMethod, PaymentStatus } from '~/constants/payments'
import {
  getListPaymentSchema,
  getListPaymentTypeQuery,
  getPaymentByIdSchema,
  paymentMoMoSchemaType
} from '~/requestSchemas/payments.request'
import { momoConfig } from '~/config/payment.config'
import { buildRawSignature } from '~/utils/payment.utils'
import { paymentSchema } from '~/models/payments.model'
import { getSelectData, omitInfoData } from '~/utils/object.utils'
import { createPagination } from '~/responses/success.response'
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

  static async updatePaymentStatus(paymentId: ObjectId, status: PaymentStatus) {
    const validStatuses = Object.values(PaymentStatus)
    if (!validStatuses.includes(status)) {
      throw new BadRequestError('Trạng thái thanh toán không hợp lệ')
    }

    const result = await databaseService.payments.findOneAndUpdate(
      { _id: paymentId },
      { $set: { status }, $currentDate: { updatedAt: true } },
      { returnDocument: 'after' }
    )

    if (!result) throw new NotFoundError('Không tìm thấy thanh toán')

    return {
      message: 'Cập nhật trạng thái thanh toán thành công',
      metadata: {
        payment: result
      }
    }
  }

  static async getListPayments({
    limit = 10,
    page = 1,
    order = 'asc',
    select = ['bookingId', 'userId', 'orderId', 'amount', 'paymentMethod', 'status', 'transactionId']
  }: getListPaymentTypeQuery) {
    const validatedQuery = getListPaymentSchema.query.parse({
      limit,
      page,
      order,
      select
    })

    const skip = ((validatedQuery.page ?? 1) - 1) * (validatedQuery.limit ?? 10)
    const sortField = 'amount'
    const sortBy: { [key: string]: 1 | -1 } = { [sortField]: validatedQuery.order === 'asc' ? 1 : -1 }
    const totalItems = await databaseService.payments.countDocuments({})

    const payments = await databaseService.payments
      .find()
      .sort(sortBy)
      .skip(skip)
      .project(getSelectData(validatedQuery.select ?? []))
      .limit(validatedQuery.limit ?? 10)
      .toArray()

    const pagination = createPagination(validatedQuery.page ?? 1, validatedQuery.limit ?? 10, totalItems)
    return { payments, pagination }
  }

  static async getPaymentById(id: ObjectId) {
    const payment = await databaseService.payments.findOne({ _id: id })
    if (!payment) throw new NotFoundError('Không tìm thấy thanh toán')
    return omitInfoData({ fields: ['createdAt', 'updatedAt'], object: payment })
  }
}

export default PaymentsService
