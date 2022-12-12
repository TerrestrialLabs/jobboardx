import { Box, Button, Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import React, { useContext } from 'react'
import styles from '../styles/Home.module.css'
import { useWindowSize } from '../hooks/hooks'
import { JobBoardContext, JobBoardContextValue } from '../context/JobBoardContext'

const LoginError: NextPage = () => {
    const { baseUrlApi, jobboard } = useContext(JobBoardContext) as JobBoardContextValue

    const windowSize = useWindowSize()
    const mobile = !!(windowSize.width && windowSize.width < 500 )

    return (
        <div className={styles.container}>
            <Head>
                <title>{`${jobboard.title} | Error`}</title>
                <meta name="description" content="Error" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main} style={{backgroundColor: '#f5f5f5', paddingTop: 58}}>
                <Grid p={mobile ? 2 : 12} container justifyContent='center'>
                    <Box p={mobile ? 2 : 4} pt={mobile ? 3 : 4} pb={mobile ? 3 : 4} sx={{ backgroundColor: '#fff', borderRadius: 1, width: 'mobile' ? 'auto' : '260px', maxWidth: mobile ? 'auto' : '420px' }}>
                        <Grid xs={12}>
                            <Box mb={4}><Typography fontWeight='bold' variant='h1' fontSize={22} align='center'>Unable to sign in</Typography></Box>
                        </Grid>

                        <Box>
                            <Typography textAlign='center' sx={{ marginBottom: 2 }}>The sign in link is no longer valid.</Typography>
                            <Typography textAlign='center'>It may have been used already or it may have expired.</Typography>
                        </Box>

                        <Grid xs={12} sm={12} pt={4} display='flex' justifyContent='center'>
                            <Button href='/login' fullWidth={mobile} variant='contained' disableElevation color='primary'>
                                Go to sign in
                            </Button>
                        </Grid>
                    </Box>
                </Grid>
            </main>
        </div>
    )
}

export default LoginError

export const getServerSideProps: GetServerSideProps = async (context) => {
    return { props: {} }
}