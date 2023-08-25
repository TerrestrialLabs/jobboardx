import { Box, CircularProgress, Typography, styled } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import React, { useEffect, useState } from 'react'
import styles from '../styles/Home.module.css'
import Link from 'next/link'
import { useWindowSize } from '../hooks/hooks'
import { useRouter } from 'next/router'
import { AUTH_STATUS, ROLE } from '../const/const'
import { useSession } from '../context/SessionContext'

const SELECTED_COLOR = '#000000DE'
const DEFAULT_COLOR = 'grey'

const TabLink = styled(Typography)({
    fontWeight: 'bold'
});

const Dashboard = ({ content }: { content: JSX.Element }) => {
    const { status, user } = useSession()

    const router = useRouter()

    const windowSize = useWindowSize()
    const mobile = !!(windowSize.width && windowSize.width < 500)

    // @ts-ignore
    const accessDenied = status === AUTH_STATUS.UNAUTHENTICATED || (user && user?.role !== ROLE.EMPLOYER)

    useEffect(() => {
        if (accessDenied) {
            router.push('/')
        }
    }, [status])

    if (status === AUTH_STATUS.LOADING) {
        return (
            <Box height='100vh' display='flex' alignItems='center' justifyContent='center'>
                <CircularProgress color='secondary' size={22} />
            </Box>
        )
    }

    if (accessDenied) {
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
                    <Grid xs={11} sm={10} lg={9} container>

                        <Grid xs={12} pb={mobile ? 2 : 4}>
                            <Box p={mobile ? 2 : 4} pt={mobile ? 3 : 4} pb={mobile ? 3 : 4} sx={{ backgroundColor: '#fff', borderRadius: 1 }}>
                                <Typography variant='h1' fontWeight='bold' fontSize={mobile ? 22 : 30}>Employer Dashboard</Typography>
                            </Box>
                        </Grid>

                        <Grid xs={12} container spacing={4}>
                            <Grid xs={12} md={3}>
                                <Box sx={{ backgroundColor: '#fff', borderRadius: 1, padding: 4, paddingLeft: mobile ? 2 : 4, width: '100%' }}>
                                    <Box pb={2}>
                                        <TabLink color={router.pathname.endsWith('stats') ? SELECTED_COLOR : DEFAULT_COLOR}>
                                            <Link href='/dashboard/stats'>Stats</Link>
                                        </TabLink>
                                    </Box>
                                    <Box pb={2}>
                                        <TabLink color={router.pathname.endsWith('jobs') ? SELECTED_COLOR : DEFAULT_COLOR}>
                                            <Link href='/dashboard/jobs'>Jobs</Link>
                                        </TabLink>
                                    </Box>
                                    <Box pb={2}>
                                        <TabLink color={router.pathname.endsWith('company-profile') ? SELECTED_COLOR : DEFAULT_COLOR}>
                                            <Link href='/dashboard/company-profile'>Company Profile</Link>
                                        </TabLink>
                                    </Box>
                                    <Box pb={2}>
                                        <TabLink color={router.pathname.endsWith('billing-details') ? SELECTED_COLOR : DEFAULT_COLOR}>
                                            <Link href='/dashboard/billing-details'>Billing Details</Link>
                                        </TabLink>
                                    </Box>
                                    <Box>
                                        <TabLink color={router.pathname.endsWith('account') ? SELECTED_COLOR : DEFAULT_COLOR}>
                                            <Link href='/dashboard/account'>Account</Link>
                                        </TabLink>
                                    </Box>
                                </Box>
                            </Grid>

                            <Grid xs={12} md={9} p={0}>
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