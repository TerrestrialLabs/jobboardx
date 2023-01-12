import { Alert, Autocomplete, Box, Button, CircularProgress, FilledInput, FormControl, FormHelperText, TextField, Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import type { NextPage } from 'next'
import Head from 'next/head'
import React, { useContext, useEffect, useState } from 'react'
import styles from '../styles/Home.module.css'
import { useWindowSize } from '../hooks/hooks'
import { JobBoardContext, JobBoardContextValue } from '../context/JobBoardContext'
import { useRouter } from 'next/router'
import { AUTH_STATUS, ROLE } from '../const/const'
import { useSession } from '../context/SessionContext'
import axiosInstance from '../api/axios'

const ERROR = {
    EMPTY: 'Field cannot be empty',
    URL: 'Invalid url format'
}

const initErrors: { [key: string]: string } = {
    title: '',
    domain: '',
    company: '',
    homeTitle: '',
    homeSubtitle: '',
    heroImage: '',
    logoImage: '',
    skills: '',
    priceRegular: '',
    priceFeatured: '',
    searchQuery: ''
}

const initState = {
    title: '',
    domain: '',
    company: '',
    homeTitle: '',
    homeSubtitle: '',
    heroImage: 'https://media.istockphoto.com/id/1252581438/photo/retro-starburst-sunburst-background-pattern-and-vintage-color-palette-of-orange-red-beige.jpg?b=1&s=170667a&w=0&k=20&c=_PzHPg3EOXvmH5nwHrOtVYK8pFjI_-2G-8A5jKQCPEE=',
    logoImage: '',
    skills: [] as string[],
    priceRegular: 49,
    priceFeatured: 99,
    searchQuery: ''
}

const initTwitterKeys = {
    apiKey: '',
    apiKeySecret: '',
    accessToken: '',
    accessTokenSecret: '',
    bearerToken: ''
}

const initTwitterKeysErrors: { [key: string]: string } = {
    apiKey: '',
    apiKeySecret: '',
    accessToken: '',
    accessTokenSecret: '',
    bearerToken: ''
}

const JobBoard: NextPage = () => {
    const { baseUrlApi, jobboard } = useContext(JobBoardContext) as JobBoardContextValue

    const { user, status } = useSession()
    const [signedIn, setSignedIn] = useState(false)

    const router = useRouter()

    const [form, setForm] = useState(initState)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState(initErrors)
    const [submitted, setSubmitted] = useState(false)
    const showErrorMessage = Object.keys(errors).some(field => errors[field])

    const [hasTwitterKeys, setHasTwitterKeys] = useState(false)
    const [editTwitterKeys, setEditTwitterKeys] = useState(false)
    const [twitterKeys, setTwitterKeys] = useState(initTwitterKeys)
    const [twitterKeysErrors, setTwitterKeysErrors] = useState(initTwitterKeysErrors)
    const [twitterKeysLoading, setTwitterKeysLoading] = useState(false)
    const [twitterKeysDeleting, setTwitterKeysDeleting] = useState(false)

    const windowSize = useWindowSize()
    const mobile = !!(windowSize.width && windowSize.width < 500 )

    // @ts-ignore
    const accessDenied = status === AUTH_STATUS.UNAUTHENTICATED || (user && user?.role !== ROLE.ADMIN && user?.role !== ROLE.SUPERADMIN)

    const fetchJobboard = async () => {
        const { data } = await axiosInstance.get(`${baseUrlApi}jobboards/admin`)
        setForm({
            ...initState,
            title: data.title,
            domain: data.domain,
            company: data.company,
            homeTitle: data.homeTitle,
            homeSubtitle: data.homeSubtitle,
            heroImage: data.heroImage,
            logoImage: data.logoImage,
            skills: data.skills,
            priceRegular: data.priceRegular,
            priceFeatured: data.priceFeatured,
            searchQuery: data.searchQuery
        })

        const { data: value } = await axiosInstance.get(`${baseUrlApi}twitter/keys?jobboardId=${data._id}`)
        setHasTwitterKeys(value)
        setEditTwitterKeys(!value)
    }

    useEffect(() => {
        if (user) {
            setSignedIn(true)
            fetchJobboard()
        }
    }, [user])

    useEffect(() => {
        if (accessDenied) {
            router.push('/')
        }
    }, [status])

    // Logout
    if (status === 'loading' || (signedIn && status === AUTH_STATUS.UNAUTHENTICATED)) {
        return (
            <Box height='100vh' display='flex' alignItems='center' justifyContent='center'>
                <CircularProgress color='secondary' size={22} />
            </Box>
        )
    }
    
    if (accessDenied) {
        return (
            <Box height='100vh' display='flex' alignItems='center' justifyContent='center'>
                <Typography>Access Denied</Typography>
            </Box>
        )
    }

    const handleTwitterInputChange = (e: { persist: () => void; target: { name: any; value: any } }) => {
        e.persist()
        setTwitterKeys({ ...twitterKeys, [e.target.name]: e.target.value })
    }

    const handleInputChange = (e: { persist: () => void; target: { name: any; value: any } }) => {
        e.persist()
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSkillsChange = (value: string[]) => {
        setForm({ ...form, skills: value })
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
            const res = await axiosInstance.put(`${baseUrlApi}jobboards/admin`, form)
            if (res.status === 200) {
                setErrors(initErrors)
                setSubmitted(true)
                scrollTo(0, 0)
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

    const submitTwitterKeys = async () => {
        const isValid = validateTwitterKeys()
        if (!isValid) {
            return
        }
        setTwitterKeysLoading(true)
        setTwitterKeysErrors(initErrors)
        try {
            await axiosInstance.post(`${baseUrlApi}twitter/keys`, { jobboardId: jobboard._id, ...twitterKeys })

            setTwitterKeysErrors(initTwitterKeysErrors)
            setTwitterKeys(initTwitterKeys)
            setHasTwitterKeys(true)
            setEditTwitterKeys(false)

        } catch (err) {
            console.log(err)
        } finally {
            setTwitterKeysLoading(false)
        }
    }

    const validateTwitterKeys = () => {
        let isValid = true
        const newErrors = Object.assign({}, initErrors)

        for (const field in twitterKeys) {
            // @ts-ignore
            if ((typeof twitterKeys[field] === 'string' && !twitterKeys[field].trim())) {
                newErrors[field] = ERROR.EMPTY
                isValid = false
            }
        }

        setTwitterKeysErrors(newErrors)

        return isValid
    }

    const deleteTwitterKeys = async () => {
        setTwitterKeysDeleting(true)
        try {
            const res = await axiosInstance.delete(`${baseUrlApi}twitter/keys?jobboardId=${jobboard._id}`)
            if (res.status === 200) {
                setTwitterKeys(initTwitterKeys)
                setHasTwitterKeys(false)
                setEditTwitterKeys(true)
            }
        } catch (err) {
            console.log(err)
        } finally {
            setTwitterKeysDeleting(false)
        }
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>Job Board | Update</title>
                <meta name="description" content="Contact" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main} style={{backgroundColor: '#f5f5f5', paddingTop: 58}}>
                <Grid container justifyContent='center' pb={mobile ? 2 : 4}>
                    <Grid xs={12} sm={10} lg={8} p={2} pt={0} pb={mobile ? 0 : 2}>
                        <Box p={mobile ? 2 : 4} pt={mobile ? 3 : 4} pb={mobile ? 3 : 4} sx={{ backgroundColor: '#fff', borderRadius: 1 }}>
                            <Typography variant='h1' fontWeight='bold' fontSize={mobile ? 22 : 30}>Update Job Board</Typography>
                        </Box>
                    </Grid>

                    <Grid xs={12} sm={10} lg={8} p={2} container>
                        <Grid xs={12} sm={12} pb={mobile ? 2 : 4}>
                            <Box p={mobile ? 2 : 4} pt={mobile ? 3 : 4} pb={mobile ? 3 : 4} sx={{ backgroundColor: '#fff', borderRadius: 1 }}>
                                <Grid container spacing={2}>
                                    {showErrorMessage && (
                                        <Grid xs={12}>
                                            <Alert sx={{ marginBottom: mobile ? 1 : 2}} severity="error">Please fix the following errors and resubmit.</Alert>
                                        </Grid>
                                    )}

                                    {submitted && (
                                        <Grid xs={12}>
                                            <Alert sx={{ marginBottom: mobile ? 1 : 2}} severity="success">Your job board has been updated.</Alert>
                                        </Grid>
                                    )}

                                    <Grid xs={12} sm={6}>
                                        <FormControl hiddenLabel fullWidth>
                                            <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Title</Typography>
                                            <FilledInput error={!!errors['title']} disableUnderline={!errors['title']} onChange={handleInputChange} name='title' value={form.title} autoComplete='off' inputProps={{ label: 'Title' }} required placeholder='Title' fullWidth />
                                            <FormHelperText error>{errors['title']}</FormHelperText>
                                        </FormControl>
                                    </Grid>

                                    <Grid xs={12} sm={6}>
                                        <FormControl hiddenLabel fullWidth>
                                            <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Domain</Typography>
                                            <FilledInput error={!!errors['domain']} disableUnderline={!errors['domain']} onChange={handleInputChange} name='domain' value={form.domain} autoComplete='off' inputProps={{ label: 'Domain' }} required placeholder='Domain' fullWidth />
                                            <FormHelperText error>{errors['domain']}</FormHelperText>
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
                                            <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Home Page Title</Typography>
                                            <FilledInput error={!!errors['homeTitle']} disableUnderline={!errors['homeTitle']} onChange={handleInputChange} name='homeTitle' value={form.homeTitle} autoComplete='off' inputProps={{ label: 'Home Page Title' }} required placeholder='Home Page Title' fullWidth />
                                            <FormHelperText error>{errors['homeTitle']}</FormHelperText>
                                        </FormControl>
                                    </Grid>

                                    <Grid xs={12} sm={6}>
                                        <FormControl hiddenLabel fullWidth>
                                            <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Home Page Subtitle</Typography>
                                            <FilledInput error={!!errors['homeSubtitle']} disableUnderline={!errors['homeSubtitle']} onChange={handleInputChange} name='homeSubtitle' value={form.homeSubtitle} autoComplete='off' inputProps={{ label: 'Home Page Subtitle' }} required placeholder='Home Page Subtitle' fullWidth />
                                            <FormHelperText error>{errors['homeSubtitle']}</FormHelperText>
                                        </FormControl>
                                    </Grid>

                                    <Grid xs={12} sm={6}>
                                        <FormControl hiddenLabel fullWidth>
                                            <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Hero Image</Typography>
                                            <FilledInput error={!!errors['heroImage']} disableUnderline={!errors['heroImage']} onChange={handleInputChange} name='heroImage' value={form.heroImage} autoComplete='off' inputProps={{ label: 'Hero Image' }} required placeholder='Hero Image' fullWidth />
                                            <FormHelperText error>{errors['heroImage']}</FormHelperText>
                                        </FormControl>
                                    </Grid>

                                    <Grid xs={12} sm={6}>
                                        <FormControl hiddenLabel fullWidth>
                                            <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Logo Image</Typography>
                                            <FilledInput error={!!errors['logoImage']} disableUnderline={!errors['logoImage']} onChange={handleInputChange} name='logoImage' value={form.logoImage} autoComplete='off' inputProps={{ label: 'Logo Image' }} required placeholder='Logo Image' fullWidth />
                                            <FormHelperText error>{errors['logoImage']}</FormHelperText>
                                        </FormControl>
                                    </Grid>

                                    <Grid xs={12} sm={6}>
                                        <FormControl hiddenLabel fullWidth>
                                            <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Backfill Search Query</Typography>
                                            <FilledInput error={!!errors['searchQuery']} disableUnderline={!errors['searchQuery']} onChange={handleInputChange} name='searchQuery' value={form.searchQuery} autoComplete='off' inputProps={{ label: 'Backfill Search Query' }} required placeholder='Backfill Search Query' fullWidth />
                                            <FormHelperText error>{errors['searchQuery']}</FormHelperText>
                                        </FormControl>
                                    </Grid>

                                    <Grid xs={12}>
                                        <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Skills</Typography>
                                        <Autocomplete
                                            freeSolo
                                            autoSelect
                                            multiple
                                            disableClearable
                                            disablePortal
                                            renderInput={(params) => <TextField error={!!errors['skills']} variant='filled' {...params} InputProps={{...params.InputProps, disableUnderline: !errors['skills'], placeholder: form.skills.length ? '' : 'Select one or type & hit Enter', style: { padding: '9px 12px 10px' }}} />}
                                            options={jobboard.skills}
                                            onChange={(e, value) => handleSkillsChange(value || '')}
                                            value={form.skills}
                                        />
                                        <FormHelperText sx={{ marginLeft: '14px', marginRight: '14px' }} error>{errors['skills']}</FormHelperText>
                                    </Grid>

                                    <Grid xs={6}>
                                        <FormControl hiddenLabel fullWidth>
                                            <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Regular Post Price <span style={{ fontWeight: 'normal' }}>(USD)</span></Typography>
                                            <FilledInput error={!!errors['priceRegular']} disableUnderline={!errors['priceRegular']}  type='number' fullWidth onChange={handleInputChange} name='priceRegular' value={form.priceRegular} autoComplete='off' required placeholder='Regular Post Price' sx={{ marginRight: '0.25rem' }}  inputProps={{ min: "0", max: "9999", step: "1" }} />
                                            <FormHelperText error>{errors['priceRegular']}</FormHelperText>
                                        </FormControl>
                                    </Grid>

                                    <Grid xs={6}>
                                        <FormControl hiddenLabel fullWidth>
                                            <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Featured Post Price <span style={{ fontWeight: 'normal' }}>(USD)</span></Typography>
                                            <FilledInput error={!!errors['priceFeatured']} disableUnderline={!errors['priceFeatured']}  type='number' fullWidth onChange={handleInputChange} name='priceFeatured' value={form.priceFeatured} autoComplete='off' required placeholder='Featured Post Price' inputProps={{ min: "0", max: "9999", step: "1" }} />
                                            <FormHelperText error>{errors['priceFeatured']}</FormHelperText>
                                        </FormControl>
                                    </Grid>

                                    <Grid xs={12} pt={2} display='flex' justifyContent='center'>
                                        <Button fullWidth={mobile} disabled={loading} onClick={submit} variant='contained' disableElevation color='primary' sx={{ width: '200px' }}>
                                            {loading ? <CircularProgress color='secondary' size={22} /> : 'Submit'}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>

                            <Box p={mobile ? 2 : 4} pt={mobile ? 3 : 4} pb={mobile ? 3 : 4} mt={mobile ? 2 : 4} sx={{ backgroundColor: '#fff', borderRadius: 1 }}>
                                <Grid container spacing={2}>
                                    <Grid xs={12}>
                                        <Typography sx={{ fontSize: 20, fontWeight: 'bold', marginBottom: '0.25rem' }}>Twitter API</Typography>
                                    </Grid>

                                    <Grid xs={12} sm={6}>
                                        <FormControl hiddenLabel fullWidth>
                                            <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>API Key</Typography>
                                            {hasTwitterKeys ? <Typography>***</Typography> : 
                                            (
                                                <>
                                                    <FilledInput error={!!twitterKeysErrors['apiKey']} disableUnderline={!twitterKeysErrors['apiKey']} fullWidth onChange={handleTwitterInputChange} name='apiKey' value={twitterKeys.apiKey} autoComplete='off' required placeholder='API Key' />
                                                    <FormHelperText error>{twitterKeysErrors['apiKey']}</FormHelperText>
                                                </>
                                            )}
                                        </FormControl>
                                    </Grid>

                                    <Grid xs={12} sm={6}>
                                        <FormControl hiddenLabel fullWidth>
                                            <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>API Key Secret</Typography>
                                            {hasTwitterKeys ? <Typography>***</Typography> : 
                                            (
                                                <>
                                                    <FilledInput error={!!twitterKeysErrors['apiKeySecret']} disableUnderline={!twitterKeysErrors['apiKeySecret']} fullWidth onChange={handleTwitterInputChange} name='apiKeySecret' value={twitterKeys.apiKeySecret} autoComplete='off' required placeholder='API Key Secret' />
                                                    <FormHelperText error>{twitterKeysErrors['apiKeySecret']}</FormHelperText>
                                                </>
                                            )}
                                        </FormControl>
                                    </Grid>

                                    <Grid xs={12} sm={6}>
                                        <FormControl hiddenLabel fullWidth>
                                            <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Access Token</Typography>
                                            {hasTwitterKeys ? <Typography>***</Typography> : 
                                            (
                                                <>
                                                    <FilledInput error={!!twitterKeysErrors['accessToken']} disableUnderline={!twitterKeysErrors['accessToken']} fullWidth onChange={handleTwitterInputChange} name='accessToken' value={twitterKeys.accessToken} autoComplete='off' required placeholder='Access Token' />
                                                    <FormHelperText error>{twitterKeysErrors['accessToken']}</FormHelperText>
                                                </>
                                            )}
                                        </FormControl>
                                    </Grid>

                                    <Grid xs={12} sm={6}>
                                        <FormControl hiddenLabel fullWidth>
                                            <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Access Token Secret</Typography>
                                            {hasTwitterKeys ? <Typography>***</Typography> : 
                                            (
                                                <>
                                                    <FilledInput error={!!twitterKeysErrors['accessTokenSecret']} disableUnderline={!twitterKeysErrors['accessTokenSecret']} fullWidth onChange={handleTwitterInputChange} name='accessTokenSecret' value={twitterKeys.accessTokenSecret} autoComplete='off' required placeholder='Access Token Secret' />
                                                    <FormHelperText error>{twitterKeysErrors['accessTokenSecret']}</FormHelperText>
                                                </>
                                            )}
                                        </FormControl>
                                    </Grid>

                                    <Grid xs={12} sm={6}>
                                        <FormControl hiddenLabel fullWidth>
                                            <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Bearer Token</Typography>
                                            {hasTwitterKeys ? <Typography>***</Typography> : 
                                            (
                                                <>
                                                    <FilledInput error={!!twitterKeysErrors['bearerToken']} disableUnderline={!twitterKeysErrors['bearerToken']} fullWidth onChange={handleTwitterInputChange} name='bearerToken' value={twitterKeys.bearerToken} autoComplete='off' required placeholder='Bearer Token' />
                                                    <FormHelperText error>{twitterKeysErrors['bearerToken']}</FormHelperText>
                                                </>
                                            )}
                                        </FormControl>
                                    </Grid>

                                    <Grid xs={12} pt={2} display='flex' justifyContent='center'>
                                        {hasTwitterKeys ?
                                        (
                                            <Button fullWidth={mobile} disabled={twitterKeysDeleting} onClick={deleteTwitterKeys} variant='contained' disableElevation color='error' sx={{ width: '200px' }}>
                                                {twitterKeysDeleting ? <CircularProgress color='secondary' size={22} /> : 'Delete'}
                                            </Button>
                                        ) : 
                                        (
                                            <Button fullWidth={mobile} disabled={twitterKeysLoading} onClick={submitTwitterKeys} variant='contained' disableElevation color='primary' sx={{ width: '200px' }}>
                                                {twitterKeysLoading ? <CircularProgress color='secondary' size={22} /> : 'Save'}
                                            </Button>
                                        )}
                                    </Grid>
                                </Grid>
                            </Box>
                        </Grid>
                    </Grid>
                </Grid>
            </main>
        </div>
    )
}

export default JobBoard