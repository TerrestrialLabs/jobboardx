import { Alert, Box, Button, CircularProgress, FilledInput, FormControl, FormHelperText, Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import React, { useContext, useEffect, useState } from 'react'
import styles from '../styles/Home.module.css'
import Link from 'next/link'
import { useWindowSize } from '../hooks/hooks'
import { JobBoardContext, JobBoardContextValue } from '../context/JobBoardContext'
import { useSession } from "next-auth/react"
import { useRouter } from 'next/router'

const Contact: NextPage = () => {
    const { data: session, status } = useSession()

    console.log('session: ', session)

    const { baseUrlApi, jobboard } = useContext(JobBoardContext) as JobBoardContextValue

    const router = useRouter()

    const windowSize = useWindowSize()
    const mobile = !!(windowSize.width && windowSize.width < 500 )

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/')
        }
    }, [status])

    if (status === 'loading') {
        return (
            <Box height='100vh' display='flex' alignItems='center' justifyContent='center'>
                <CircularProgress color='secondary' size={22} />
            </Box>
        )
    }

    if (status === 'unauthenticated') {
        return (
            <Box height='100vh' display='flex' alignItems='center' justifyContent='center'>
                <Typography>Access Denied</Typography>
            </Box>
        )
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>{`${jobboard.title} | Sign in`}</title>
                <meta name="description" content="Sign in" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main} style={{backgroundColor: '#f5f5f5', paddingTop: 58}}>
                <Grid container justifyContent='center' pb={4}>
                    <Grid xs={9} container>

                        <Grid xs={12} pb={mobile ? 0 : 2}>
                            <Box p={mobile ? 2 : 4} pt={mobile ? 3 : 4} pb={mobile ? 3 : 4} sx={{ backgroundColor: '#fff', borderRadius: 1 }}>
                                <Typography variant='h1' fontWeight='bold' fontSize={mobile ? 22 : 30}>Employer Dashboard</Typography>
                            </Box>
                        </Grid>

                        <Grid xs={12} pt={2} display='flex'>
                            <Grid container xs={3}>
                                <Box mr={4} sx={{ backgroundColor: '#fff', borderRadius: 1, padding: 4, width: '100%' }}>
                                    <Box pb={2}><Typography fontWeight='bold'>Stats</Typography></Box>
                                    <Box pb={2}><Typography fontWeight='bold' color='grey'>Company Profile</Typography></Box>
                                    <Box pb={2}><Typography fontWeight='bold' color='grey'>Jobs</Typography></Box>
                                    <Box pb={2}><Typography fontWeight='bold' color='grey'>Billing</Typography></Box>
                                    <Box><Typography fontWeight='bold' color='grey'>Account</Typography></Box>
                                </Box>
                            </Grid>

                            <Grid container xs={9}>
                                <Grid xs={12} pb={4}>
                                    <Box sx={{ backgroundColor: '#fff'}} p={4}>
                                        <Grid xs={12}>
                                            <Box>
                                                <Typography fontWeight='bold'>This month</Typography>
                                            </Box>
                                        </Grid>

                                        <Grid xs={12} display='flex'>
                                            <Grid pr={4} xs={4}>
                                                <Box pt={2} sx={{ backgroundColor: '#fff', borderRadius: 1, borderRight: '1px solid #e7e7e7' }}>
                                                    <Box mb={0.75}><Typography>Job views</Typography></Box>
                                                    <Box><Typography color='primary' fontSize={24} fontWeight='bold'>15</Typography></Box>
                                                </Box>
                                            </Grid>
                                            <Grid xs={4}>
                                                <Box pt={2} pr={4} sx={{ backgroundColor: '#fff', borderRadius: 1, borderRight: '1px solid #e7e7e7' }}>
                                                    <Box><Typography mb={0.75}>Applications via link</Typography></Box>
                                                    <Box><Typography color='primary' fontSize={24} fontWeight='bold'>2</Typography></Box>
                                                </Box>
                                            </Grid>
                                            <Grid pt={2} pl={4} xs={4}>
                                                <Box sx={{ backgroundColor: '#fff', borderRadius: 1 }}>
                                                    <Box><Typography mb={0.75}>Applications via email</Typography></Box>
                                                    <Box><Typography color='primary' fontSize={24} fontWeight='bold'>3</Typography></Box>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Grid>

                                <Grid xs={12}>
                                    <Box sx={{ backgroundColor: '#fff', width: '100%'}} p={4}>
                                        <Grid xs={12}>
                                            <Box>
                                                <Typography fontWeight='bold'>Total</Typography>
                                            </Box>
                                        </Grid>

                                        <Grid xs={12} display='flex'>
                                            <Grid xs={4} pr={4}>
                                                <Box pt={2} sx={{ backgroundColor: '#fff', borderRadius: 1, borderRight: '1px solid #e7e7e7' }}>
                                                    <Box mb={0.75}><Typography>Jobs Posted</Typography></Box>
                                                    <Box><Typography color='primary' fontSize={24} fontWeight='bold'>1</Typography></Box>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Grid>
                            </Grid>

                        </Grid>

                    </Grid>
                </Grid>
            </main>
        </div>
    )
}

export default Contact

export const getServerSideProps: GetServerSideProps = async (context) => {
    return { props: {} }
}