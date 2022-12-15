import { Box, CircularProgress } from '@mui/material'
import type { GetServerSideProps, NextPage } from 'next'
import React, { useEffect } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

const Logout: NextPage = () => { 
    const router = useRouter()
    const { data: session } = useSession()

    useEffect(() => {
        if (session?.user) {
            signOut()
        } else {
            router.push('/')
        }
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