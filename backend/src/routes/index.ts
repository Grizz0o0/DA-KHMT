'use strict'
import { Router } from 'express'
import mediasRouter from '~/routes/media/medias.routers'
import userRouter from '~/routes/user/users.routers'
const router = Router()
router.get('/', (req, res) => {
  res.status(200).json({
    message: 'Hello world'
  })
})
router.use('/v1/api/users', userRouter)
router.use('/v1/api/medias', mediasRouter)

export default router
