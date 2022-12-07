import { Alert, Box, Button, CircularProgress, FilledInput, FormControl, FormHelperText, Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import React, { useContext, useState } from 'react'
import styles from '../styles/Home.module.css'
import Link from 'next/link'
import axios from 'axios'
import { useWindowSize } from '../hooks/hooks'
import { JobBoardContext, JobBoardContextValue } from '../context/JobBoardContext'

const ERROR = {
    EMPTY: 'Field cannot be empty',
    EMAIL: 'Invalid email format',
    PASSWORD_SHORT: 'Password should be at least 8 characters'
}

const initErrors: { [key: string]: string } = {
    email: '',
    password: ''
}

const initState = {
    email: '',
    password: ''
}

const Contact: NextPage = () => {
    const { baseUrlApi, jobboard } = useContext(JobBoardContext) as JobBoardContextValue
    
    const [data, setData] = useState(initState)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState(initErrors)
    const [submitted, setSubmitted] = useState(false)

    const showErrorMessage = Object.keys(errors).some(field => errors[field])

    const windowSize = useWindowSize()
    const mobile = !!(windowSize.width && windowSize.width < 500 )

    const handleInputChange = (e: { persist: () => void; target: { name: any; value: any } }) => {
        e.persist()
        setData({ ...data, [e.target.name]: e.target.value })
    }

    const submit = async () => {
        const isValid = validate()
        if (!isValid) {
            return
        }
        setLoading(true)
        setErrors(initErrors)
        setSubmitted(false)
        try {
            const res = await axios.post(`${baseUrlApi}auth/signin`, data)
            if (res.status === 201) {
                setErrors(initErrors)
                setSubmitted(true)
                setData(initState)
            }
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }

    const validate = () => {
        let isValid = true
        const newErrors = Object.assign({}, initErrors)

        if (!isValidEmail(data.email)) {
            newErrors['email'] = ERROR.EMAIL
            isValid = false
        }
        for (const field in data) {
            // @ts-ignore
            if ((typeof data[field] === 'string' && !data[field].trim())) {
                newErrors[field] = ERROR.EMPTY
                isValid = false
            }
        }

        setErrors(newErrors)

        return isValid
    }

    const isValidEmail = (email: string) => {
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
            return (true)
        } else {
            return (false)
        }
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>{`${jobboard.title} | Sign in`}</title>
                <meta name="description" content="Sign in" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main} style={{backgroundColor: '#f5f5f5', paddingTop: 58}}>
                <Grid container>
                    <Grid>
                        <Box>
                            <Typography>Employer Sign In</Typography>
                        </Box>
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