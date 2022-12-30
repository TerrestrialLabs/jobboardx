import type { NextApiRequest } from 'next'
import jwt from 'jsonwebtoken'

export async function getSession({ req }: { req: NextApiRequest }) {
    const headersToken = req.headers.authorization

    if (headersToken) {
        let userSession
        jwt.verify(headersToken, process.env.ACCESS_TOKEN_SECRET as string, (err, session) => {
            if (err) { 
                console.log("Error verifying token")
            } else {
                userSession = session
            }
        })
        
        return userSession
    }
}