import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../../mongodb/dbconnect'
import User from '../../../../models/User'
import sgMail from '@sendgrid/mail'
import { v4 as uuidv4 } from 'uuid'
import VerificationToken from '../../../../models/VerificationToken'
import { add } from 'date-fns'
import { ROLE } from '../../../../const/const'

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '')

dbConnect()

function getErrorMessage(error: unknown) {
    if (error instanceof Error) { 
        return error.message
    }
    return String(error)
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { 
        method
    } = req

    dbConnect()

    try {
        const local = req.headers.host?.includes('localhost')
        const baseUrl = local ? `http://${process.env.NEXT_PUBLIC_ADMIN_SITE_HOST_LOCAL}/` : `https://${req.headers.host}/`

        if (req.body.email) {
            const user = await User.findOne({ email: req.body.email, role: ROLE.ADMIN })
            if (!user) {
                return res.status(401).json({ error: 'An account with this email could not be found' });
            }

            const token = uuidv4()
            const callbackUrl = `${baseUrl}`
            const query = `?callbackUrl=${encodeURIComponent(callbackUrl)}&token=${token}&email=${user.email}`
            const url = `${baseUrl}verify${query}`

            const verificationToken = await VerificationToken.create({
                identifier: user.email,
                token,
                expires: add(new Date(), { hours: 24 })
            })
            if (!verificationToken) {
                throw Error('Sign in failed')
            }

            sendVerificationRequest({
                to: req.body.email,
                from: `JobBoardX <support@jobboardx.io>`,
                url
            })
        }
    
        res.status(200).json(true)
    } catch (err) {
        res.status(500).json(getErrorMessage(err))
    }
}

type SendVerificationRequestParams = { 
    to: string
    from: string
    url: string
}
async function sendVerificationRequest(params: SendVerificationRequestParams) {
    const { to, from, url } = params

    const message = {
        to,
        from,
        // html: "<html></html>",
        // TO DO: Remove
        subject: 'Sign in to JobBoardX',
        html: `<html><body><div><div>Sign in:</div><div>${url}</div></div></body></html>`,
        text: `Sign in to JobBoardX\n\nHello,\n\nWe've received a request to sign in to the account associated with this email address. To sign in, copy and paste the following URL into your browser:\n\n${url}.`,
        // dynamic_template_data: {
        //     subject: `Sign in to JobBoardX`,
        //     signInUrl: url
        // },
        // template_id: 
    }

    try {
        await sgMail.send(message)
        console.log('Sign in email sent')
    } catch(err) {
        // console.log('err: ', err.response.body.errors)
        console.log('Failed to send sign in email')
    }
}