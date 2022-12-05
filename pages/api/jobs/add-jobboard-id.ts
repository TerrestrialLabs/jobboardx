import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../mongodb/dbconnect'
import Job from '../../../models/Job'
import Subscription from '../../../models/Subscription'
import Message from '../../../models/Message'
import UserEvent from '../../../models/UserEvent'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<boolean>
) {
    const { 
        method
    } = req

    dbConnect()

    // TO DO: TEMP - DELETE
    if (method === 'POST') {
        try {
            await Job.updateMany({}, { $set: { jobboardId: req.body.jobboardId } })
            await Subscription.updateMany({}, { $set: { jobboardId: req.body.jobboardId } })
            await Message.updateMany({}, { $set: { jobboardId: req.body.jobboardId } })
            await UserEvent.updateMany({}, { $set: { jobboardId: req.body.jobboardId } })
            res.status(200).json(true)
        } catch (err) {
            console.log(err)
        }
    }
}