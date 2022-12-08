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
import { getCsrfToken, signIn } from 'next-auth/react'

const ERROR = {
    EMPTY: 'Field cannot be empty',
    EMAIL: 'Invalid email format',
    PASSWORD_SHORT: 'Password should be at least 8 characters'
}

const initErrors: { [key: string]: string } = {
    email: ''
}

const initState = {
    email: ''
}

interface Props {
    csrfToken: string
}

const Login: NextPage<Props> = ({ csrfToken }) => {
    const { baseUrlApi, jobboard } = useContext(JobBoardContext) as JobBoardContextValue
    
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

    const submit = async () => {
        const isValid = validate()
        if (!isValid) {
            return
        }
        setLoading(true)
        setErrors(initErrors)
        setSubmitted(false)
        try {
            const res = await axios.post(`${baseUrlApi}auth/signin`, form)
            if (res.status === 201) {
                setErrors(initErrors)
                setSubmitted(true)
                setForm(initState)
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
        setErrors({ email: '' })
        setLoading(true)
        await signIn('email', { email: form.email })
        setLoading(false)
        setSubmitted(true)
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>{`${jobboard.title} | Sign in`}</title>
                <meta name="description" content="Sign in" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main} style={{backgroundColor: '#f5f5f5', paddingTop: 58}}>
                <Grid p={mobile ? 0 : 12} container justifyContent='center'>
                    {/* TO DO: Make or import reusable card component */}
                    <Grid xs={12} sm={4}>
                        <Box p={4} sx={{ backgroundColor: '#fff', borderRadius: 1 }}>
                            <Grid xs={12}>
                                <Box mb={4}><Typography fontWeight='bold' variant='h1' fontSize={22} align='center'>Employer Sign In</Typography></Box>
                            </Grid>

                            <input name="csrfToken" type="hidden" defaultValue={csrfToken} />

                            <Grid xs={12}>
                                <FormControl hiddenLabel fullWidth>
                                    <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Email address</Typography>
                                    <FilledInput error={!!errors['email']} disableUnderline={!errors['email']} onChange={handleInputChange} name='email' value={form.email} autoComplete='off' inputProps={{ label: 'Email address' }} required placeholder='you@example.com' fullWidth />
                                    <FormHelperText error>{errors['email']}</FormHelperText>
                                </FormControl>
                            </Grid>

                            <Grid xs={12} sm={12} pt={2} display='flex' justifyContent='center'>
                                <Button onClick={login} fullWidth={mobile} disabled={loading} variant='contained' disableElevation color='primary' sx={{ minWidth: '100%' }}>
                                    {loading ? <CircularProgress color='secondary' size={22} /> : 'Sign in'}
                                </Button>
                            </Grid>
                        </Box>
                    </Grid>
                </Grid>
            </main>
        </div>
    )
}

export default Login

export const getServerSideProps: GetServerSideProps = async (context) => {
    const csrfToken = await getCsrfToken(context)

    return { props: { csrfToken } }
}