import { Box, CircularProgress } from '@mui/material'
import type { GetServerSideProps, NextPage } from 'next'
import React, { useEffect } from 'react'
import { useSession } from '../context/SessionContext'
import { useRouter } from 'next/router'

const Logout: NextPage = () => { 
    const router = useRouter()
    const { logout, user } = useSession()

    useEffect(() => {
        if (user) {
            logout()
        }
        router.push('/')
    }, [])

    return (
        <Box height='100vh' display='flex' alignItems='center' justifyContent='center'>
            <CircularProgress color='secondary' size={22} />
        </Box>
    )
}

export default Logout

export const getServerSideProps: GetServerSideProps = async (context) => {
    return { props: {} }
}