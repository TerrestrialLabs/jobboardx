import { Alert, Box, Button, CircularProgress, FilledInput, FormControl, FormHelperText, IconButton, Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import React, { useContext, useState } from 'react'
import styles from '../styles/Home.module.css'
import axios from 'axios'
import { useWindowSize } from '../hooks/hooks'
import { JobBoardContext, JobBoardContextValue } from '../context/JobBoardContext'
import { getCsrfToken, signIn } from 'next-auth/react'
import { Close } from '@mui/icons-material'
import CheckEmail from '../components/CheckEmail'

// TO DO: Import from const
const ERROR = {
    EMPTY: 'Field cannot be empty',
    EMAIL: 'Invalid email format',
    EMAIL_CONFIRMATION: 'Email confirmation does not match email',
    DUPLICATE_EMAIL: 'A company with this email already exists'
}

const initErrors: { [key: string]: string } = {
    email: '',
    emailConfirmation: ''
}

const initState = {
    email: '',
    emailConfirmation: ''
}

interface Props {
    csrfToken: string
}

const AdminSignUp: NextPage<Props> = ({ csrfToken }) => {
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

        if (form.email.trim().toLowerCase() !== form.emailConfirmation.trim().toLowerCase()) {
            newErrors['emailConfirmation'] = ERROR.EMAIL_CONFIRMATION
            isValid = false
        }

        if (!isValidEmail(form.email)) {
            newErrors['email'] = ERROR.EMAIL
            isValid = false
        }

        for (const field in form) {
            // @ts-ignore
            if ((typeof form[field] === 'string' && !form[field].trim())) {
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

    // TO DO: Validate urls - provide https if absent or add prefix before input
    const signUp = async () => {
        const isValid = validate()
        if (!isValid) {
            return
        }
        setLoading(true)
        try {
            const res = await axios.post(`${baseUrlApi}auth/admin-signup`, { email: form.email.trim().toLowerCase() })
            
            if (res.status === 201) {
                await signIn('email', { email: form.email, redirect: false, callbackUrl: `${baseUrl}dashboard` })
                setSubmitted(true)
            }
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const message = err?.response?.data
                if (message && message.includes('duplicate')) {
                    if (message.includes('email')) {
                        setErrors({ email: ERROR.DUPLICATE_EMAIL })
                    }
                }
            } else {
                console.log(err)
            }

            setLoading(false)
        }
    }

    const handleKeyDown = (event: { key: string; preventDefault: () => void }) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            signUp()
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
                {submitted && <CheckEmail signup />}

                {!submitted && (               
                    <Grid p={mobile ? 2 : 12} container justifyContent='center'>
                        <Grid xs={12} sm={10} lg={8}>
                            <Box p={mobile ? 2 : 4} pt={mobile ? 3 : 4} pb={mobile ? 3 : 4} sx={{ backgroundColor: '#fff', borderRadius: 1 }}>
                                <Grid container>
                                    <Grid xs={12}>
                                        <Box mb={showErrorMessage ? 2 : 4}><Typography fontWeight='bold' variant='h1' fontSize={22} align='center'>Admin Sign Up</Typography></Box>
                                    </Grid>

                                    <input name="csrfToken" type="hidden" defaultValue={csrfToken} />

                                    {showErrorMessage && (
                                        <Grid xs={12}>
                                            <Alert sx={{ marginBottom: 2}} severity="error">Please fix the following errors and resubmit.</Alert>
                                        </Grid>
                                    )}

                                    <Grid xs={12} container spacing={2}>
                                        <Grid xs={12} md={6}>
                                            <FormControl hiddenLabel fullWidth>
                                                <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Email address</Typography>
                                                <FilledInput onKeyDown={handleKeyDown} error={!!errors['email']} disableUnderline={!errors['email']} onChange={handleInputChange} name='email' value={form.email} autoComplete='off' inputProps={{ label: 'Email address' }} required placeholder='you@example.com' fullWidth />
                                                <FormHelperText error>{errors['email']}</FormHelperText>
                                            </FormControl>
                                        </Grid>

                                        <Grid xs={12} md={6}>
                                            <FormControl hiddenLabel fullWidth>
                                                <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Confirm Email Address</Typography>
                                                <FilledInput error={!!errors['emailConfirmation']} disableUnderline={!errors['emailConfirmation']} onChange={handleInputChange} name='emailConfirmation' value={form.emailConfirmation} autoComplete='off' inputProps={{ label: 'Email Confirmation' }} required placeholder='you@example.com' fullWidth />
                                                <FormHelperText error>{errors['emailConfirmation']}</FormHelperText>
                                            </FormControl>
                                        </Grid>

                                        <Grid xs={12} pt={2} display='flex' justifyContent='center'>
                                            <Button fullWidth={mobile} disabled={loading} onClick={signUp} variant='contained' disableElevation color='primary' sx={{ width: mobile ? '100%' : '200px' }}>
                                                {loading ? <CircularProgress color='secondary' size={22} /> : 'Create Account'}
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Grid>
                    </Grid>
                )}

            </main>
        </div>
    )
}

export default AdminSignUp

export const getServerSideProps: GetServerSideProps = async (context) => {
    const csrfToken = await getCsrfToken(context)

    return { props: { csrfToken } }
}