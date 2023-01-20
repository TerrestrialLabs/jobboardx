import { NextApiRequest } from 'next'

export const checkIsAdminSite = (req: NextApiRequest) => {
    return req.headers.host === process.env.NEXT_PUBLIC_ADMIN_SITE_HOST || req.headers.host === process.env.NEXT_PUBLIC_ADMIN_SITE_HOST_LOCAL
}