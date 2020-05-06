import { Router } from 'express'

import UserController from './controller/UserController'
import AuthController from './controller/AuthController'

import { checkJwt } from './middlewares/checkJwt'

const routes = Router()

routes.get('/', (req, res) => res.json({ __: '__' }))

routes.get('/users', checkJwt, UserController.all)
routes.get('/users/:id', checkJwt, UserController.one)
routes.put('/users', checkJwt, UserController.update)
routes.delete('/users/:id', checkJwt, UserController.remove)

routes.post('/auth', AuthController.login)
routes.post('/auth/register', AuthController.register)
routes.post('/auth/forgot-password', AuthController.forgot_password)
routes.post('/auth/reset-password', AuthController.reset_password)
routes.post('/auth/logout', AuthController.logout)

export default routes