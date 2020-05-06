import 'dotenv/config'
import 'reflect-metadata'
import { createConnection } from 'typeorm'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import bodyParser from 'body-parser'
import rateLimit from 'express-rate-limit'

import routes from './routes'

createConnection().then(connection => {
	const app = express()
	const port = process.env.PORT || 3333

	const limiter = rateLimit({
		windowMs: 1 * 60 * 1000,
		max: 100
	})

	app.disable('x-powered-by')

	app.use(cors())
	app.use(helmet())
	app.use(bodyParser.urlencoded({ extended: false }))
	app.use(bodyParser.json())

	app.use(limiter)

	app.use(routes)

	app.listen(port, () => console.log(`\n[SERVER] running on port ${port}\n`))
}).catch(error => console.log(error))