import mongoose from 'mongoose'

const EmployerSchema = new mongoose.Schema({
    company: { type: String, required: true, index: true, unique: true, sparse: true },
    website: { type: String, required: true },
    logo: { type: String }
}, { _id : false })

const BackfilledEmployerSchema = new mongoose.Schema({
    jobboardId: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, required: true },
    employer: { type: EmployerSchema }
}, { timestamps: true })

export default mongoose.models.BackfilledEmployer || mongoose.model('BackfilledEmployer', BackfilledEmployerSchema)