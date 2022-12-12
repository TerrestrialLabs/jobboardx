import { Alert, Autocomplete, Box, Button, Checkbox, CircularProgress, createFilterOptions, Divider, FilledInput, FormControl, FormHelperText, IconButton, MenuItem, Select, SelectChangeEvent, TextField, Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import React, { useContext, useEffect, useImperativeHandle, useRef, useState } from 'react'
import styles from '../styles/Home.module.css'
import type { JobData } from './api/jobs'
import { useRouter } from 'next/router'
import { PERKS, PRICE, SKILLS, TYPE, TYPE_MAP } from '../const/const'
import axios from 'axios'
import cities from '../data/world_cities.json'
import { TextEditorPlaceholder } from '../components/post/TextEditor'
import { deserialize, serialize } from '../utils/serialize'
import { useWindowSize } from '../hooks/hooks'
import { Close, Lock, Looks3, LooksOne, LooksTwo } from '@mui/icons-material'
import { loadStripe } from '@stripe/stripe-js'
import { CardNumberElement, CardExpiryElement, CardCvcElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js'
import countryCodes from '../data/country_codes.json'
import { useEditor } from '../hooks/editor'
import type { Node } from 'slate'
import dynamic from 'next/dynamic'
import { JobBoardContext, JobBoardContextValue } from '../context/JobBoardContext'
import { useSession } from 'next-auth/react'

// Slate doesn't play nicely with SSR, throws hydration error
const TextEditor = dynamic(() => import('../components/post/TextEditor'), {
    ssr: false
})

export type PostForm = {
    title: string
    company: string
    companyUrl: string
    type: string
    location: string
    remote: boolean
    skills: string[]
    perks: string[]
    featured: boolean
    applicationLink: string
    salaryMin: number
    salaryMax: number
}

// TO DO:
//  Level (j/m/s) field
//  Posting preview
//  Stepper

const ERROR = {
    EMPTY: 'Field cannot be empty',
    EMPTY_LOCATION: 'Location cannot be empty unless remote',
    SALARY_ORDER: 'Salary max cannot be less than salary min',
    SALARY_NEGATIVE: 'Salary cannot be negative',
    WEBSITE_LINK: 'Invalid link format [https://www.example.com]',
    APPLICATION_LINK: 'Invalid link format [https://www.example.com or email@example.com]',
    EMAIL: 'Invalid email format',
    EMAIL_CONFIRMATION: 'Email confirmation does not match email'
}

const SUPPORTED_CARDS = [
    "amex",
    "diners",
    "discover",
    "jcb",
    "mastercard",
    "unionpay",
    "visa"
]

const initEditorValue = [
    {
        type: 'paragraph',
        children: [{ text: '' }],
    }
]

const initJobDetails = {
    title: '',
    company: '',
    companyUrl: '',
    type: TYPE.FULLTIME,
    location: '',
    remote: false,
    // description: '',
    applicationLink: '',
    skills: [],
    perks: [],
    salaryMin: 0,
    salaryMax: 0,
    featured: true
}
// const initJobDetails = {
//     title: 'Test Stripe',
//     company: 'Test Stripe Co',
//     companyUrl: 'https://www.example.com',
//     type: TYPE.FULLTIME,
//     location: '',
//     remote: false,
//     applicationLink: 'https://www.example.com',
//     skills: ['HTML'],
//     perks: [],
//     salaryMin: 50000,
//     salaryMax: 100000,
//     featured: true
// }

const initBillingAddress = {
    firstName: '',
    lastName: '',
    email: '',
    emailConfirmation: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US'
}
// const initBillingAddress = {
//     firstName: 'Gregory',
//     lastName: 'A',
//     email: 'contact@goterrestrial.io',
//     emailConfirmation: 'contact@goterrestrial.io',
//     addressLine1: '12 Sherwood Crescent',
//     addressLine2: null,
//     city: 'Dix Hills',
//     state: 'NY',
//     postalCode: '11746',
//     country: 'US'
// }

const initJobDetailsErrors: { [key: string]: string | null } = {
    title: null,
    company: null,
    companyUrl: null,
    description: null,
    location: null,
    applicationLink: null,
    skills: null,
    salaryMin: null,
    salaryMax: null
}

const initBillingAddressErrors: { [key: string]: string | null } = {
    firstName: null,
    lastName: null,
    email: null,
    emailConfirmation: null,
    addressLine1: null,
    addressLine2: null,
    city: null,
    state: null,
    country: null,
    postalCode: null
}

const selectedPostTypeStyle = {
    backgroundColor: 'lightyellow',
    outlineColor: '#1188ee', 
    outlineWidth: '2px', 
    outlineStyle: 'solid'
}

const unselectedPostTypeStyle = {
    outlineColor: '#e8e8e8', 
    outlineWidth: '1px', 
    outlineStyle: 'solid'
}

const stripe = loadStripe(process.env.NEXT_PUBLIC_STRIPE_TEST_PK as string)

const Post: NextPage = () => {
    const { jobboard } = useContext(JobBoardContext) as JobBoardContextValue

    const { data: session, status } = useSession()

    const router = useRouter()

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/')
        }
    }, [status])

    if (status === 'loading') {
        return (
            <Box height='100vh' display='flex' alignItems='center' justifyContent='center'>
                <CircularProgress color='secondary' size={22} />
            </Box>
        )
    }

    if (status === 'unauthenticated') {
        return (
            <Box height='100vh' display='flex' alignItems='center' justifyContent='center'>
                <Typography>Access Denied</Typography>
            </Box>
        )
    }

    return (
        <Elements stripe={stripe}>
            <Head>
                <title>{`${jobboard.title} | Post a job`}</title>
                <meta name="description" content="Post a job" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <PostForm />
        </Elements>
    )
}

