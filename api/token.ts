import cookie from 'cookie'
import jwt from 'jsonwebtoken'

export const serializeCookie = (refreshToken: string) => {
    return cookie.serialize('jobboardx', JSON.stringify({ refreshToken }), {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        maxAge: 365 * 60 * 60, // 1y
        // TO DO: Check
        // sameSite: 'strict',
        path: '/'
    })
}

// TO DO: Decide on user payload
// @ts-ignore
export const generateAccessToken = (user) => {
    return jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: '15m' })
}

// @ts-ignore
export const generateRefreshToken = (user) => {
    return jwt.sign({ user }, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: '1y' })
}
