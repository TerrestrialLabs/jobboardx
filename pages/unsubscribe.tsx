import type { NextPage } from 'next'
import Head from 'next/head'
import { Box, Grid, Link, Typography } from '@mui/material'
import homeStyles from '../styles/Home.module.css'

const Unsubscribe: NextPage = () => {
    return (
        <div className={homeStyles.container} style={{ height: '100vh', backgroundColor: '#f5f5f5' }}>
            <Head>
                <title>React Jobs | Unsubscribe</title>
                <meta name="description" content="Unsubscribe" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={homeStyles.main} style={{ height: '100%', backgroundColor: '#f5f5f5', fontFamily: 'Poppins, sans-serif' }}>
                <Grid container justifyContent='center' pt={1} pb={2}>
                    <Grid xs={11} sm={6}>
                        <Box display='flex' flexDirection='column' sx={{ borderRadius: 1, backgroundColor: '#fff', marginTop: '3rem', padding: '2rem', border: '1px solid #e7e7e7' }}>
                            <Link href='/' style={{ textDecoration: 'none' }}>
                                <Typography color='primary' variant='h4' sx={{ cursor: 'pointer', textDecoration: 'none', marginBottom: '1rem' }}>
                                    React Jobs
                                </Typography>
                            </Link>

                            <Typography fontSize='1.125rem' mb={1}>You have unsubscribed and will no longer receive emails.</Typography>

                            <Link href='/'>Resubscribe</Link>
                        </Box>
                    </Grid>
                </Grid>
            </main>
        </div>
    )
}

export default Unsubscribe