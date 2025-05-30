import databaseService from '~/services/database.services'
import { promoSchema, PromoType } from '~/models/promoCodes.model'
import {
  CreatePromoCodeType,
  GetListPromoCodeType,
  UpdatePromoCodeType,
  getListPromoCodeSchema,
  updatePromoCodeSchema
} from '~/requestSchemas/promoCodes.request'
import { ObjectId } from 'mongodb'
import { BadRequestError, NotFoundError } from '~/responses/error.response'
import { createPagination } from '~/responses/success.response'
class PromoCodesService {
  public static async createPromoCode(payload: CreatePromoCodeType) {
    const validatedPayload = promoSchema.parse(payload)
    // Check if promo code already exists
    const existingPromo = await databaseService.promocodes.findOne({ code: validatedPayload.code })
    if (existingPromo) throw new BadRequestError('Mã ưu đãi đã tồn tại')

    const promoCode = await databaseService.promocodes.insertOne(validatedPayload)
    if (!promoCode) throw new NotFoundError('Không tạo được mã ưu đãi')
    return promoCode
  }

  static async getListPromoCode({ limit = 10, page = 1, order = 'asc', sortBy = 'code' }: GetListPromoCodeType) {
    const validatedQuery = getListPromoCodeSchema.query.parse({
      limit,
      page,
      order,
      sortBy
    })

    const skip = (validatedQuery.page - 1) * validatedQuery.limit
    const sortField = validatedQuery.sortBy
    const sortOrder = validatedQuery.order === 'asc' ? 1 : -1

    const totalItems = await databaseService.promocodes.countDocuments({ isActive: { $ne: false } })

    const promocodes = await databaseService.promocodes
      .find()
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(validatedQuery.limit)
      .toArray()

    const pagination = createPagination(validatedQuery.page, validatedQuery.limit, totalItems)
    return {
      promocodes,
      pagination
    }
  }

  public static async getPromoCodeById(id: ObjectId) {
    const promoCode = await databaseService.promocodes.findOne({ _id: id })
    if (!promoCode) throw new NotFoundError('Mã ưu đãi không tồn tại')
    return promoCode
  }

  public static async updatePromoCode(id: ObjectId, payload: UpdatePromoCodeType) {
    const validatedPayload = updatePromoCodeSchema.body.parse(payload)

    // Check if promo code exists
    const existingPromo = await databaseService.promocodes.findOne({ _id: id })
    if (!existingPromo) throw new NotFoundError('Mã ưu đãi không tồn tại')

    if ((validatedPayload.discountPercentage || validatedPayload.discountAmount) && existingPromo.usedCount > 0) {
      throw new BadRequestError('Không thể cập nhật giá trị giảm khi mã đã được sử dụng')
    }
    const result = await databaseService.promocodes.findOneAndUpdate(
      { _id: id },
      {
        $set: validatedPayload,
        $currentDate: { updatedAt: true }
      },
      { returnDocument: 'after' }
    )
    if (!result) throw new NotFoundError('Mã ưu đãi không tồn tại')
    return result
  }

  public static async deactivatePromoCode(id: ObjectId) {
    const existingPromo = await databaseService.promocodes.findOne({ _id: id })
    if (!existingPromo) throw new NotFoundError('Mã ưu đãi không tồn tại')
    if (existingPromo.usedCount > 0) throw new BadRequestError('Không thể tắt mã ưu đãi khi đã có lượt sử dụng')

    const result = await databaseService.promocodes.updateOne({ _id: id }, { $set: { isActive: false } })
    if (result.modifiedCount === 0) throw new BadRequestError('Không thể tắt mã ưu đãi')
    return result
  }

  public static async activatePromoCode(id: ObjectId) {
    const existingPromo = await databaseService.promocodes.findOne({ _id: id })
    if (!existingPromo) throw new NotFoundError('Mã ưu đãi không tồn tại')
    if (existingPromo.isActive === true) throw new BadRequestError('Mã ưu đãi đã được kích hoạt')

    const result = await databaseService.promocodes.updateOne({ _id: id }, { $set: { isActive: true } })
    if (result.modifiedCount === 0) throw new BadRequestError('Không thể kích hoạt mã ưu đãi')
    return result
  }

  public static async usePromoCode(code: string) {
    const now = new Date()
    const promo = await databaseService.promocodes.findOneAndUpdate(
      {
        code,
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
        $or: [{ maxUsage: { $exists: false } }, { $expr: { $lt: ['$usedCount', '$maxUsage'] } }]
      },
      {
        $inc: { usedCount: 1 },
        $set: { updatedAt: new Date() }
      },
      {
        returnDocument: 'after'
      }
    )
    if (!promo) throw new NotFoundError('Mã khuyến mãi không tồn tại, hết hạn hoặc đã hết lượt sử dụng')
    return promo
  }

  public static async validatePromoCode(code: string) {
    const now = new Date()
    const promo = await databaseService.promocodes.findOne({
      code,
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
      $or: [{ maxUsage: { $exists: false } }, { $expr: { $lt: ['$usedCount', '$maxUsage'] } }]
    })

    if (!promo) throw new NotFoundError('Mã khuyến mãi không hợp lệ hoặc đã hết hạn')
    return promo
  }

  public static async getPromoCodeByCode(code: string) {
    const promoCode = await databaseService.promocodes.findOne({ code })
    if (!promoCode) throw new NotFoundError('Mã ưu đãi không tồn tại')
    return promoCode
  }
}

export default PromoCodesService
