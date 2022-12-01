import React from 'react'
import { JobBoardData } from '../pages/api/jobboards'

export interface JobBoardContextValue {
    jobboard: JobBoardData
}

export const JobBoardContext = React.createContext<JobBoardContextValue | null>(null)