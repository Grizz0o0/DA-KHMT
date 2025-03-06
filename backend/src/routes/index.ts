'use strict'
import { Router } from 'express'
import UserRouter from '~/routes/users/users.routers'
const router = Router()
router.get('/', (req, res) => {
  return res.status(200).json({
    message: 'Hello world'
  })
})
router.use('/v1/api/user', UserRouter)

export default router
