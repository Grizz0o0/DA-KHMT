import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response, NextFunction } from 'express'
import { OK, Created } from '~/responses/success.response'
import PromoCodesService from '~/services/promoCodes.services'
import {
  createPromoCodeSchema,
  CreatePromoCodeType,
  getPromoCodeByIdSchema,
  updatePromoCodeSchema,
  getPromoCodeByCodeSchema,
  usePromoCodeSchema,
  validatePromoCodeSchema,
  deactivatePromoCodeSchema,
  getListPromoCodeSchema,
  activatePromoCodeSchema
} from '~/requestSchemas/promoCodes.request'

class PromoCodesController {
  public static async createPromoCode(req: Request, res: Response) {
    const payload = createPromoCodeSchema.body.parse(req.body)
    const result = await PromoCodesService.createPromoCode(payload)
    new Created({
      message: 'Tạo mã ưu đãi thành công',
      metadata: result
    }).send(res)
  }

  public static async updatePromoCode(req: Request, res: Response) {
    const payload = updatePromoCodeSchema.body.parse(req.body)
    const { id } = updatePromoCodeSchema.params.parse(req.params)
    const result = await PromoCodesService.updatePromoCode(id, payload)
    new OK({
      message: 'Cập nhật mã ưu đãi thành công',
      metadata: result
    }).send(res)
  }

  public static async deactivatePromoCode(req: Request, res: Response) {
    const { id } = deactivatePromoCodeSchema.params.parse(req.params)
    const result = await PromoCodesService.deactivatePromoCode(id)
    new OK({
      message: 'Tắt mã ưu đãi thành công',
      metadata: result
    }).send(res)
  }

  public static async activatePromoCode(req: Request, res: Response) {
    const { id } = activatePromoCodeSchema.params.parse(req.params)
    const result = await PromoCodesService.activatePromoCode(id)
    new OK({
      message: 'Bật mã ưu đãi thành công',
      metadata: result
    }).send(res)
  }

  public static async getListPromoCodes(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, order, sortBy } = getListPromoCodeSchema.query.parse(req.query)
      const { promocodes, pagination } = await PromoCodesService.getListPromoCode({ page, limit, order, sortBy })
      new OK({
        message: 'Get list promo codes successfully',
        metadata: { promocodes, pagination }
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  public static async getPromoCodeById(req: Request, res: Response) {
    const { id } = getPromoCodeByIdSchema.params.parse(req.params)
    const result = await PromoCodesService.getPromoCodeById(id)
    new OK({
      message: 'Lấy mã ưu đãi thành công',
      metadata: result
    }).send(res)
  }

  public static async getPromoCodeByCode(req: Request, res: Response) {
    const { code } = getPromoCodeByCodeSchema.params.parse(req.params)
    const result = await PromoCodesService.getPromoCodeByCode(code)
    new OK({
      message: 'Lấy mã ưu đãi thành công',
      metadata: result
    }).send(res)
  }

  public static async usePromoCode(req: Request, res: Response) {
    const { code } = usePromoCodeSchema.params.parse(req.params)
    const result = await PromoCodesService.usePromoCode(code)
    new OK({
      message: 'Sử dụng mã ưu đãi thành công',
      metadata: result
    }).send(res)
  }

  public static async validatePromoCode(req: Request, res: Response) {
    const { code } = validatePromoCodeSchema.params.parse(req.params)
    console.log(code)
    const result = await PromoCodesService.validatePromoCode(code)
    new OK({
      message: 'Kiểm tra mã ưu đãi thành công',
      metadata: result
    }).send(res)
  }
}

export default PromoCodesController
