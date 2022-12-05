import type { NextPage } from 'next'
import Head from 'next/head'
import { Box, CircularProgress, Grid, Link, Typography } from '@mui/material'
import homeStyles from '../../styles/Home.module.css'
import { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/router'
import { JobBoardContext, JobBoardContextValue } from '../../context/JobBoardContext'

const Unsubscribe: NextPage = () => {
    const { baseUrlApi, jobboard } = useContext(JobBoardContext) as JobBoardContextValue
    
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    const fetchSubscription = async () => {
        try {
            const res = await axios.get(`${baseUrlApi}subscriptions/${router.query.id}`)
            if (res.data) {
                await axios.delete(`${baseUrlApi}subscriptions/${router.query.id}`)
            }
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (router.query.id) {
            fetchSubscription()
        }
    }, [router.query.id])

    return (
        <div className={homeStyles.container} style={{ height: '100vh', backgroundColor: '#f5f5f5' }}>
            <Head>
                <title>{`${jobboard.title} | Unsubscribe`}</title>
                <meta name="description" content="Unsubscribe" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            {loading ? (
                <Box sx={{ height: 'calc(100vh - 58px)'}} display='flex' alignItems='center' justifyContent='center'>
                    <CircularProgress color='secondary' sx={{ marginBottom: '58px' }} />
                </Box>
            ) : (
                <main className={homeStyles.main} style={{ height: '100%', backgroundColor: '#f5f5f5', fontFamily: 'Poppins, sans-serif' }}>
                    <Grid container justifyContent='center' pt={1} pb={2}>
                        <Grid xs={11} sm={6}>
                            <Box display='flex' flexDirection='column' sx={{ borderRadius: 1, backgroundColor: '#fff', marginTop: '3rem', padding: '2rem', border: '1px solid #e7e7e7' }}>
                                <Link href='/' style={{ textDecoration: 'none' }}>
                                    <Typography color='primary' variant='h4' sx={{ cursor: 'pointer', textDecoration: 'none', marginBottom: '1rem' }}>
                                        {jobboard.title}
                                    </Typography>
                                </Link>

                                <Typography fontSize='1.125rem' mb={1}>You have unsubscribed and will no longer receive emails.</Typography>

                                {/* <Link href='/'>Resubscribe</Link> */}
                            </Box>
                        </Grid>
                    </Grid>
                </main>
            )}
        </div>
    )
}

export default Unsubscribe