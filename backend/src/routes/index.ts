'use strict'
import { Router } from 'express'
import aircraftRouter from '~/routes/aircrafts/aircrafts.routers'
import airlinesRouter from '~/routes/airlines/airlines.routers'
import airportsRouter from '~/routes/airports/airports.routers'
import bookingsRouter from '~/routes/bookings/bookings.routers'
import flightsRouter from '~/routes/flights/flights.routers'
import mediasRouter from '~/routes/media/medias.routers'
import userRouter from '~/routes/users/users.routers'
import ticketsRouter from '~/routes/tickets/tickets.routers'
import paymentsRouter from '~/routes/payments/payments.routers'
import promoCodesRouter from '~/routes/promoCodes/promoCodes.routers'
const router = Router()
router.get('/', (req, res) => {
  res.status(200).json({
    message: 'Hello world'
  })
})
router.use('/v1/api/users', userRouter)
router.use('/v1/api/medias', mediasRouter)
router.use('/v1/api/airlines', airlinesRouter)
router.use('/v1/api/airports', airportsRouter)
router.use('/v1/api/aircrafts', aircraftRouter)
router.use('/v1/api/flights', flightsRouter)
router.use('/v1/api/bookings', bookingsRouter)
router.use('/v1/api/tickets', ticketsRouter)
router.use('/v1/api/payments', paymentsRouter)
router.use('/v1/api/promo-codes', promoCodesRouter)
export default router
