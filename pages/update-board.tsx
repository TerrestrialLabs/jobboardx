import { Alert, Box, Button, CircularProgress, FilledInput, FormControl, FormHelperText, Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import type { NextPage } from 'next'
import Head from 'next/head'
import React, { useContext, useEffect, useState } from 'react'
import styles from '../styles/Home.module.css'
import axios from 'axios'
import { useWindowSize } from '../hooks/hooks'
import { JobBoardContext, JobBoardContextValue } from '../context/JobBoardContext'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { ROLE } from '../const/const'
// import { scrapeJobs } from '../scraper'

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
    priceFeatured: ''
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
    priceFeatured: 99
}

const JobBoard: NextPage = () => {
    const { baseUrlApi, jobboard } = useContext(JobBoardContext) as JobBoardContextValue
    
    const { data: session, status } = useSession()
    const [signedIn, setSignedIn] = useState(false)

    const router = useRouter()

    const [form, setForm] = useState(initState)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState(initErrors)
    const [submitted, setSubmitted] = useState(false)
    const showErrorMessage = Object.keys(errors).some(field => errors[field])

    const [searchTerm, setSearchTerm] = useState('')
    const [backfillingJobs, setBackfillingJobs] = useState(false)
    const [backfillError, setBackfillError] = useState(false)
    const [backfillSuccess, setBackfillSuccess] = useState(false)
    const [numBackfilled, setNumBackfilled] = useState(0)

    const windowSize = useWindowSize()
    const mobile = !!(windowSize.width && windowSize.width < 500 )

    // @ts-ignore
    const accessDenied = status === 'unauthenticated' || (session?.user && session?.user?.role !== ROLE.ADMIN && session?.user?.role !== ROLE.SUPERADMIN)

    const backfillJobs = async () => {
        // setBackfillError(false)
        // setBackfillingJobs(true)
        // try {
        //     const res = await scrapeJobs()
        //     console.log("RES: ", res)
        //     setBackfillSuccess(true)
        // } catch (err) {
        //     console.log(err)
        // }
        // setBackfillingJobs(false)
    }

    const handleSearchTermChange = (value: string) => {
        setSearchTerm(value)
    }

    useEffect(() => {
        setForm({
            ...initState,
            title: jobboard.title,
            domain: jobboard.domain,
            company: jobboard.company,
            homeTitle: jobboard.homeTitle,
            homeSubtitle: jobboard.homeSubtitle,
            heroImage: jobboard.heroImage,
            logoImage: jobboard.logoImage,
            skills: jobboard.skills,
            priceRegular: jobboard.priceRegular,
            priceFeatured: jobboard.priceFeatured
        })
    }, [jobboard])

    useEffect(() => {
        if (session?.user) {
            setSignedIn(true)
        }
    }, [session?.user])

    useEffect(() => {
        if (accessDenied) {
            router.push('/')
        }
    }, [status])

    // Logout
    if (status === 'loading' || (signedIn && status === 'unauthenticated')) {
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
            const res = await axios.post(`${baseUrlApi}jobboards`, form)
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
                                    {backfillError && (
                                        <Grid xs={12}>
                                            <Alert sx={{ marginBottom: mobile ? 1 : 2}} severity="error">An error occurred.</Alert>
                                        </Grid>
                                    )}

                                    {backfillSuccess && (
                                        <Grid xs={12}>
                                            <Alert sx={{ marginBottom: mobile ? 1 : 2}} severity="success">{numBackfilled} jobs have been backfilled.</Alert>
                                        </Grid>
                                    )}

                                    <Grid xs={12}>
                                        <FormControl hiddenLabel fullWidth>
                                            <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Search Term</Typography>
                                            <FilledInput disableUnderline onChange={e => handleSearchTermChange(e.target.value)} name='searchTerm' value={searchTerm} autoComplete='off' inputProps={{ label: 'Search term' }} required placeholder='Search term' fullWidth />
                                        </FormControl>
                                    </Grid>

                                    {/* <Grid xs={12}>
                                        <Typography textAlign='center'>14 total backfilled jobs</Typography>
                                    </Grid> */}

                                    <Grid xs={12} pt={2} display='flex' justifyContent='center'>
                                        <Button fullWidth={mobile} disabled={backfillingJobs} onClick={backfillJobs} variant='contained' disableElevation color='primary' sx={{ width: '200px' }}>
                                            {backfillingJobs ? <CircularProgress color='secondary' size={22} /> : 'Backfill jobs'}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Grid>

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
                                            <Alert sx={{ marginBottom: mobile ? 1 : 2}} severity="success">Your job board has been created.</Alert>
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
                                            <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Skills
                                            </Typography>
                                            <FilledInput error={!!errors['skills']} disableUnderline={!errors['skills']} onChange={handleInputChange} name='skills' value={form.skills} autoComplete='off' inputProps={{ label: 'Skills' }} required placeholder='Skills separated by commas' fullWidth />
                                            <FormHelperText error>{errors['skills']}</FormHelperText>
                                        </FormControl>
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
                        </Grid>
                    </Grid>
                </Grid>
            </main>
        </div>
    )
}

export default JobBoard