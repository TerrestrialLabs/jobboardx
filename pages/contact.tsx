import { Alert, Box, Button, CircularProgress, FilledInput, FormControl, FormHelperText, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import React, { useContext, useState } from 'react'
import styles from '../styles/Home.module.css'
import { CONTACT_MESSAGE_TYPE } from '../const/const'
import axios from 'axios'
import { useWindowSize } from '../hooks/hooks'
import { JobBoardContext, JobBoardContextValue } from '../context/JobBoardContext'
import * as ga from '../lib/ga'
import { isValidEmail } from '../utils/utils'

const ERROR = {
    EMPTY: 'Field cannot be empty',
    EMAIL: 'Invalid email format'
}

const initErrors: { [key: string]: string } = {
    email: '',
    message: ''
}

const initState = {
    email: '',
    category: CONTACT_MESSAGE_TYPE.CUSTOMER_SUPPORT,
    message: ''
}

const Contact: NextPage = () => {
    const { baseUrlApi, jobboard, isAdminSite } = useContext(JobBoardContext) as JobBoardContextValue
    
    const [messageData, setMessageData] = useState(initState)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState(initErrors)
    const [submitted, setSubmitted] = useState(false)

    const showErrorMessage = Object.keys(errors).some(field => errors[field])

    const windowSize = useWindowSize()
    const mobile = !!(windowSize.width && windowSize.width < 500 )

    const handleInputChange = (e: { persist: () => void; target: { name: any; value: any } }) => {
        e.persist()
        setMessageData({ ...messageData, [e.target.name]: e.target.value })
    }

    const handleSelectChange = (e: SelectChangeEvent<string>) => {
        setMessageData({ ...messageData, [e.target.name]: e.target.value })
    }

    const logSubmit = () => {
        ga.event({
            action: "submit_contact",
            params: {
                category: messageData.category
            }
        })
    }

    const submit = async () => {
        logSubmit()

        const isValid = validate()
        if (!isValid) {
            return
        }
        setLoading(true)
        setErrors(initErrors)
        setSubmitted(false)
        try {
            const res = await axios.post(`${baseUrlApi}messages`, { ...messageData, email: messageData.email.trim().toLowerCase(), jobboardId: jobboard._id, isAdminSite })
            if (res.status === 201) {
                setErrors(initErrors)
                setSubmitted(true)
                setMessageData(initState)
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

        if (!isValidEmail(messageData.email.trim())) {
            newErrors['email'] = ERROR.EMAIL
            isValid = false
        }
        for (const field in messageData) {
            // @ts-ignore
            if ((typeof messageData[field] === 'string' && !messageData[field].trim())) {
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
                <title>{`${isAdminSite ? 'JobBoardX' : jobboard.title} | Contact`}</title>
                <meta name="description" content="Contact" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main} style={{backgroundColor: '#f5f5f5', paddingTop: 58}}>
                <Grid container justifyContent='center' pb={mobile ? 2 : 4}>
                    <Grid xs={12} sm={10} lg={8} p={2} pt={0} pb={mobile ? 0 : 2}>
                        <Box p={mobile ? 2 : 4} pt={mobile ? 3 : 4} pb={mobile ? 3 : 4} sx={{ backgroundColor: '#fff', borderRadius: 1 }}>
                            <Typography mb={2} variant='h1' fontWeight='bold' fontSize={mobile ? 22 : 30}>Get in touch</Typography>
                            <Typography variant='h2' fontSize={16} color='grey'>Request support, suggest feedback, or submit a feature request. We love to hear from you!</Typography>
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
                                            <Alert sx={{ marginBottom: mobile ? 1 : 2}} severity="success">Your message has been sent.</Alert>
                                        </Grid>
                                    )}

                                    <Grid xs={12} sm={6}>
                                        <FormControl hiddenLabel fullWidth>
                                            <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Email address</Typography>
                                            <FilledInput error={!!errors['email']} disableUnderline={!errors['email']} onChange={handleInputChange} name='email' value={messageData.email} autoComplete='off' inputProps={{ label: 'Email address' }} required placeholder='Email address' fullWidth />
                                            <FormHelperText error>{errors['email']}</FormHelperText>
                                        </FormControl>
                                    </Grid>

                                    <Grid xs={12} sm={6}>
                                        <FormControl hiddenLabel fullWidth>
                                            <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Category</Typography>
                                            <Select onChange={(value) => handleSelectChange(value)} name='category' value={messageData.category} variant='filled' disableUnderline fullWidth>
                                                <MenuItem value={CONTACT_MESSAGE_TYPE.CUSTOMER_SUPPORT}>{CONTACT_MESSAGE_TYPE.CUSTOMER_SUPPORT}</MenuItem>
                                                <MenuItem value={CONTACT_MESSAGE_TYPE.FEEDBACK}>{CONTACT_MESSAGE_TYPE.FEEDBACK}</MenuItem>
                                                <MenuItem value={CONTACT_MESSAGE_TYPE.FEATURE_REQUEST}>{CONTACT_MESSAGE_TYPE.FEATURE_REQUEST}</MenuItem>
                                                <MenuItem value={CONTACT_MESSAGE_TYPE.OTHER}>{CONTACT_MESSAGE_TYPE.OTHER}</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid xs={12} sm={12}>
                                        <FormControl hiddenLabel fullWidth>
                                            <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Message</Typography>
                                            <FilledInput multiline rows={6} error={!!errors['message']} disableUnderline={!errors['message']} onChange={handleInputChange} name='message' value={messageData.message} autoComplete='off' placeholder='Message' fullWidth sx={{ verticalAlign: 'center' }} />
                                            <FormHelperText error>{errors['message']}</FormHelperText>
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

export default Contact

export const getServerSideProps: GetServerSideProps = async (context) => {
    return { props: {} }
}