type PostFormProps = {
    edit?: boolean
}
export const PostForm = ({ edit }: PostFormProps) => {  
    const { baseUrlApi, jobboard } = useContext(JobBoardContext) as JobBoardContextValue

    const { data: session } = useSession()
    
    const [job, setJob] = useState<JobData | null>(null)
    const [jobLoading, setJobLoading] = useState(edit)
    const [jobError, setJobError] = useState(false)
    const [jobDetails, setJobDetails] = useState<PostForm>(initJobDetails)

    const [billingAddress, setBillingAddress] = useState(initBillingAddress)

    const [imageFileName, setImageFileName] = useState('')
    const [imagePreviewSource, setImagePreviewSource] = useState<string | ArrayBuffer | null>('')
    const [logo, setLogo] = useState<FormData>()
    const [logoError, setLogoError] = useState(false)
    const [logoUrl, setLogoUrl] = useState('')

    const [locationText, setLocationText] = useState('')
    const [descriptionEditorValue, setDescriptionEditorValue] = useState(initEditorValue)

    const [loading, setLoading] = useState(false)
    const [jobDetailsErrors, setJobDetailsErrors] = useState(initJobDetailsErrors)
    const [billingAddressErrors, setBillingAddressErrors] = useState(initBillingAddressErrors)

    const editor = useEditor()

    const router = useRouter()

    const stripe = useStripe()
    const elements = useElements()
    const [paymentError, setPaymentError] = useState('')

    const jobDetailsErrorAlertRef = useRef<null | HTMLDivElement>(null)
    const billingAddressErrorAlertRef = useRef<null | HTMLDivElement>(null)

    const windowSize = useWindowSize()
    const mobile = !!(windowSize.width && windowSize.width < 500 )

    const invalidJobDetails = Object.keys(jobDetailsErrors).some(field => jobDetailsErrors[field])
    const invalidBillingAddress = Object.keys(billingAddressErrors).some(field => billingAddressErrors[field])

    const loadJob = async () => {
        setJobLoading(true)
        try {
            const jobRes = await axios.get(`${baseUrlApi}jobs/${router.query.id}`)
            if (jobRes) {
                const { data } = jobRes
                // TO DO: Set state
                const updatedJobDetails = {
                    ...initJobDetails,
                    title: data.title,
                    company: data.company,
                    companyUrl: data.companyUrl,
                    type: data.type,
                    location: data.location,
                    remote: data.remote,
                    applicationLink: data.applicationLink,
                    skills: data.skills,
                    perks: data.perks,
                    featured: data.featured,
                    salaryMin: data.salaryMin,
                    salaryMax: data.salaryMax
                }
                setJob(data)
                setJobDetails(updatedJobDetails)
                const descriptionDocument = new DOMParser().parseFromString(`<body>${data.description}</body>`, 'text/html')
                const descriptionSlateNodes = deserialize(descriptionDocument.body)
                setEditorValueFromExistingJob(descriptionSlateNodes)
                setLogoUrl(data.companyLogo)
                handleLocationTextChange(data.location)
            }
        } catch (err) {
            setJobError(true)
        } finally {
            setJobLoading(false)
        }
    }

    useEffect(() => {
        if (edit && router.query.id) {
            loadJob()
        }
    }, [router.query.id])

    const setDescriptionValue = (value: { type: string, children: { text: string; }[] }[]) => {
        // Hack to fix bug of remaining node being ul or nl when deleting all text
        if (value.length === 1 && value[0]?.type === 'list-item') {
            setDescriptionEditorValue(initEditorValue)
        } else {
            setDescriptionEditorValue(value)
        }
    }

    const validate = () => {
        let isJobDetailsValid = true
        let isBillingAddressValid = true
        const newJobDetailsErrors = Object.assign({}, initJobDetailsErrors)
        const newBillingAddressErrors = Object.assign({}, initBillingAddressErrors)
        const descriptionEmpty = descriptionEditorValue.length === 1 && descriptionEditorValue[0].type === 'paragraph' && !descriptionEditorValue[0].children[0]?.text.length

        // JOB DETAILS VALIDATION

        if (!isValidHttpUrl(jobDetails.companyUrl.trim())) {
            newJobDetailsErrors['companyUrl'] = ERROR.WEBSITE_LINK
        }
        if (!isValidHttpUrl(jobDetails.applicationLink.trim()) && !isValidEmail(jobDetails.applicationLink.trim())) {
            newJobDetailsErrors['applicationLink'] = ERROR.APPLICATION_LINK
        }
        for (const field in jobDetails) {
            // @ts-ignore
            if ((typeof jobDetails[field] === 'string' && !jobDetails[field].trim()) && field !== 'companyLogo') {
                if (field !== 'companyLogo' && field !== 'location') {
                    newJobDetailsErrors[field] = ERROR.EMPTY
                    isJobDetailsValid = false
                }
            }
        }
        if (!jobDetails.location && !jobDetails.remote) {
            newJobDetailsErrors['location'] = ERROR.EMPTY_LOCATION
            isJobDetailsValid = false
        }
        if (jobDetails.salaryMin === 0) {
            newJobDetailsErrors['salaryMin'] = ERROR.EMPTY
            isJobDetailsValid = false
        }
        if (jobDetails.salaryMin < 0) {
            newJobDetailsErrors['salaryMin'] = ERROR.SALARY_NEGATIVE
            isJobDetailsValid = false
        }
        if (jobDetails.salaryMax === 0) {
            newJobDetailsErrors['salaryMax'] = ERROR.EMPTY
            isJobDetailsValid = false
        }
        if (jobDetails.salaryMax < 0) {
            newJobDetailsErrors['salaryMax'] = ERROR.SALARY_NEGATIVE
            isJobDetailsValid = false
        }
        if (jobDetails.salaryMax < jobDetails.salaryMin) {
            newJobDetailsErrors['salaryMax'] = ERROR.SALARY_ORDER
        }
        if (!jobDetails.skills.length) {
            newJobDetailsErrors['skills'] = ERROR.EMPTY
            isJobDetailsValid = false
        }
        if (descriptionEmpty) {
            newJobDetailsErrors['description'] = ERROR.EMPTY
            isJobDetailsValid = false
        }

        setJobDetailsErrors(newJobDetailsErrors)

        // BILLING ADDRESS VALIDATION

        if (!edit) {
            if (billingAddress.email.trim().toLowerCase() !== billingAddress.emailConfirmation.trim().toLowerCase()) {
                newBillingAddressErrors['emailConfirmation'] = ERROR.EMAIL_CONFIRMATION
                isBillingAddressValid = false
            }
    
            if (!isValidEmail(billingAddress.email)) {
                newBillingAddressErrors['email'] = ERROR.EMAIL
                isBillingAddressValid = false
            }
    
            for (const field in billingAddress) {
                // TO DO: Arr of optional fields to ignore
                // @ts-ignore
                if ((typeof billingAddress[field] === 'string' && !billingAddress[field].trim() && field !== 'addressLine2')) {
                    newBillingAddressErrors[field] = ERROR.EMPTY
                    isBillingAddressValid = false
                }
            }
    
            setBillingAddressErrors(newBillingAddressErrors)
        }
        
        if (!isJobDetailsValid) {
            jobDetailsErrorAlertRef.current && jobDetailsErrorAlertRef.current.scrollIntoView()
        } else if (!isBillingAddressValid) {
            billingAddressErrorAlertRef.current && billingAddressErrorAlertRef.current.scrollIntoView()
        }

        return isJobDetailsValid && isBillingAddressValid
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

    // TO DO: Validate urls - provide https if absent or add prefix before input
    const createOrUpdateJob = async () => {
        if (session && session.user) {
            const isValid = validate()
            if (!isValid) {
                return
            }
            setLoading(true)
            try {
                let paymentResult
                if (!edit) {
                    paymentResult = await makePayment()
                    if (!paymentResult) {
                        throw Error('Payment failed.')
                    }
                }
    
                const formData = logo ? logo : new FormData()
    
                const jobData = { 
                    // @ts-ignore
                    employerId: session.user.id,
                    jobboardId: jobboard._id,
                    ...(edit ? job : {}),
                    ...(!edit ? { email: billingAddress.email.trim().toLowerCase() } : {}),
                    ...jobDetails,
                    remote: jobDetails.remote || jobDetails.location === 'Remote',
                    title: jobDetails.title.trim(),
                    backfilled: false,
                    company: jobDetails.company.trim(),
                    companyUrl: jobDetails.companyUrl.trim(),
                    companyLogo: logoUrl ? logoUrl : '',
                    description: serialize({ children: descriptionEditorValue }),
                    applicationLink: isValidEmail(jobDetails.applicationLink.trim()) ? `mailto:${jobDetails.applicationLink.trim()}` : jobDetails.applicationLink.trim()
                }
    
                formData.set('jobData', JSON.stringify(jobData))
                formData.set('mode', edit ? 'update' : 'create')
    
                if (edit) {
                    formData.set('updateToken', router.query.token as string)
                } else {
                    formData.set('stripePaymentIntentId', paymentResult?.paymentIntent.id as string)
                }
    
                const res = await axios.post(`${baseUrlApi}jobs/create-or-update`, formData, { 
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
                
                res.status === (edit ? 200 : 201) && router.push(`/jobs/${res.data._id}`)
            } catch (err) {
                console.log(err)
                setLoading(false)
            }
        }
    }

    const removeLogo = () => {
        setImageFileName('')
        setImagePreviewSource('')
        setLogo(undefined)
        setLogoError(false)
        setLogoUrl('')
    }

    const handleInputChange = (e: { persist: () => void; target: { name: any; value: any } }) => {
        e.persist()
        setJobDetails({ ...jobDetails, [e.target.name]: e.target.value })
    }

    const handleSelectChange = (e: SelectChangeEvent<string>) => {
        setJobDetails({ ...jobDetails, [e.target.name]: e.target.value })
    }

    const handleAutocompleteChange = (value: string) => {
        setJobDetails({ ...jobDetails, location: value, remote: value === 'Remote' })
    }

    const handleLocationTextChange = (text: string) => {
        setLocationText(text)
    }

    const handleSkillsChange = (value: string[]) => {
        setJobDetails({ ...jobDetails, skills: value })
    }

    const handlePerksChange = (value: string[]) => {
        setJobDetails({ ...jobDetails, perks: value })
    }

    const handleBillingAddressChange = (e: { persist: () => void; target: { name: any; value: any } }) => {
        e.persist()
        setBillingAddress({ ...billingAddress, [e.target.name]: e.target.value })
    }

    const handleBillingAddressSelectChange = (e: SelectChangeEvent<string>) => {
        setBillingAddress({ ...billingAddress, [e.target.name]: e.target.value })
    }

    const setEditorValueFromExistingJob = (nodes: Node | Node[]) => {
        // @ts-ignore
        setDescriptionEditorValue(nodes)
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

    const handleCheckboxChange = (value: boolean) => {
        setJobDetails({ ...jobDetails, remote: value })
    }

    const makePayment = async () => {
        if (stripe && elements && !edit) {
            const paymentIntentParams = {
                amount: PRICE[jobDetails.featured ? 'featured' : 'regular'] * 100,
                currency: 'USD',
                receipt_email: billingAddress.email
            }

            // TO DO: Clean up payment intent if transaction fails
            const paymentIntent = await axios.post(`${baseUrlApi}stripe/create-payment-intent`, paymentIntentParams)

            const cardElement = elements.getElement(CardNumberElement)
            const stripeData = {
                payment_method: {
                    card: cardElement,
                    billing_details: {
                        address: {
                            city: billingAddress.city,
                            country: billingAddress.country,
                            line1: billingAddress.addressLine1,
                            line2: billingAddress.addressLine2,
                            postal_code: billingAddress.postalCode,
                            state: billingAddress.state
                        },
                        email: billingAddress.email,
                        name: `${billingAddress.firstName} ${billingAddress.lastName}`
                   }
                }
            }

            // @ts-ignore
            const paymentResult = await stripe.confirmCardPayment(paymentIntent.data.clientSecret, stripeData)

            if (paymentResult.error) {
                setPaymentError(paymentResult.error.message || '')
                billingAddressErrorAlertRef.current && billingAddressErrorAlertRef.current.scrollIntoView()
            } else {
                if (paymentResult.paymentIntent.status === "succeeded") {
                    setPaymentError('')
                    return paymentResult
                }
            }
        }
    }

  return (
    <div className={styles.container}>
      <main className={styles.main} style={{backgroundColor: '#f5f5f5', paddingTop: 58}}>
        {jobLoading ? (
            <Box sx={{ height: 'calc(100vh - 58px)'}} display='flex' alignItems='center' justifyContent='center'>
                <CircularProgress color='secondary' sx={{ marginBottom: '58px' }} />
            </Box>
        ) : jobError ? (
            <Box sx={{ height: 'calc(100vh - 58px)'}} display='flex' alignItems='center' justifyContent='center'>
                <Typography sx={{ marginBottom: '58px' }}>This link is expired or invalid.</Typography>
            </Box>
        ) : (
            <Grid container justifyContent='center' pb={mobile ? 2 : 4}>
                <Grid xs={12} sm={10} lg={8} p={2} pt={0} pb={mobile ? 0 : 2}>
                    <Box p={mobile ? 2 : 4} pt={mobile ? 3 : 4} pb={mobile ? 3 : 4} sx={{ backgroundColor: '#fff', borderRadius: 1 }}>
                        <Typography mb={2} variant='h1' fontWeight='bold' fontSize={mobile ? 22 : 30}>Post a job</Typography>
                        <Typography variant='h2' fontSize={16} color='grey'>Hire the best React developers for an affordable price.</Typography>
                    </Box>
                </Grid>

                <Grid xs={12} sm={10} lg={8} p={2} container>
                    <Grid xs={12} sm={12} pb={mobile ? 2 : 4} container>
                        <Box p={mobile ? 2 : 4} pt={mobile ? 3 : 4} pb={mobile ? 3 : 4} sx={{ borderRadius: 1, backgroundColor: '#fff', width: '100%' }}>
                            <Box>
                                <Grid xs={12} display='flex' alignItems='center' justifyContent='center' pb={mobile ? 2 : 4}>
                                    {edit ? <Typography ml={1} fontSize={18} fontWeight='bold'>Listing Type</Typography> : 
                                    (
                                        <>
                                            <LooksOne fontSize='medium' color='primary' />
                                            <Typography ml={1} fontSize={18} fontWeight='bold'>Select listing type</Typography>
                                        </>
                                    )}
                                </Grid>
                            </Box>
                            <Box display='flex' flexDirection={mobile ? 'column' : 'row'} justifyContent='center'>
                                {(!edit || (edit && jobDetails.featured)) && (
                                    <Grid xs={12} sm={6} mb={mobile ? 2 : 0}>
                                        <Box onClick={() => !edit && setJobDetails({ ...jobDetails, featured: true })} mr={mobile ? 0 : 2} p={mobile ? 2 : 4} pt={mobile ? 3 : 4} pb={mobile ? 3 : 4} sx={{ backgroundColor: '#fff', borderRadius: 1, height: '100%', cursor: edit ? 'normal' : 'pointer', ...(jobDetails.featured ? selectedPostTypeStyle : unselectedPostTypeStyle) }}>
                                            <Typography fontWeight='bold' mb={1}>FEATURED</Typography>
                                            <Typography fontWeight='bold' mb={2} color='grey'>$99</Typography>
                                            <Typography>
                                                One featured listing for 30 days. Featured listings are highlighted and receive more attention.
                                            </Typography>
                                        </Box>
                                    </Grid>
                                )}
                                {(!edit || (edit && !jobDetails.featured)) && (
                                    <Grid xs={12} sm={6}>
                                        <Box onClick={() => !edit && setJobDetails({ ...jobDetails, featured: false })} ml={mobile ? 0 : 2} p={mobile ? 2 : 4} pt={mobile ? 3 : 4} pb={mobile ? 3 : 4} sx={{ backgroundColor: '#fff', borderRadius: 1, height: '100%', cursor: edit ? 'normal' : 'pointer', ...(!jobDetails.featured ? selectedPostTypeStyle : unselectedPostTypeStyle) }}>
                                            <Typography fontWeight='bold' mb={1}>REGULAR</Typography>
                                            <Typography fontWeight='bold' mb={2} color='grey'>$49</Typography>
                                            <Typography>
                                                One regular listing for 30 days. Jobs are posted immediately.
                                            </Typography>
                                        </Box>
                                    </Grid>
                                )}
                            </Box>
                        </Box>
                    </Grid>

                    <Grid xs={12} sm={12} pb={mobile ? 2 : 4} container>
                        <Box p={mobile ? 2 : 4} pt={mobile ? 3 : 4} pb={mobile ? 3 : 4} sx={{ backgroundColor: '#fff', borderRadius: 1 }}>
                            <Box>
                                <Grid xs={12} display='flex' alignItems='center' justifyContent='center' pb={mobile ? 2 : 4} ref={jobDetailsErrorAlertRef}>
                                {edit ? <Typography ml={1} fontSize={18} fontWeight='bold'>Job Details</Typography> : (
                                    <>
                                        <LooksTwo fontSize='medium' color='primary' />
                                        <Typography ml={1} fontSize={18} fontWeight='bold'>Enter job details</Typography>
                                    </>
                                )}
                                </Grid>
                            </Box>
                            <Box>
                                <Grid container spacing={2}>
                                    {invalidJobDetails && (
                                        <Grid xs={12}>
                                            <Alert sx={{ marginBottom: mobile ? 1 : 2}} severity="error">Please fix the following errors and resubmit.</Alert>
                                        </Grid>
                                    )}

                                    <Grid xs={12} sm={6}>
                                        <FormControl hiddenLabel fullWidth>
                                            <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Job Title</Typography>
                                            <FilledInput error={!!jobDetailsErrors['title']} disableUnderline={!jobDetailsErrors['title']} onChange={handleInputChange} name='title' value={jobDetails.title} autoComplete='off' inputProps={{ label: 'Job Title' }} required placeholder='Job Title' fullWidth />
                                            <FormHelperText error>{jobDetailsErrors['title']}</FormHelperText>
                                        </FormControl>
                                    </Grid>
                                    <Grid xs={12} sm={6}>
                                        <FormControl hiddenLabel fullWidth>
                                            <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Job Type</Typography>
                                            <Select onChange={(value) => handleSelectChange(value)} name='type' value={jobDetails.type} variant='filled' disableUnderline fullWidth>
                                                <MenuItem value={TYPE.FULLTIME}>{TYPE_MAP.fulltime}</MenuItem>
                                                <MenuItem value={TYPE.PARTTIME}>{TYPE_MAP.parttime}</MenuItem>
                                                <MenuItem value={TYPE.CONTRACT}>{TYPE_MAP.contract}</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid xs={6}>
                                        <FormControl hiddenLabel fullWidth>
                                            <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Salary Min. <span style={{ fontWeight: 'normal' }}>(USD)</span></Typography>
                                            <FilledInput error={!!jobDetailsErrors['salaryMin']} disableUnderline={!jobDetailsErrors['salaryMin']}  type='number' fullWidth onChange={handleInputChange} name='salaryMin' value={jobDetails.salaryMin} autoComplete='off' required placeholder='Min' sx={{ marginRight: '0.25rem' }}  inputProps={{ min: "0", max: "10000000", step: "100" }} />
                                            <FormHelperText error>{jobDetailsErrors['salaryMin']}</FormHelperText>
                                        </FormControl>
                                    </Grid>
                                    <Grid xs={6}>
                                        <FormControl hiddenLabel fullWidth>
                                            <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Salary Max. <span style={{ fontWeight: 'normal' }}>(USD)</span></Typography>
                                            <FilledInput error={!!jobDetailsErrors['salaryMax']} disableUnderline={!jobDetailsErrors['salaryMax']}  type='number' fullWidth onChange={handleInputChange} name='salaryMax' value={jobDetails.salaryMax} autoComplete='off' required placeholder='Max' inputProps={{ min: "0", max: "10000000", step: "100" }} />
                                            <FormHelperText error>{jobDetailsErrors['salaryMax']}</FormHelperText>
                                        </FormControl>
                                    </Grid>

                                    <Grid xs={12} sm={6}>
                                        <FormControl hiddenLabel fullWidth>
                                            <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Company Name</Typography>
                                            <FilledInput error={!!jobDetailsErrors['company']} disableUnderline={!jobDetailsErrors['company']}  onChange={handleInputChange} name='company' value={jobDetails.company} autoComplete='off' placeholder='Company Name' fullWidth sx={{ verticalAlign: 'center' }} />
                                            <FormHelperText error>{jobDetailsErrors['company']}</FormHelperText>
                                        </FormControl>
                                    </Grid>
                                    <Grid xs={12} sm={6}>
                                        <FormControl hiddenLabel fullWidth>
                                            <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Company Website</Typography>
                                            <FilledInput error={!!jobDetailsErrors['companyUrl']} disableUnderline={!jobDetailsErrors['companyUrl']}  onChange={handleInputChange} name='companyUrl' value={jobDetails.companyUrl} autoComplete='off' placeholder='https://' fullWidth />
                                            <FormHelperText error>{jobDetailsErrors['companyUrl']}</FormHelperText>
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
                                            {edit && logoUrl && (
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

                                    <Grid xs={12} sm={6}>
                                        <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Location</Typography>
                                        {/* TO DO: Virtualize options */}
                                        <Autocomplete
                                            disablePortal
                                            renderInput={(params) => <TextField error={!!jobDetailsErrors['location']} variant='filled' {...params} InputProps={{...params.InputProps, disableUnderline: !jobDetailsErrors['location'], placeholder: 'Location', style: { padding: '9px 12px 10px' }}} />}
                                            options={cities}
                                            filterOptions={createFilterOptions({
                                                limit: 10
                                            })}
                                            onChange={(e, value) => handleAutocompleteChange(value || '')}
                                            value={jobDetails.location ? jobDetails.location : null}
                                            inputValue={locationText}
                                            onInputChange={(event, newValue) => handleLocationTextChange(newValue)}
                                        />
                                        <FormHelperText sx={{ marginLeft: '14px', marginRight: '14px' }} error>{jobDetailsErrors['location']}</FormHelperText>
                                    </Grid>
                                    <Grid xs={12} sm={6}>
                                        <FormControl hiddenLabel fullWidth>
                                            <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Remote <span style={{ fontWeight: 'normal' }}>(2+ days per week)</span></Typography>
                                            <Checkbox disabled={jobDetails.location === 'Remote'} checked={jobDetails.remote} onChange={(e) => handleCheckboxChange(e.target.checked)} sx={{ width: '42px' }} />
                                        </FormControl>
                                    </Grid>

                                    <Grid xs={12}>
                                        <FormControl hiddenLabel fullWidth>
                                            <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Job Description</Typography>
                                            {(!edit || job) && <TextEditor editor={editor} error={!!jobDetailsErrors['description']} slateValue={descriptionEditorValue} setSlateValue={setDescriptionValue} />}
                                            {edit && !job && <TextEditorPlaceholder />}
                                            <FormHelperText sx={{ marginLeft: '14px', marginRight: '14px' }} error>{jobDetailsErrors['description']}</FormHelperText>
                                        </FormControl>
                                    </Grid>

                                    <Grid xs={12}>
                                        <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Skills</Typography>
                                        <Autocomplete
                                            freeSolo
                                            multiple
                                            disableClearable
                                            disablePortal
                                            renderInput={(params) => <TextField error={!!jobDetailsErrors['skills']} variant='filled' {...params} InputProps={{...params.InputProps, disableUnderline: !jobDetailsErrors['skills'], placeholder: jobDetails.skills.length ? '' : 'Select an option or add your own', style: { padding: '9px 12px 10px' }}} />}
                                            options={jobboard.skills}
                                            onChange={(e, value) => handleSkillsChange(value || '')}
                                            value={jobDetails.skills}
                                        />
                                        <FormHelperText sx={{ marginLeft: '14px', marginRight: '14px' }} error>{jobDetailsErrors['skills']}</FormHelperText>
                                    </Grid>

                                    <Grid xs={12}>
                                        <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Perks</Typography>
                                        <Autocomplete
                                            freeSolo
                                            multiple
                                            disableClearable
                                            disablePortal
                                            renderInput={(params) => <TextField variant='filled' {...params} InputProps={{...params.InputProps, disableUnderline: true, placeholder: jobDetails.perks.length ? '' : 'Select an option or add your own', style: { padding: '9px 12px 10px' }}} />}
                                            options={PERKS}
                                            onChange={(e, value) => handlePerksChange(value || '')}
                                            value={jobDetails.perks}
                                        />
                                        <FormHelperText sx={{ marginLeft: '14px', marginRight: '14px' }}>Optional</FormHelperText>
                                    </Grid>

                                    <Grid xs={12}>
                                        <FormControl hiddenLabel fullWidth>
                                            <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Application Link</Typography>
                                            <FilledInput error={!!jobDetailsErrors['applicationLink']} disableUnderline={!jobDetailsErrors['applicationLink']} required onChange={handleInputChange} name='applicationLink' value={jobDetails.applicationLink} autoComplete='off' placeholder='URL or Email address' fullWidth />
                                            <FormHelperText error>{jobDetailsErrors['applicationLink']}</FormHelperText>
                                        </FormControl>
                                    </Grid>

                                    {edit && (
                                        <Grid xs={12} pt={2} display='flex' justifyContent='center'>
                                            <Button fullWidth={mobile} disabled={loading} onClick={createOrUpdateJob} variant='contained' disableElevation color='primary' sx={{ height: '45px', width: mobile ? '100%' : '200px' }}>
                                                {loading ? <CircularProgress color='secondary' size={22} /> : 'Update job'}
                                            </Button>
                                        </Grid>
                                    )}
                                </Grid>
                            </Box>
                        </Box>
                    </Grid>

                    {!edit && (
                        <Grid xs={12} pb={mobile ? 2 : 4}>
                            <Box p={mobile ? 2 : 4} pt={mobile ? 3 : 4} pb={mobile ? 3 : 4} sx={{ backgroundColor: '#fff', borderRadius: 1 }}>
                                <Box>
                                    <Grid xs={12} display='flex' alignItems='center' justifyContent='center' pb={4} ref={billingAddressErrorAlertRef}>
                                        <Looks3 color='primary' fontSize='medium' />
                                        <Typography fontSize={18} ml={1} fontWeight='bold'>Enter billing info</Typography>
                                    </Grid>
                                </Box>
                                <Box>
                                    <Grid container spacing={2}>
                                        {(invalidBillingAddress || paymentError) && (
                                            <Grid xs={12}>
                                                <Alert sx={{ marginBottom: mobile ? 1 : 2}} severity="error">
                                                    {paymentError ? paymentError : 'Please fix the following errors and resubmit.'}
                                                </Alert>
                                            </Grid>
                                        )}

                                        <Grid xs={12} pb={2} pt={0} display='flex' justifyContent='center'>
                                            <Typography fontWeight='bold' color='grey'>BILLING ADDRESS</Typography>
                                        </Grid>

                                        <Grid xs={12} sm={6}>
                                            <FormControl hiddenLabel fullWidth>
                                                <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>First Name</Typography>
                                                <FilledInput error={!!billingAddressErrors['firstName']} disableUnderline={!billingAddressErrors['firstName']} onChange={handleBillingAddressChange} name='firstName' value={billingAddress.firstName} autoComplete='off' placeholder='First Name' fullWidth />
                                                <FormHelperText error>{billingAddressErrors['firstName']}</FormHelperText>
                                            </FormControl>
                                        </Grid>

                                        <Grid xs={12} sm={6}>
                                            <FormControl hiddenLabel fullWidth>
                                                <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Last Name</Typography>
                                                <FilledInput error={!!billingAddressErrors['lastName']} disableUnderline={!billingAddressErrors['lastName']} onChange={handleBillingAddressChange} name='lastName' value={billingAddress.lastName} autoComplete='off' placeholder='Last Name' fullWidth />
                                                <FormHelperText error>{billingAddressErrors['lastName']}</FormHelperText>
                                            </FormControl>
                                        </Grid>

                                        <Grid xs={12} sm={6}>
                                            <FormControl hiddenLabel fullWidth>
                                                <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Email Address</Typography>
                                                <FilledInput error={!!billingAddressErrors['email']} disableUnderline={!billingAddressErrors['email']} onChange={handleBillingAddressChange} name='email' value={billingAddress.email} autoComplete='off' placeholder='Email Address' fullWidth />
                                                <FormHelperText error>{billingAddressErrors['email']}</FormHelperText>
                                            </FormControl>
                                        </Grid>

                                        <Grid xs={12} sm={6}>
                                            <FormControl hiddenLabel fullWidth>
                                                <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Confirm Email Address</Typography>
                                                <FilledInput error={!!billingAddressErrors['emailConfirmation']} disableUnderline={!billingAddressErrors['emailConfirmation']} onChange={handleBillingAddressChange} name='emailConfirmation' value={billingAddress.emailConfirmation} autoComplete='off' placeholder='Email Address' fullWidth />
                                                <FormHelperText error>{billingAddressErrors['emailConfirmation']}</FormHelperText>
                                            </FormControl>
                                        </Grid>

                                        <Grid xs={12}>
                                            <FormControl hiddenLabel fullWidth>
                                                <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Address 1</Typography>
                                                <FilledInput error={!!billingAddressErrors['addressLine1']} disableUnderline={!billingAddressErrors['addressLine1']} onChange={handleBillingAddressChange} name='addressLine1' value={billingAddress.addressLine1} autoComplete='off' placeholder='Address 1' fullWidth />
                                                <FormHelperText error>{billingAddressErrors['addressLine1']}</FormHelperText>
                                            </FormControl>
                                        </Grid>

                                        <Grid xs={12}>
                                            <FormControl hiddenLabel fullWidth>
                                                <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Address 2</Typography>
                                                <FilledInput disableUnderline onChange={handleBillingAddressChange} name='addressLine2' value={billingAddress.addressLine2} autoComplete='off' placeholder='Address 2' fullWidth />
                                                <FormHelperText>Optional</FormHelperText>
                                            </FormControl>
                                        </Grid>

                                        <Grid xs={12} sm={6}>
                                            <FormControl hiddenLabel fullWidth>
                                                <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>City</Typography>
                                                <FilledInput error={!!billingAddressErrors['city']} disableUnderline={!billingAddressErrors['city']} onChange={handleBillingAddressChange} name='city' value={billingAddress.city} autoComplete='off' placeholder='City' fullWidth />
                                                <FormHelperText error>{billingAddressErrors['city']}</FormHelperText>
                                            </FormControl>
                                        </Grid>

                                        <Grid xs={12} sm={6}>
                                            <FormControl hiddenLabel fullWidth>
                                                <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>State</Typography>
                                                <FilledInput error={!!billingAddressErrors['state']} disableUnderline={!billingAddressErrors['state']} onChange={handleBillingAddressChange} name='state' value={billingAddress.state} autoComplete='off' placeholder='State' fullWidth />
                                                <FormHelperText error>{billingAddressErrors['state']}</FormHelperText>
                                            </FormControl>
                                        </Grid>

                                        <Grid xs={12} sm={6}>
                                            <FormControl hiddenLabel fullWidth>
                                                <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Postal Code</Typography>
                                                <FilledInput error={!!billingAddressErrors['postalCode']} disableUnderline={!billingAddressErrors['postalCode']} onChange={handleBillingAddressChange} name='postalCode' value={billingAddress.postalCode} autoComplete='off' placeholder='Postal Code' fullWidth />
                                                <FormHelperText error>{billingAddressErrors['postalCode']}</FormHelperText>
                                            </FormControl>
                                        </Grid>

                                        <Grid xs={12} sm={6}>
                                            <FormControl hiddenLabel fullWidth>
                                                <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Country</Typography>
                                                <Select onChange={(value) => handleBillingAddressSelectChange(value)} name='country' value={billingAddress.country} variant='filled' disableUnderline fullWidth>
                                                    {countryCodes.map(country => <MenuItem key={country.code} value={country.code}>{country.name}</MenuItem>)}
                                                </Select>
                                                <FormHelperText error>{billingAddressErrors['country']}</FormHelperText>
                                            </FormControl>
                                        </Grid>

                                        <Grid xs={12} pt={2}>
                                            <Divider />
                                        </Grid>

                                        <Grid xs={12} p={2} display='flex' justifyContent='center'>
                                            <Typography fontWeight='bold' color='grey'>PAYMENT DETAILS</Typography>
                                        </Grid>

                                        <Grid xs={12} sm={6}>
                                            <FormControl hiddenLabel fullWidth>
                                                <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Credit Card Number</Typography>
                                                <TextField
                                                    name='creditCardNumber'
                                                    variant='filled'
                                                    hiddenLabel
                                                    error={!!paymentError} 
                                                    fullWidth
                                                    InputLabelProps={{ shrink: true }}
                                                    InputProps={{
                                                        disableUnderline: !paymentError,
                                                        // @ts-ignore
                                                        inputComponent: StripeInput,
                                                        inputProps: {
                                                            component: CardNumberElement
                                                        }
                                                    }}
                                                />
                                            </FormControl>
                                        </Grid>

                                        <Grid xs={6} sm={3}>
                                            <FormControl hiddenLabel fullWidth>
                                                <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Expiration Date</Typography>
                                                <TextField
                                                    name='creditCardExpiration'
                                                    variant='filled'
                                                    hiddenLabel
                                                    error={!!paymentError} 
                                                    fullWidth
                                                    InputLabelProps={{ shrink: true }}
                                                    InputProps={{
                                                        disableUnderline: !paymentError,
                                                        // @ts-ignore
                                                        inputComponent: StripeInput,
                                                        inputProps: {
                                                            component: CardExpiryElement
                                                        }
                                                    }}
                                                />
                                            </FormControl>
                                        </Grid>

                                        <Grid xs={6} sm={3}>
                                            <FormControl hiddenLabel fullWidth>
                                                <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>CVC</Typography>
                                                <TextField 
                                                    name='cvc'
                                                    variant='filled'
                                                    hiddenLabel
                                                    error={!!paymentError} 
                                                    fullWidth
                                                    InputLabelProps={{ shrink: true }}
                                                    InputProps={{
                                                        disableUnderline: !paymentError,
                                                        // @ts-ignore
                                                        inputComponent: StripeInput,
                                                        inputProps: {
                                                            component: CardCvcElement
                                                        }
                                                    }}
                                                />
                                            </FormControl>
                                        </Grid>

                                        <Grid xs={12} container >
                                            <Grid xs={12}>
                                                <Box display='flex' flexWrap='wrap' ml={0.34} mb={1}>
                                                    {SUPPORTED_CARDS.map(card => <img key={card} src={`/images/cards/${card}.png`} alt={card} width='50px' style={{ padding: `8px 5px 0` }} />)}
                                                </Box>

                                                <Typography ml={1} variant='caption'>
                                                    <strong>Note:</strong> All transactions are made in USD.
                                                </Typography>
                                            </Grid>
                                        </Grid>

                                        <Grid xs={12} mt={1}>
                                            <Box display='flex' alignItems='center'>
                                                <img src='/images/stripe.svg' width='140px' style={{ marginRight: '1rem' }} />
                                                <Box display='flex' alignItems='center'>
                                                    <Lock />
                                                    <Typography ml={1} variant='subtitle2'>Guaranteed safe & secure checkout</Typography>
                                                </Box>
                                            </Box>
                                        </Grid>
                                        
                                        <Grid xs={12} pt={2} display='flex' justifyContent='center'>
                                            <Button fullWidth={mobile} disabled={loading} onClick={createOrUpdateJob} variant='contained' disableElevation color='primary' sx={{ height: '45px', width: mobile ? '100%' : '200px' }}>
                                                {loading ? <CircularProgress color='secondary' size={22} /> : 'Post job'}
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Box>
                        </Grid>
                    )}
                </Grid>
            </Grid>
        )}
      </main>
    </div>
  )
}

export default Post

// @ts-ignore
const StripeInput = ({ component: Component, inputRef, ...props }) => {
    const elementRef = useRef()

    useImperativeHandle(inputRef, () => ({
        // @ts-ignore
        focus: () => elementRef.current.focus
    }))

    return (
         <Component
              onReady={(element: any) => (elementRef.current = element)}     
              {...props}
         />
    )
}