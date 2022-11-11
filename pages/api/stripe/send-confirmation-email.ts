import { NextApiRequest, NextApiResponse } from "next";
import * as nodemailer from 'nodemailer'
import type { SentMessageInfo } from 'nodemailer'

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

export default async (req: NextApiRequest, res: NextApiResponse<boolean>) => {
    const { method } = req

    if (method === 'POST') {
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: 'support@reactdevjobs.io',
                  pass: process.env.GOOGLE_APP_PASSWORD
                }
            })

            const mailOptions = {
                from: 'React Jobs <support@reactdevjobs.io>',
                to: req.body.email,
                subject: 'Your job has been posted',
                html:
                    `<html>
                        <body>
                            <p>Your ${req.body.featured ? 'featured ' : ''}job has been posted and will be live for 30 days.</p>
                            <p>The React Jobs team</p>
                        </body>
                    </html>`,
                // text: `Your ${req.body.featured ? 'featured ' : ''}job has been posted and will be live for 30 days.`
            }

            transporter.sendMail(mailOptions, (err: Error | null, res: SentMessageInfo) => {
                if (err) {
                    console.log('There was an error sending an email: ', err)
                } else {
                    console.log('Confirmation email sent')
                }
            })

            // '<html><body>Test</body></html>'
            res.status(201).json(true)
        } catch(err) {
            // TO DO
            // @ts-ignore
            res.status(500).json(getErrorMessage(err))
        }
    }
}