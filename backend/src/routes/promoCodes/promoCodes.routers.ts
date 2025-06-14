import express from 'express'
import { asyncHandler } from '~/helper/asyncHandler'
import PromoCodesController from '~/controllers/promoCodes.controllers'
import { validateRequest } from '~/middlewares/validate.middleware'
import {
  createPromoCodeSchema,
  getPromoCodeByIdSchema,
  getPromoCodeByCodeSchema,
  updatePromoCodeSchema,
  validatePromoCodeSchema,
  usePromoCodeSchema,
  deactivatePromoCodeSchema,
  activatePromoCodeSchema
} from '~/requestSchemas/promoCodes.request'
import { authenticationSchema } from '~/requestSchemas/users.request'
import { authentication, authorizeRoles } from '~/middlewares/auth.middlewares'
import { UserRole } from '~/constants/users'

const promoCodesRouter = express.Router()
promoCodesRouter.use(validateRequest({ headers: authenticationSchema }), authentication)
promoCodesRouter.post(
  '/validate/:code',
  validateRequest({ params: validatePromoCodeSchema.params }),
  asyncHandler(PromoCodesController.validatePromoCode)
)

promoCodesRouter.post(
  '/use/:code',
  validateRequest({ params: usePromoCodeSchema.params }),
  asyncHandler(PromoCodesController.usePromoCode)
)
promoCodesRouter.get('/', asyncHandler(PromoCodesController.getListPromoCodes))

promoCodesRouter.use(authorizeRoles(UserRole.ADMIN))

promoCodesRouter.post(
  '/',
  validateRequest({ body: createPromoCodeSchema.body }),
  asyncHandler(PromoCodesController.createPromoCode)
)

promoCodesRouter.patch(
  '/:id',
  validateRequest({ body: updatePromoCodeSchema.body, params: updatePromoCodeSchema.params }),
  asyncHandler(PromoCodesController.updatePromoCode)
)

promoCodesRouter.delete(
  '/:id',
  validateRequest({ params: deactivatePromoCodeSchema.params }),
  asyncHandler(PromoCodesController.deactivatePromoCode)
)

promoCodesRouter.post(
  '/activate/:id',
  validateRequest({ params: activatePromoCodeSchema.params }),
  asyncHandler(PromoCodesController.activatePromoCode)
)

promoCodesRouter.get(
  '/:id',
  validateRequest({ params: getPromoCodeByIdSchema.params }),
  asyncHandler(PromoCodesController.getPromoCodeById)
)

promoCodesRouter.get(
  '/code/:code',
  validateRequest({ params: getPromoCodeByCodeSchema.params }),
  asyncHandler(PromoCodesController.getPromoCodeByCode)
)

export default promoCodesRouter
