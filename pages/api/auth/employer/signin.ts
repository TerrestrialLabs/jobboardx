import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../../mongodb/dbconnect'
import User from '../../../../models/User'
import JobBoard from '../../../../models/JobBoard'
import { JobBoardData } from '../../jobboards'
import sgMail from '@sendgrid/mail'
import { v4 as uuidv4 } from 'uuid'
import VerificationToken from '../../../../models/VerificationToken'
import { add } from 'date-fns'

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '')

dbConnect()

// Session
const NINETY_DAYS = 90 * 24 * 60 * 60
const THIRTY_MINUTES = 30 * 60

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
        const jobboard = await JobBoard.findOne({ _id: req.body.jobboardId }).select('-ownerId').exec()
        const local = req.headers.host?.includes('localhost')
        const baseUrl = local ? process.env.NEXT_PUBLIC_BASE_URL_LOCAL : `https://${jobboard.domain}/`

        if (!jobboard) {
            throw new Error('Sign in failed')
        }

        if (req.body.email) {
            const user = await User.findOne({ email: req.body.email })
            if (!user) {
                return res.status(401).json({ error: 'An account with this email could not be found' });
            }

            const token = uuidv4()
            const callbackUrl = `${baseUrl}dashboard/stats`
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
                // from: `${jobboard.title} <support@jobboardx.io>`,
                from: `${jobboard.title} <${jobboard.email}>`,
                url,
                jobboard
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
    jobboard: JobBoardData
}
async function sendVerificationRequest(params: SendVerificationRequestParams) {
    const { to, from, url, jobboard } = params

    const message = {
        to,
        from,
        html: "<html></html>",
        text: `Sign in to ${jobboard.title}\n\nHello,\n\nWe've received a request to sign in to the account associated with this email address. To sign in, copy and paste the following URL into your browser:\n\n${url}.`,
        dynamic_template_data: {
            subject: `Sign in to ${jobboard.title}`,
            jobboard: {
                domain: jobboard.domain,
                title: jobboard.title
            },
            signInUrl: url
        },
        template_id: 'd-acac1596586f4a53acc8a2045537f177'
    }

    try {
        await sgMail.send(message)
        console.log('Sign in email sent')
    } catch(err) {
        console.log('Failed to send sign in email')
        // @ts-ignore
        console.log('err: ', err.response.body.errors)
    }
}

