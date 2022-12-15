import { Alert, Box, Button, CircularProgress, FilledInput, FormControl, FormHelperText, IconButton, Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import React, { useContext, useEffect, useState } from 'react'
import styles from '../../styles/Home.module.css'
import { useWindowSize } from '../../hooks/hooks'
import { JobBoardContext, JobBoardContextValue } from '../../context/JobBoardContext'
import Dashboard from '../../components/Dashboard'
import { useSession } from 'next-auth/react'
import { UserType } from '../../models/User'
import { Close } from '@mui/icons-material'
import axios from 'axios'

const ERROR = {
    EMPTY: 'Field cannot be empty',
    WEBSITE_LINK: 'Invalid link format [https://www.example.com]',
    DUPLICATE_COMPANY: 'A company with this name already exists'
}

const initErrors: { [key: string]: string } = {
    company: '',
    website: ''
}

const initState = {
    company: '',
    website: ''
}

const CompanyProfile: NextPage = () => {
    const { baseUrlApi, jobboard } = useContext(JobBoardContext) as JobBoardContextValue

    const { data: session } = useSession()

    const [form, setForm] = useState(initState)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState(initErrors)
    const [submitted, setSubmitted] = useState(false)
    const [formLoaded, setFormLoaded] = useState(false)

    const [imageFileName, setImageFileName] = useState('')
    const [imagePreviewSource, setImagePreviewSource] = useState<string | ArrayBuffer | null>('')
    const [logo, setLogo] = useState<FormData>()
    const [logoError, setLogoError] = useState(false)
    const [logoUrl, setLogoUrl] = useState('')

    const showErrorMessage = Object.keys(errors).some(field => errors[field])

    const user = session?.user as UserType

    const windowSize = useWindowSize()
    const mobile = !!(windowSize.width && windowSize.width < 500 )

    useEffect(() => {
        if (session?.user && !formLoaded) {
            // @ts-ignore
            const { company, logo, website } = session.user
            setLogoUrl(logo)
            setForm({
                company,
                website
            })
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

        if (!isValidHttpUrl(form.website.trim())) {
            newErrors['website'] = ERROR.WEBSITE_LINK
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

    const reloadSession = () => {
        const event = new Event("visibilitychange");
        document.dispatchEvent(event);
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
                const formData = logo ? logo : new FormData()

                const employerData = {
                    ...session.user,
                    company: form.company.trim(),
                    website: form.website.trim(),
                    logo: logoUrl ? logoUrl : '',
                }

                formData.set('employerData', JSON.stringify(employerData))
    
                await axios.put(`${baseUrlApi}auth/update`, formData, { 
                    headers: { 'Content-Type': 'multipart/form-data' }
                })

                await axios.get(`${baseUrlApi}auth/session?update`)

                setSubmitted(true)
                reloadSession()
            }
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const message = err?.response?.data
                if (message && message.includes('duplicate')) {
                    if (message.includes('company')) {
                        setErrors({ company: ERROR.DUPLICATE_COMPANY })
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
                <title>{`${jobboard.title} | Dashboard: Company profile`}</title>
                <meta name="description" content="Dashboard: Company profile" />
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
                                    <Alert sx={{ marginBottom: 2}} severity="success">Your company profile has been updated.</Alert>
                                </Grid>
                            )}

                            <Grid container spacing={2}>
                                <Grid xs={12} md={6}>
                                    <FormControl hiddenLabel fullWidth>
                                        <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Company</Typography>
                                        <FilledInput error={!!errors['company']} disableUnderline={!errors['company']} onChange={handleInputChange} name='company' value={form.company} autoComplete='off' inputProps={{ label: 'Company' }} required placeholder='Company' fullWidth />
                                        <FormHelperText error>{errors['company']}</FormHelperText>
                                    </FormControl>
                                </Grid>

                                <Grid xs={12} md={6}>
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

                                        {logoUrl && (
                                            <Box display='flex' alignItems='center' sx={{ backgroundColor: 'rgba(0, 0, 0, 0.06)', borderBottom: logoError ? '2px solid #ff1644' : 'none', padding: '0px 12px 17px', paddingBottom: mobile ? '8px' : '17px', height: '100px' }}>
                                                <img src={logoUrl} alt='Logo preview' style={{ height: '100%' }} />
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

export default CompanyProfile

export const getServerSideProps: GetServerSideProps = async (context) => {
    return { props: {} }
}