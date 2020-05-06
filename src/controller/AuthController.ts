import { Request, Response } from 'express'
import { getRepository } from 'typeorm'
import { User } from '../entity/User'
import { validate } from 'class-validator'
import { generateJwT } from '../services/generateJwT'
import { sendMail } from '../services/mailer'
import crypto from 'crypto'

export default {
    async login(req: Request, res: Response) {
        let { email, password } = req.body

        if (!(email && password))
            return res.status(400).send()

        const userRepository = getRepository(User)

        let user: User

        try {
            email = String(email).toLowerCase()
            user = await userRepository.findOneOrFail({ where: { email }, select: ['id', 'password'] })
        } catch (error) {
            return res.status(401).send()
        }

        if (!user.checkIfUnencryptedPasswordIsValid(password))
            return res.status(401).send()

        return res.json({ token: await generateJwT(user.id) })
    },

    async register(req: Request, res: Response) {
        const { name, email, password, password_confirmation } = req.body

        if (password !== password_confirmation)
            return res.status(400).json({ property: 'password_confirmation', message: 'passwords must match', error: true })

        let user = new User()

        user.name = name
        user.email = String(email).toLowerCase()
        user.password = password

        const errors = await validate(user, { validationError: { target: false } })

        if (errors.length > 0)
            return res.status(400).json({ property: errors[0].property, message: errors[0].constraints[Object.keys(errors[0].constraints)[0]], error: true })

        user.hashPassword()

        const userRepository = getRepository(User)

        try {
            const result = await userRepository.save(user)

            return res.json({ ...result })
        } catch (error) {
            return res.status(409).json({ property: 'email', message: 'email already in use', error: true })
        }
    },

    async forgot_password(req: Request, res: Response) {
        const userRepository = getRepository(User)
        let { email } = req.body

        if (!email)
            return res.status(400).send()

        let user: User

        try {
            email = String(email).toLowerCase()
            user = await userRepository.findOneOrFail({ where: { email }, select: ['id', 'name', 'email'] })
        } catch (error) {
            return res.status(401).send()
        }

        try {
            const recovery_token = crypto.randomBytes(10).toString('hex')
            const now = new Date()
            now.setMinutes(now.getMinutes() + 1)

            await userRepository.update(
                user.id,
                { passwordResetToken: recovery_token, passwordResetExpires: now }
            )

            await sendMail(
                user.email,
                'Recover Password',
                `Hello ${user.name}, use the token below to recover your password!\nTOKEN: ${recovery_token}`,
                `<p>Hello ${user.name}, use the code below to recover your password!</p><p>TOKEN: <b>${recovery_token}</b></p>`
            )

            return res.send()
        } catch (error) {
            return res.json({ ...error })
        }
    },

    async reset_password(req: Request, res: Response) { // TODO: VALIDATE PASSWORD
        const { email, token, password } = req.body

        if (!(email && token && password))
            return res.status(400).json({ error: 'invalid fields' })

        try {
            const user = await getRepository(User).findOneOrFail({
                select: ['id', 'passwordResetToken', 'passwordResetExpires'],
                where: { email }
            })

            if (token !== user.passwordResetToken)
                return res.status(400).json({ error: 'token invalid' })

            const now = new Date()

            if (now > user.passwordResetExpires)
                return res.status(400).json({ error: 'token expired, generate a new one' })

            user.password = password

            user.hashPassword()

            await getRepository(User).update(user.id, { password: user.password, passwordResetToken: null, passwordResetExpires: null })

            return res.send()
        } catch (error) {
            return res.status(400).json({ error: `Cannot reset password, try again` })
        }
    },

    async logout(req: Request, res: Response) {

        return res.json({ body: req.body, params: req.params })
    },
}