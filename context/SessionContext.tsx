import React, { useContext } from 'react'
import { UserType } from '../models/User'

export interface SessionContextValue {
    user?: UserType | null
    status: string
    logout: () => void
    login: (value: UserType) => void
}

export const SessionContext = React.createContext<SessionContextValue | null>(null)

export function useSession () {
    const session = useContext(SessionContext) as SessionContextValue
    return session
}