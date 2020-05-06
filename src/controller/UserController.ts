import { Request, Response } from 'express'
import { getRepository } from 'typeorm'
import { User } from '../entity/User'

export default {
    async all(req: Request, res: Response) {
        const userRepository = getRepository(User)

        return res.json({ ...(await userRepository.find()) })
    },

    async one(req: Request, res: Response) {
        const userRepository = getRepository(User)

        try {
            const result = await userRepository.findOne(req.params.id)

            if (!result)
                throw new Error()

            return res.json(result)
        } catch (error) {
            return res.status(404).send()
        }
    },

    async update(req: Request, res: Response) {
        const { name } = req.body

        return res.json(name)
    },

    async remove(req: Request, res: Response) {
        const userRepository = getRepository(User)

        try {
            const userToRemove = await userRepository.findOne(req.params.id)

            if (!userToRemove)
                throw new Error()

            userRepository.remove(userToRemove)

            return res.status(204).send()
        } catch (error) {
            return res.status(403).send()
        }
    }
}