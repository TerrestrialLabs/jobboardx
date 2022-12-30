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
import CheckEmail from '../components/CheckEmail'

const ERROR = {
    EMPTY: 'Field cannot be empty',
    EMAIL: 'Invalid email format',
    INVALID: 'An account with this email address was not found'
}

const initErrors: { [key: string]: string } = {
    email: ''
}

const initState = {
    email: ''
}

const Login: NextPage = () => {
    const { baseUrl, baseUrlApi, jobboard } = useContext(JobBoardContext) as JobBoardContextValue
    
    const [form, setForm] = useState(initState)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState(initErrors)
    const [submitted, setSubmitted] = useState(false)

    const showErrorMessage = Object.keys(errors).some(field => errors[field])

    const windowSize = useWindowSize()
    const mobile = !!(windowSize.width && windowSize.width < 500 )

    const handleInputChange = (e: { persist: () => void; target: { name: any; value: any } }) => {
        e.persist()
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const validate = () => {
        let isValid = true
        const newErrors = Object.assign({}, initErrors)

        if (!isValidEmail(form.email)) {
            newErrors['email'] = ERROR.EMAIL
            isValid = false
        }

        if (form.email.trim().length === 0) {
            newErrors.email = ERROR.EMPTY
            isValid = false
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

    const login = async () => {
        const isValid = validate()
        if (!isValid) {
            return
        }

        setErrors(initErrors)
        setLoading(true)
        try {
            await axios.post(`${baseUrlApi}auth/signin`, { email: form.email })
            setSubmitted(true)
        } catch (err) {
            // TO DO: Check for status & display message
            setErrors({ ...errors, email: ERROR.INVALID })
        }
        setLoading(false)
    }

    const handleKeyDown = (event: { key: string; preventDefault: () => void }) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            login()
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
                {submitted && <CheckEmail />}

                {!submitted && (               
                    <Grid p={mobile ? 2 : 12} container justifyContent='center'>
                        <Box p={mobile ? 2 : 4} pt={mobile ? 3 : 4} pb={mobile ? 3 : 4} sx={{ backgroundColor: '#fff', borderRadius: 1, width: 'mobile' ? 'auto' : '260px', maxWidth: mobile ? 'auto' : '420px' }}>
                            <Grid container>
                                <Grid xs={12}>
                                    <Box mb={showErrorMessage ? 2 : 4}><Typography fontWeight='bold' variant='h1' fontSize={22} align='center'>Employer Sign In</Typography></Box>
                                </Grid>

                                {showErrorMessage && (
                                    <Grid xs={12}>
                                        <Alert sx={{ marginBottom: 2}} severity="error">Please fix the following errors and resubmit.</Alert>
                                    </Grid>
                                )}

                                <Grid xs={12}>
                                    <FormControl hiddenLabel fullWidth>
                                        <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Email address</Typography>
                                        <FilledInput onKeyDown={handleKeyDown} error={!!errors['email']} disableUnderline={!errors['email']} onChange={handleInputChange} name='email' value={form.email} autoComplete='off' inputProps={{ label: 'Email address' }} required placeholder='you@example.com' fullWidth />
                                        <FormHelperText error>{errors['email']}</FormHelperText>
                                    </FormControl>
                                </Grid>

                                <Grid xs={12} sm={12} pt={2} display='flex' justifyContent='center'>
                                    <Button onClick={login} fullWidth={mobile} disabled={loading} variant='contained' disableElevation color='primary' sx={{ minWidth: '100%' }}>
                                        {loading ? <CircularProgress color='secondary' size={22} /> : 'Sign in'}
                                    </Button>
                                </Grid>

                                <Grid xs={12} pt={2} display='flex' justifyContent='center'>
                                    <Typography variant='caption' mr={0.5}>Not registered?</Typography>
                                    <Typography variant='caption' color='primary.main'><Link href='signup'>Create an account</Link></Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    </Grid>
                )}

            </main>
        </div>
    )
}

export default Login

export const getServerSideProps: GetServerSideProps = async (context) => {
    return { props: {} }
}