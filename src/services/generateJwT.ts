import JwT from 'jsonwebtoken'

export const generateJwT = (id: string) => new Promise((resolve) => {
    const payload = {
        iss: process.env.JWT_NAME,
        sub: id
    }

    JwT.sign(payload, process.env.JWT_SECRET, {
        algorithm: 'HS256', expiresIn: '1h'
    }, (err, token) => {
        if (err)
            throw new Error(`ERR_INVALID_TOKEN`)
        return resolve(token)
    })
})