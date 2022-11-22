import mongoose from 'mongoose'

const SubscriptionEmailSchema = new mongoose.Schema({}, { timestamps: true })

export default mongoose.models.SubscriptionEmail || mongoose.model('SubscriptionEmail', SubscriptionEmailSchema)