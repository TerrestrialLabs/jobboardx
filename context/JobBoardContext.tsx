import React from 'react'
import { JobBoardData } from '../models/JobBoard'

export interface JobBoardContextValue {
    isAdminSite: boolean
    jobboard: JobBoardData
    baseUrl: string
    baseUrlApi: string
}

export const JobBoardContext = React.createContext<JobBoardContextValue | null>(null)