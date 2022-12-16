import { Box, CircularProgress, Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import React, { useEffect, useState } from 'react'
import styles from '../styles/Home.module.css'
import Link from 'next/link'
import { useWindowSize } from '../hooks/hooks'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

const Dashboard = ({ content }: { content: JSX.Element }) => {
    const { data: session, status } = useSession()
    // TO DO: Hack to prevent flashing unauthorized message when logging out
    const [signedIn, setSignedIn] = useState(false)

    const router = useRouter()

    const windowSize = useWindowSize()
    const mobile = !!(windowSize.width && windowSize.width < 500 )

    useEffect(() => {
        if (session?.user) {
            setSignedIn(true)
        }
    }, [session?.user])

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/')
        }
    }, [status])

    // Session is loading or user just logged out
    if (status === 'loading' || (signedIn && status === 'unauthenticated')) {
        return (
            <Box height='100vh' display='flex' alignItems='center' justifyContent='center'>
                <CircularProgress color='secondary' size={22} />
            </Box>
        )
    }

    // @ts-ignore
    if (status === 'unauthenticated' || session?.user?.role !== 'employer') {
        return (
            <Box height='100vh' display='flex' alignItems='center' justifyContent='center'>
                <Typography>Access Denied</Typography>
            </Box>
        )
    }

    return (
        <div className={styles.container}>
            <main className={styles.main} style={{backgroundColor: '#f5f5f5', paddingTop: 58}}>
                <Grid container justifyContent='center' pb={mobile ? 2 : 4}>
                    <Grid xs={12} sm={10} lg={9} container>

                        <Grid xs={12} p={mobile ? 2 : 0} pt={0} pb={mobile ? 0 : 4}>
                            <Box p={mobile ? 2 : 4} pt={mobile ? 3 : 4} pb={mobile ? 3 : 4} sx={{ backgroundColor: '#fff', borderRadius: 1 }}>
                                <Typography variant='h1' fontWeight='bold' fontSize={mobile ? 22 : 30}>Employer Dashboard</Typography>
                            </Box>
                        </Grid>

                        <Grid xs={12} p={mobile ? 2 : 0} container>
                            <Grid xs={12} sm={3} pr={mobile ? 0 : 4} pb={mobile ? 2 : 0}>
                                <Box mr={mobile ? 0 : 4} sx={{ backgroundColor: '#fff', borderRadius: 1, padding: 4, paddingLeft: mobile ? 2 : 4, width: '100%' }}>
                                    <Box pb={2}>
                                        <Typography fontWeight='bold' color={router.pathname.endsWith('stats') ? '#000000DE' : 'grey'}>
                                            <Link href='/dashboard/stats'>Stats</Link>
                                        </Typography>
                                    </Box>
                                    <Box pb={2}>
                                        <Typography fontWeight='bold' color={router.pathname.endsWith('jobs') ? '#000000DE' : 'grey'}>
                                            <Link href='/dashboard/jobs'>Jobs</Link>
                                        </Typography>
                                    </Box>
                                    <Box pb={2}>
                                        <Typography fontWeight='bold' color={router.pathname.endsWith('company-profile') ? '#000000DE' : 'grey'}>
                                            <Link href='/dashboard/company-profile'>Company Profile</Link>
                                        </Typography>
                                    </Box>
                                    <Box pb={2}>
                                        <Typography fontWeight='bold' color={router.pathname.endsWith('billing-details') ? '#000000DE' : 'grey'}>
                                            <Link href='/dashboard/billing-details'>Billing Details</Link>
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography fontWeight='bold' color={router.pathname.endsWith('account') ? '#000000DE' : 'grey'}>
                                            <Link href='/dashboard/account'>Account</Link>
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>

                            <Grid container xs={12} sm={9}>
                                {content}
                            </Grid>
                        </Grid>

                    </Grid>
                </Grid>
            </main>
        </div>
    )
}

export default Dashboard