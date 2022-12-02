import React from 'react'
import { JobBoardData } from '../pages/api/jobboards'

export interface JobBoardContextValue {
    jobboard: JobBoardData
    baseUrl: string
    baseUrlApi: string
}

export const JobBoardContext = React.createContext<JobBoardContextValue | null>(null)