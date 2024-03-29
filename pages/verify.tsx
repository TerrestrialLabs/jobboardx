import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import React, { useContext, useEffect, useRef } from 'react'
import styles from '../styles/Home.module.css'
import axios from 'axios'
import axiosInstance from '../api/axios'
import { useWindowSize } from '../hooks/hooks'
import { JobBoardContext, JobBoardContextValue } from '../context/JobBoardContext'
import { useRouter } from 'next/router'
import { useSession } from '../context/SessionContext'

const Verify: NextPage = () => {
    const { baseUrl, baseUrlApi, jobboard, isAdminSite } = useContext(JobBoardContext) as JobBoardContextValue

    const windowSize = useWindowSize()
    const mobile = !!(windowSize.width && windowSize.width < 500)

    const router = useRouter()

    const { login } = useSession()

    // Prevent side effects if useEffect runs twice
    const effectRan = useRef(false)

    useEffect(() => {
        if (!effectRan.current) {
            const verifyToken = async () => {
                try {
                    const { data } = await axios.post(`${baseUrlApi}auth/email-callback`, router.query)
                    if (data) {
                        axios.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`
                        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`

                        login(data.user)

                        router.push(router.query.callbackUrl as string)
                    }
                } catch (err) {
                    router.push('/login-error')
                }
            }
            verifyToken()
        }
        return () => { effectRan.current = true }
    }, [])

    return (
        <div className={styles.container}>
            <Head>
                <title>{isAdminSite ? 'JobBoardX' : jobboard.title} | Sign in</title>
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