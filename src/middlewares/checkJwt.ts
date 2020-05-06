import { Request, Response, NextFunction } from 'express'
import * as jwt from 'jsonwebtoken'

export const checkJwt = (req: Request, res: Response, next: NextFunction) => {
	const authorization = req.headers['authorization']

	if (!authorization) return res.status(401).json({ tokenError: 'No token provided' })

	const parts = authorization.split(' ')

	if (!(parts.length === 2)) return res.status(401).json({ tokenError: 'Token error' })

	const [schema, token] = parts

	if (!/^Bearer$/i.test(schema)) return res.status(401).json({ tokenError: 'Token malformatted' })

	jwt.verify(token, <string>process.env.JWT_SECRET, (err, jwtPayload: any) => {
		if (err) return res.status(401).json({ tokenError: err.message })

		if (jwtPayload.iss !== process.env.JWT_NAME || jwtPayload.sub === undefined)
            return res.status(401).json({ tokenError: 'PayLoad broken' })

		res.locals.jwtPayload = jwtPayload

		return next()
	})
}