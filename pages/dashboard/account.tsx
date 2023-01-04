import { Alert, Box, Button, CircularProgress, FilledInput, FormControl, FormHelperText, IconButton, Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import React, { useContext, useEffect, useState } from 'react'
import styles from '../../styles/Home.module.css'
import { useWindowSize } from '../../hooks/hooks'
import { JobBoardContext, JobBoardContextValue } from '../../context/JobBoardContext'
import Dashboard from '../../components/Dashboard'
import { UserType } from '../../models/User'
import { Close } from '@mui/icons-material'
import axios from 'axios'
import axiosInstance from '../../api/axios'
import { useSession } from '../../context/SessionContext'

const ERROR = {
    EMPTY: 'Field cannot be empty',
    EMAIL: 'Invalid email format',
    DUPLICATE_EMAIL: 'An account with this email already exists',
}

const initErrors: { [key: string]: string } = {
    email: ''
}

const initState = {
    email: ''
}

const Account: NextPage = () => {
    const { baseUrlApi, jobboard } = useContext(JobBoardContext) as JobBoardContextValue

    const session = useSession()

    const [form, setForm] = useState(initState)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState(initErrors)
    const [submitted, setSubmitted] = useState(false)
    const [formLoaded, setFormLoaded] = useState(false)

    const showErrorMessage = Object.keys(errors).some(field => errors[field])

    const user = session?.user as UserType

    const windowSize = useWindowSize()
    const mobile = !!(windowSize.width && windowSize.width < 500 )

    useEffect(() => {
        if (session?.user && !formLoaded) {
            const { email } = session.user
            setForm({ email: email as string })
            setFormLoaded(true)
        }
    }, [session?.user])

    const handleInputChange = (e: { persist: () => void; target: { name: any; value: any } }) => {
        e.persist()
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const validate = () => {
        let isValid = true
        const newErrors = Object.assign({}, initErrors)

        if (!isValidEmail(form.email.trim())) {
            newErrors['email'] = ERROR.EMAIL
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
    const submit = async () => {
        const isValid = validate()
        if (!isValid) {
            return
        }
        setLoading(true)
        try {
            if (session?.user) {
                const formData = new FormData()
                const userData = {
                    ...session.user,
                    email: form.email.trim()
                }

                formData.set('userData', JSON.stringify(userData))

                const updatedUserRes = await axiosInstance.put(`${baseUrlApi}auth/update`, formData, { 
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
                session.login(updatedUserRes.data)

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
        }
        
        setLoading(false)
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>{`${jobboard.title} | Dashboard: Account`}</title>
                <meta name="description" content="Dashboard: Account" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Dashboard content={(
                <Grid xs={12} pb={4}>
                    <Box sx={{ backgroundColor: '#fff', borderRadius: 1 }} p={mobile ? 2 : 4} pb={mobile ? 3 : 4}>
                        <Grid xs={12}>
                            {showErrorMessage && (
                                <Grid xs={12}>
                                    <Alert sx={{ marginBottom: 2}} severity="error">Please fix the following errors and resubmit.</Alert>
                                </Grid>
                            )}

                            {submitted && !showErrorMessage && (
                                <Grid xs={12}>
                                    <Alert sx={{ marginBottom: 2}} severity="success">Your account has been updated.</Alert>
                                </Grid>
                            )}

                            <Grid container spacing={2}>
                                <Grid xs={12}>
                                    <FormControl hiddenLabel fullWidth>
                                        <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Email Address</Typography>
                                        <FilledInput error={!!errors['email']} disableUnderline={!errors['email']} onChange={handleInputChange} name='email' value={form.email} autoComplete='off' inputProps={{ label: 'Email' }} required placeholder='Email' fullWidth />
                                        <FormHelperText error>{errors['email']}</FormHelperText>
                                    </FormControl>
                                </Grid>

                                <Grid xs={12} pt={2} display='flex' justifyContent='center'>
                                    <Button fullWidth={mobile} disabled={loading} onClick={submit} variant='contained' disableElevation color='primary' sx={{ width: mobile ? '100%' : '200px' }}>
                                        {loading ? <CircularProgress color='secondary' size={22} /> : 'Save'}
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Box>
                </Grid>
            )} />
        </div>
    )
}

export default Account

export const getServerSideProps: GetServerSideProps = async (context) => {
    return { props: {} }
}