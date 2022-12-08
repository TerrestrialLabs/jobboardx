import { Alert, Box, Button, CircularProgress, FilledInput, FormControl, FormHelperText, IconButton, Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import React, { useContext, useState } from 'react'
import styles from '../styles/Home.module.css'
import Link from 'next/link'
import axios, { AxiosError } from 'axios'
import { useWindowSize } from '../hooks/hooks'
import { JobBoardContext, JobBoardContextValue } from '../context/JobBoardContext'
import { getCsrfToken, signIn } from 'next-auth/react'
import { Close } from '@mui/icons-material'

// TO DO: Import from const
const ERROR = {
    EMPTY: 'Field cannot be empty',
    EMAIL: 'Invalid email format',
    EMAIL_CONFIRMATION: 'Email confirmation does not match email',
    WEBSITE_LINK: 'Invalid link format [https://www.example.com]',
    DUPLICATE_EMAIL: 'A company with this email already exists',
    DUPLICATE_COMPANY: 'A company with this name already exists'
}

const initErrors: { [key: string]: string } = {
    email: '',
    emailConfirmation: '',
    company: '',
    website: ''
}

const initState = {
    email: '',
    emailConfirmation: '',
    company: '',
    website: ''
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

    const [imageFileName, setImageFileName] = useState('')
    const [imagePreviewSource, setImagePreviewSource] = useState<string | ArrayBuffer | null>('')
    const [logo, setLogo] = useState<FormData>()
    const [logoError, setLogoError] = useState(false)
    const [logoUrl, setLogoUrl] = useState('')

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

        if (!isValidHttpUrl(form.website.trim())) {
            newErrors['website'] = ERROR.WEBSITE_LINK
        }

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

    const isValidHttpUrl = (text: string) => {
        let url
        try {
            url = new URL(text)
        } catch (_) {
            return false
        }
        return url.protocol === "http:" || url.protocol === "https:"
    }

    const isValidEmail = (email: string) => {
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
            return (true)
        } else {
            return (false)
        }
    }

        // TO DO
    // @ts-ignore
    const handleFileInputChange = (e: ChangeEventHandler<HTMLInputElement>) => {
        const file = e.target.files[0]
        const fileSize = Math.round(file.size / 1024)
        if (fileSize > 10000) {
            setLogoError(true)
            return
        }
        
        setLogoError(false)
        setLogoUrl('')
        const formData = new FormData()
        formData.append('image', file)
        setLogo(formData)

        const fileReader = new FileReader()
        fileReader.readAsDataURL(file)
        fileReader.onloadend = () => {
            setImagePreviewSource(fileReader.result)
            setImageFileName(file.name)
        }
    }

    const removeLogo = () => {
        setImageFileName('')
        setImagePreviewSource('')
        setLogo(undefined)
        setLogoError(false)
        setLogoUrl('')
    }

    // TO DO: Validate urls - provide https if absent or add prefix before input
    const signUp = async () => {
        const isValid = validate()
        if (!isValid) {
            return
        }
        setLoading(true)
        try {
            const formData = logo ? logo : new FormData()

            const employerData = { 
                jobboardId: jobboard._id,
                email: form.email.trim().toLowerCase(),
                company: form.company.trim(),
                website: form.website.trim(),
                logo: logoUrl ? logoUrl : '',
            }

            formData.set('employerData', JSON.stringify(employerData))

            const res = await axios.post(`${baseUrlApi}auth/signup`, formData, { 
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            console.log('res: ', res)
            
            // res.status === 201 && router.push(`/jobs/${res.data._id}`)

            if (res.status === 201) {
                // TO DO: Sign in employer - send verification email (give them a month?)
                await signIn('email', { email: form.email })
            }
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const message = err?.response?.data
                if (message && message.includes('duplicate')) {
                    if (message.includes('email')) {
                        setErrors({ email: ERROR.DUPLICATE_EMAIL })
                    }
                    if (message.includes('company')) {
                        setErrors({ company: ERROR.DUPLICATE_COMPANY })
                    }
                }
            } else {
                console.log(err)
            }

            setLoading(false)
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
                <Grid p={mobile ? 2 : 12} container justifyContent='center'>
                    {/* TO DO: Make or import reusable card component */}
                    <Grid xs={12} sm={10} lg={8}>
                        <Box p={mobile ? 2 : 4} pt={mobile ? 3 : 4} pb={mobile ? 3 : 4} sx={{ backgroundColor: '#fff', borderRadius: 1 }}>
                            <Grid xs={12}>
                                <Box mb={showErrorMessage ? 2 : 4}><Typography fontWeight='bold' variant='h1' fontSize={22} align='center'>Employer Sign Up</Typography></Box>
                            </Grid>

                            <input name="csrfToken" type="hidden" defaultValue={csrfToken} />

                            {showErrorMessage && (
                                <Grid xs={12}>
                                    <Alert sx={{ marginBottom: 2}} severity="error">Please fix the following errors and resubmit.</Alert>
                                </Grid>
                            )}

                            <Grid container spacing={2}>
                                <Grid xs={12} sm={6}>
                                    <FormControl hiddenLabel fullWidth>
                                        <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Email Address</Typography>
                                        <FilledInput error={!!errors['email']} disableUnderline={!errors['email']} onChange={handleInputChange} name='email' value={form.email} autoComplete='off' inputProps={{ label: 'Email address' }} required placeholder='you@example.com' fullWidth />
                                        <FormHelperText error>{errors['email']}</FormHelperText>
                                    </FormControl>
                                </Grid>

                                <Grid xs={12} sm={6}>
                                    <FormControl hiddenLabel fullWidth>
                                        <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Confirm Email Address</Typography>
                                        <FilledInput error={!!errors['emailConfirmation']} disableUnderline={!errors['emailConfirmation']} onChange={handleInputChange} name='emailConfirmation' value={form.emailConfirmation} autoComplete='off' inputProps={{ label: 'Email Confirmation' }} required placeholder='you@example.com' fullWidth />
                                        <FormHelperText error>{errors['emailConfirmation']}</FormHelperText>
                                    </FormControl>
                                </Grid>

                                <Grid xs={12} sm={6}>
                                    <FormControl hiddenLabel fullWidth>
                                        <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Company</Typography>
                                        <FilledInput error={!!errors['company']} disableUnderline={!errors['company']} onChange={handleInputChange} name='company' value={form.company} autoComplete='off' inputProps={{ label: 'Company' }} required placeholder='Company' fullWidth />
                                        <FormHelperText error>{errors['company']}</FormHelperText>
                                    </FormControl>
                                </Grid>

                                <Grid xs={12} sm={6}>
                                    <FormControl hiddenLabel fullWidth>
                                        <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Company Website</Typography>
                                        <FilledInput error={!!errors['website']} disableUnderline={!errors['website']} onChange={handleInputChange} name='website' value={form.website} autoComplete='off' inputProps={{ label: 'Company Website' }} required placeholder='Company Website' fullWidth />
                                        <FormHelperText error>{errors['website']}</FormHelperText>
                                    </FormControl>
                                </Grid>

                                <Grid xs={12}>
                                    <FormControl hiddenLabel fullWidth sx={{ position: 'relative' }}>
                                        <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Company Logo</Typography>
                                        <FilledInput disableUnderline value={mobile ? '' : imageFileName} disabled sx={{ paddingLeft: 15, backgroundColor: 'rgba(0, 0, 0, 0.06) !important'}} />
                                        <Button disableElevation variant="contained" component="label" style={{ position: 'absolute', marginTop: 38, left: '0.75rem' }}>
                                            Choose file
                                            <input onChange={handleFileInputChange} hidden accept="image/*" multiple type="file" />
                                        </Button>
                                        {imagePreviewSource && (
                                            <Box display='flex' alignItems='center' sx={{ backgroundColor: 'rgba(0, 0, 0, 0.06)', borderBottom: logoError ? '2px solid #ff1644' : 'none', padding: '0px 12px 17px', paddingBottom: mobile ? '8px' : '17px', height: '100px' }}>
                                                <img src={imagePreviewSource as string} alt='Logo preview' style={{ height: '100%' }} />
                                                <IconButton onClick={removeLogo} sx={{ marginLeft: 1 }}>
                                                    <Close fontSize='small' />
                                                </IconButton>
                                            </Box>
                                        )}
                                        {imagePreviewSource && mobile && <Typography sx={{ wordBreak: 'break-word', backgroundColor: 'rgba(0, 0, 0, 0.06)', padding: '0px 12px 17px', color: 'rgb(0, 0, 0, 0.38)' }}>{imageFileName}</Typography>}
                                        {logoError && <FormHelperText error>{'File too big, please select an image 10MB or less'}</FormHelperText>}
                                    </FormControl>
                                </Grid>

                                <Grid xs={12} pt={2} display='flex' justifyContent='center'>
                                    <Button fullWidth={mobile} disabled={loading} onClick={signUp} variant='contained' disableElevation color='primary' sx={{ width: mobile ? '100%' : '200px' }}>
                                        {loading ? <CircularProgress color='secondary' size={22} /> : 'Create Account'}
                                    </Button>
                                </Grid>
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