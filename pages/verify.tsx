import { Alert, Box, Button, CircularProgress, FilledInput, FormControl, FormHelperText, Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import React, { useContext, useEffect, useRef, useState } from 'react'
import styles from '../styles/Home.module.css'
import Link from 'next/link'
import axios from 'axios'
import { useWindowSize } from '../hooks/hooks'
import { JobBoardContext, JobBoardContextValue } from '../context/JobBoardContext'
import { useRouter } from 'next/router'
import { useSession } from '../context/SessionContext'

const Verify: NextPage = () => {
    const { baseUrl, baseUrlApi, jobboard } = useContext(JobBoardContext) as JobBoardContextValue

    const windowSize = useWindowSize()
    const mobile = !!(windowSize.width && windowSize.width < 500)

    const router = useRouter()

    const { login } = useSession()

    // Prevent side effects if useEffect runs twice
    const effectRan = useRef(false)

    useEffect(() => {
        if (!effectRan.current) {
            const verifyToken = async () => {
                const tokenName = jobboard.title.toLowerCase().replace(' ', '_') + '_token'

                try {
                    const { data } = await axios.post(`${baseUrlApi}auth/callback/email`, router.query)
                    if (data) {
                        localStorage.setItem(tokenName, data.jwtToken)
                        axios.defaults.headers.common['Authorization'] = data.jwtToken
                        login(data.user)
                        router.push(router.query.callbackUrl as string)
                    }
                } catch (err) {
                    router.push('/')
                }
            }
            verifyToken()
        }
        return () => { effectRan.current = true }
    }, [])

    return (
        <div className={styles.container}>
            <Head>
                <title>{`${jobboard.title} | Sign in`}</title>
                <meta name="description" content="Sign in" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
        </div>
    )
}

export default Verify

export const getServerSideProps: GetServerSideProps = async (context) => {
    return { props: {} }
}