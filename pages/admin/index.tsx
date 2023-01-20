import { Alert, Autocomplete, Box, Button, CircularProgress, FilledInput, FormControl, FormHelperText, TextField, Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import React, { useContext, useEffect, useState } from 'react'
import styles from '../../styles/Home.module.css'
import { useWindowSize } from '../../hooks/hooks'
import { JobBoardContext, JobBoardContextValue } from '../../context/JobBoardContext'
import { useRouter } from 'next/router'
import { AUTH_STATUS, ROLE } from '../../const/const'
import { useSession } from '../../context/SessionContext'
import axiosInstance from '../../api/axios'
import ErrorPage from 'next/error'
import { JobBoardData } from '../api/jobboards'

const JobBoards: NextPage = () => {
    const { baseUrlApi, isAdminSite } = useContext(JobBoardContext) as JobBoardContextValue

    const { user, status } = useSession()
    const [signedIn, setSignedIn] = useState(false)

    const router = useRouter()

    const [data, setData] = useState<JobBoardData[]>([])
    const [loading, setLoading] = useState(false)

    const windowSize = useWindowSize()
    const mobile = !!(windowSize.width && windowSize.width < 500 )

    // @ts-ignore
    const accessDenied = !isAdminSite || status === AUTH_STATUS.UNAUTHENTICATED || (user && user?.role !== ROLE.ADMIN)

    const fetchJobboards = async () => {
        try {
            const { data } = await axiosInstance.get(`${baseUrlApi}jobboards/admin`)
            setData(data)
            setLoading(false)
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        if (isAdminSite && user) {
            setSignedIn(true)
            fetchJobboards()
        }
    }, [user, isAdminSite])

    useEffect(() => {
        if (accessDenied) {
            router.push(isAdminSite ? '/login' : '/')
        }
    }, [status])

    if (!isAdminSite) {
        return <ErrorPage statusCode={404} />
    }

    // Loading form or logging out
    if (loading || status === AUTH_STATUS.LOADING || (signedIn && status === AUTH_STATUS.UNAUTHENTICATED)) {
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
            <Head>
                <title>JobBoardX | My Job Boards</title>
                <meta name="description" content="My Job Boards" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main} style={{backgroundColor: '#f5f5f5', paddingTop: 58}}>
                <Grid container justifyContent='center' pb={mobile ? 2 : 4}>
                    <Grid xs={12} sm={10} lg={8} p={2} pt={0} pb={mobile ? 0 : 2}>
                        <Box p={mobile ? 2 : 4} pt={mobile ? 3 : 4} pb={mobile ? 3 : 4} sx={{ backgroundColor: '#fff', borderRadius: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant='h1' fontWeight='bold' fontSize={mobile ? 22 : 30}>My Job Boards</Typography>
                            <Button onClick={() => router.push('admin/create-board')} variant='contained' disableElevation sx={{ height: '45px' }}>Create</Button>
                        </Box>
                    </Grid>

                    <Grid xs={12} sm={10} lg={8} p={2} container>
                        <Grid xs={12} sm={12} pb={mobile ? 2 : 4}>
                            {data.map((board, index) => (
                                <Box mb={2} key={index} onClick={() => router.push(`/admin/${board._id}/update-board/`)} p={2} sx={{ backgroundColor: '#fff', borderRadius: 1, cursor: 'pointer' }}>
                                    <Typography fontWeight='bold'>{board.title}</Typography>
                                </Box>
                            ))}
                        </Grid>
                    </Grid>
                </Grid>
            </main>
        </div>
    )
}

export default JobBoards

export const getServerSideProps: GetServerSideProps = async (context) => {
    return { props: {} }
}