function html(params: { url: string, host: string, jobboard: JobBoardData }) {
    const { url, host, jobboard } = params

    const baseUrl = `http${host.includes('localhost') ? '' : 's'}://${host}/`
  
    const escapedHost = host.replace(/\./g, "&#8203;.")
  
    return `<!DOCTYPE html>
    <html lang="en" xmlns:v="urn:schemas-microsoft-com:vml">
        <head>
            <meta charset="utf-8">
            <meta name="x-apple-disable-message-reformatting">
            <meta http-equiv="x-ua-compatible" content="ie=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
            <meta name="color-scheme" content="light dark">
            <meta name="supported-color-schemes" content="light dark">
            <!--[if mso]>
            <noscript>
            <xml>
                <o:OfficeDocumentSettings xmlns:o="urn:schemas-microsoft-com:office:office">
                <o:PixelsPerInch>96</o:PixelsPerInch>
                </o:OfficeDocumentSettings>
            </xml>
            </noscript>
            <style>
            td,th,div,p,a,h1,h2,h3,h4,h5,h6 {font-family: "Segoe UI", sans-serif; mso-line-height-rule: exactly;}
            </style>
            <![endif]-->
            <title>Let's get you signed in</title>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet" media="screen">
            <style>
            img {
                max-width: 100%;
                vertical-align: middle;
                line-height: 100%;
                border: 0
            }
            .hover-bg-slate-100:hover {
                background-color: #F7F8FA !important
            }
            .hover-bg-primary-600:hover {
                background-color: #003CDF !important
            }
            .hover-text-slate-600:hover {
                color: #585E83 !important
            }
            .hover-text-primary-600:hover {
                color: #003CDF !important
            }
            @media (prefers-color-scheme: dark) {
                .dark-bg-gray-800 {
                background-color: #1E1E1E !important
                }
                .dark-bg-gray-900 {
                background-color: #121212 !important
                }
                .dark-bg-gray-50 {
                background-color: #f9fafb !important
                }
                .dark-bg-gray-600 {
                background-color: #272727 !important
                }
                .dark-text-gray-200 {
                color: #ABABAB !important
                }
                .dark-text-gray-50 {
                color: #f9fafb !important
                }
                .dark-text-gray-800 {
                color: #1E1E1E !important
                }
                .dark-text-gray-900 {
                color: #121212 !important
                }
                .dark-text-primary-500 {
                color: #0047FF !important
                }
                .dark-text-primary-200 {
                color: #94B5FF !important
                }
                .dark-hover-bg-gray-50:hover {
                background-color: #f9fafb !important
                }
                .dark-hover-text-gray-100:hover {
                color: #D5D5D5 !important
                }
                .dark-hover-text-primary-100:hover {
                color: #C6D9FF !important
                }
            }
            @media (max-width: 648px) {
                .sm-mt-0 {
                margin-top: 0 !important
                }
                .sm-block {
                display: block !important
                }
                .sm-hidden {
                display: none !important
                }
                .sm-h-px {
                height: 1px !important
                }
                .sm-w-full {
                width: 100% !important
                }
                .sm-py-3 {
                padding-top: 12px !important;
                padding-bottom: 12px !important
                }
                .sm-px-0 {
                padding-left: 0 !important;
                padding-right: 0 !important
                }
                .sm-px-6 {
                padding-left: 24px !important;
                padding-right: 24px !important
                }
                .sm-leading-10 {
                line-height: 40px !important
                }
            }
            </style>
        </head>
        <body class="dark-bg-gray-900" style="margin: 0; width: 100%; padding: 0; word-break: break-word; -webkit-font-smoothing: antialiased; background-color: #F7F8FA">
            <div style="display: none">
            Let's get you signed in
            &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847;
            </div>
            <div role="article" aria-roledescription="email" aria-label="Let's get you signed in" lang="en" style="font-size: 16px; font-size: 1rem; font-size: max(16px, 1rem)">
            <table style="width: 100%; font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                <td align="center">
                    <!--[if mso]>
                    <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="height:300px; mso-width-percent: 1000; position: absolute; left: -10px; top: -20px; z-index: -1;">
                    <v:fill type="tile" color="#dee2e9" />
                    <v:textbox inset="0,0,0,0">
                    <![endif]-->
                    <div style="max-height: 40px">
                    <div class="dark-bg-gray-900" style="height: 300px; background-color: #DEE2E9"></div>
                    </div>
                    <!--[if mso]>
                    </v:textbox>
                    </v:rect>
                    <![endif]-->
                    <table class="sm-w-full" style="position: relative; max-height: 0; width: 568px; opacity: 0.999" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                        <td style="vertical-align: top" valign="top">
                        <div class="sm-px-6">
                            <table style="width: 100%" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                                <td class="sm-px-6" style="padding-left: 40px; padding-right: 40px">
                                <table style="width: 100%" cellpadding="0" cellspacing="0" role="presentation">
                                    <tr>
                                    <td>
                                        <a href="${baseUrl}" class="dark-text-gray-50" style="text-decoration: none; font-weight: 700; color: #191847">
                                        ${jobboard.title}
                                        </a>
                                    </td>
                                    <td align="right">
                                        <a href="https://example.com" class="dark-text-gray-900 dark-bg-gray-50 hover-bg-slate-100" style="text-decoration: none; display: inline-block; border-radius: 8px; background-color: #f9fafb; padding: 7px 12px; text-align: center; font-size: 12px; font-weight: 700; color: #191847; box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.06), 0px 1px 3px rgba(0, 0, 0, 0.1)">
                                        <!--[if mso
                                            ]><i
                                            style="
                                                letter-spacing: 24px;
                                                mso-font-width: -100%;
                                                mso-text-raise: 30px;
                                            "
                                            >&nbsp;</i><!
                                        [endif]-->
                                        <span style="mso-text-raise: 15px">
                                            Account
                                            <!--[if mso
                                            ]><i
                                                style="
                                                letter-spacing: 6px;
                                                mso-font-width: -100%;
                                                "
                                                >&nbsp;</i><!
                                            [endif]-->
                                        </span>
                                        <!--[if mso
                                            ]><i
                                            style="
                                                letter-spacing: 24px;
                                                mso-font-width: -100%;
                                            "
                                            >&nbsp;</i><!
                                        [endif]-->
                                        </a>
                                    </td>
                                    </tr>
                                </table>
                                </td>
                            </tr>
                            </table>
                            <div role="separator" style="line-height: 40px">&zwnj;</div>
                            <table class="dark-bg-gray-600" style="width: 100%; border-radius: 8px; background-color: #fff; box-shadow: 0px 10px 10px -5px rgba(0, 0, 0, 0.04), 0px 20px 25px -5px rgba(0, 0, 0, 0.1)" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                                <td class="sm-px-6" style="padding: 40px">
                                <table style="width: 100%" cellpadding="0" cellspacing="0" role="presentation">
                                    <tr>
                                    <td>
                                        <h1 class="dark-text-gray-50" style="margin: 0; font-size: 36px; font-weight: 700; line-height: 1; letter-spacing: -0.025em; color: #191847">
                                        Let's get you signed in
                                        </h1>
                                        <div role="separator" style="line-height: 24px">
                                        &zwnj;
                                        </div>
                                        <p class="dark-text-gray-50" style="margin: 0; font-size: 16px; line-height: 26px; color: #191847">
                                        We use this easy sign-in button so you don't
                                        have to remember or type in yet another long
                                        password.
                                        </p>
                                    </td>
                                    </tr>
                                    <tr role="separator">
                                    <td style="line-height: 24px">&zwnj;</td>
                                    </tr>
                                    <tr>
                                    <td>
                                        <a href="${url}/dashboard" class="sm-block dark-text-primary-500 hover-bg-primary-600 dark-bg-gray-50 dark-hover-bg-gray-50" style="text-decoration: none; display: inline-block; border-radius: 8px; background-color: #0047FF; padding: 14px 24px; text-align: center; font-size: 16px; font-weight: 700; color: #f9fafb; box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.06), 0px 4px 6px -1px rgba(0, 0, 0, 0.1)">
                                        <!--[if mso
                                            ]><i
                                            style="
                                                letter-spacing: 24px;
                                                mso-font-width: -100%;
                                                mso-text-raise: 30px;
                                            "
                                            >&nbsp;</i><!
                                        [endif]-->
                                        <span style="mso-text-raise: 15px">Sign in</span>
                                        <!--[if mso
                                            ]><i
                                            style="
                                                letter-spacing: 24px;
                                                mso-font-width: -100%;
                                            "
                                            >&nbsp;</i><!
                                        [endif]-->
                                        </a>
                                        <div role="separator" style="line-height: 24px">
                                        &zwnj;
                                        </div>
                                        <p style="margin: 0; font-size: 16px">
                                        <span style="font-weight: 700">Or copy and paste the following URL into your
                                            browser:</span>
                                        <br>
                                        <a href="${url}" class="hover-text-primary-600 dark-text-primary-200 dark-hover-text-primary-100" style="text-decoration: none; font-size: 11px; line-height: 26px; color: #0047FF">
                                            ${url}
                                        </a>
                                        </p>
                                    </td>
                                    </tr>
                                </table>
                                </td>
                            </tr>
                            </table>
                        </div>
                        </td>
                    </tr>
                    </table>
                    <div class="sm-leading-10" role="separator" style="line-height: 64px">&zwnj;</div>
                    <table class="sm-w-full dark-text-gray-200" style="width: 568px; color: #767E9D" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                        <td style="padding-left: 40px; padding-right: 40px">
                        <a href="https://example.com" class="dark-text-gray-50" style="text-decoration: none; font-weight: 700; color: #767E9D">
                            COMPANY NAME
                        </a>
                        <div style="line-height: 16px">&zwnj;</div>
                        <table class="sm-w-full" style="font-size: 12px; line-height: 16px" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                            <td class="sm-block sm-w-full">
                                <a href="https://example.com" class="sm-block sm-py-3 hover-text-slate-600 dark-text-gray-200 dark-hover-text-gray-100" style="text-decoration: none; font-weight: 700; color: #767E9D">
                                Shop
                                </a>
                            </td>
                            <td class="sm-block sm-px-0" style="padding-left: 12px; padding-right: 12px">
                                <table class="sm-hidden" cellpadding="0" cellspacing="0" role="presentation">
                                <tr>
                                    <td class="dark-bg-gray-800" style="height: 24px; width: 1px; background-color: #DEE2E9"></td>
                                </tr>
                                </table>
                                <!--[if !mso]><!-->
                                <div class="sm-block sm-h-px dark-bg-gray-800" style="mso-hide: all; display: none; background-color: #DEE2E9"></div>
                                <!--<![endif]-->
                            </td>
                            <td class="sm-block sm-w-full">
                                <a href="https://twitter.com/example" class="sm-py-3 hover-text-slate-600 dark-text-gray-200 dark-hover-text-gray-100" style="text-decoration: none; display: block; font-weight: 700; color: #767E9D">
                                Twitter
                                </a>
                            </td>
                            <td class="sm-block sm-px-0" style="padding-left: 12px; padding-right: 12px">
                                <table class="sm-hidden" cellpadding="0" cellspacing="0" role="presentation">
                                <tr>
                                    <td class="dark-bg-gray-800" style="height: 24px; width: 1px; background-color: #DEE2E9"></td>
                                </tr>
                                </table>
                                <!--[if !mso]><!-->
                                <div class="sm-block sm-h-px dark-bg-gray-800" style="mso-hide: all; display: none; background-color: #DEE2E9"></div>
                                <!--<![endif]-->
                            </td>
                            <td class="sm-block sm-w-full">
                                <a href="https://instagram.com/example" class="sm-py-3 hover-text-slate-600 dark-text-gray-200 dark-hover-text-gray-100" style="text-decoration: none; display: block; font-weight: 700; color: #767E9D">
                                Instagram
                                </a>
                            </td>
                            </tr>
                        </table>
                        <hr class="sm-mt-0 dark-bg-gray-800 dark-text-gray-800" style="margin-top: 12px; margin-bottom: 16px; height: 1px; border-width: 0px; background-color: #DEE2E9; color: #DEE2E9">
                        <p style="margin: 0; font-size: 12px; line-height: 16px">
                            If you have questions or need help, don't hesitate to contact our
                            support team!
                            <br>
                            <br>
                            DEMOCO USA Inc, 4 World Trade Center, 150 Greenwich Street, 62nd Floor,
                            New York, NY 10007, USA
                        </p>
                        <div style="line-height: 16px">&zwnj;</div>
                        <table class="sm-w-full" style="font-size: 12px; line-height: 16px" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                            <td class="sm-block sm-w-full">
                                <a href="https://example.com" class="sm-py-3 hover-text-slate-600 dark-text-gray-200 dark-hover-text-gray-100" style="text-decoration: none; display: block; font-weight: 700; color: #767E9D">
                                Terms &amp; conditions
                                </a>
                            </td>
                            <td class="sm-block sm-px-0" style="padding-left: 12px; padding-right: 12px">
                                <table class="sm-hidden" cellpadding="0" cellspacing="0" role="presentation">
                                <tr>
                                    <td class="dark-bg-gray-800" style="height: 24px; width: 1px; background-color: #DEE2E9"></td>
                                </tr>
                                </table>
                                <!--[if !mso]><!-->
                                <div class="sm-block sm-h-px dark-bg-gray-800" style="mso-hide: all; display: none; background-color: #DEE2E9"></div>
                                <!--<![endif]-->
                            </td>
                            <td class="sm-block sm-w-full">
                                <a href="https://example.com" class="sm-py-3 hover-text-slate-600 dark-text-gray-200 dark-hover-text-gray-100" style="text-decoration: none; display: block; font-weight: 700; color: #767E9D">
                                Privacy policy
                                </a>
                            </td>
                            <td class="sm-block sm-px-0" style="padding-left: 12px; padding-right: 12px">
                                <table class="sm-hidden" cellpadding="0" cellspacing="0" role="presentation">
                                <tr>
                                    <td class="dark-bg-gray-800" style="height: 24px; width: 1px; background-color: #DEE2E9"></td>
                                </tr>
                                </table>
                                <!--[if !mso]><!-->
                                <div class="sm-block sm-h-px dark-bg-gray-800" style="mso-hide: all; display: none; background-color: #DEE2E9"></div>
                                <!--<![endif]-->
                            </td>
                            <td class="sm-block sm-w-full">
                                <a href="https://example.com" class="sm-py-3 hover-text-slate-600 dark-text-gray-200 dark-hover-text-gray-100" style="text-decoration: none; display: block; font-weight: 700; color: #767E9D">
                                Contact us
                                </a>
                            </td>
                            <td class="sm-block sm-px-0" style="mso-hide: all; display: none; padding-left: 12px; padding-right: 12px">
                                <!--[if !mso]><!-->
                                <div class="sm-block sm-h-px dark-bg-gray-800" style="mso-hide: all; display: none; background-color: #DEE2E9"></div>
                                <!--<![endif]-->
                            </td>
                            </tr>
                        </table>
                        <div style="line-height: 16px">&zwnj;</div>
                        <p style="margin: 0; font-size: 12px; line-height: 16px">
                            This message was sent to name@domain.com. If you don't want to receive
                            these emails from DEMOCO in the future, you can
                            <a href="https://example.com" class="hover-text-slate-600 dark-text-gray-200 dark-hover-text-gray-100" style="text-decoration: none; font-weight: 700; color: #767E9D">edit your profile</a>
                            or
                            <a href="https://example.com" class="hover-text-slate-600 dark-text-gray-200 dark-hover-text-gray-100" style="text-decoration: none; font-weight: 700; color: #767E9D">unsubscribe</a>.
                        </p>
                        <div style="line-height: 40px">&zwnj;</div>
                        </td>
                    </tr>
                    </table>
                </td>
                </tr>
            </table>
            </div>
        </body>
    </html>`
}
  
// Email Text body (fallback for email clients that don't render HTML)
function text({ url, host, jobboard }: { url: string; host: string, jobboard: JobBoardData }) {
return `Sign in to ${jobboard.title}\n${url}\n\n`
} 