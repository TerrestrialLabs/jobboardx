import type { NextApiRequest } from 'next'
import jwt from 'jsonwebtoken'

export async function getSession({ req }: { req: NextApiRequest }) {
    const bearerToken = req.headers.authorization

    if (bearerToken) {
        const token = bearerToken.replace('Bearer', '').trim()
        let userSession
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, (err, session) => {
            if (err) { 
                console.log("Error verifying token")
            } else {
                userSession = session
            }
        })
        
        return userSession
    }
}