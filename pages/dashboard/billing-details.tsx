import { Alert, Box, Button, CircularProgress, FilledInput, FormControl, FormHelperText, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import React, { useContext, useEffect, useState } from 'react'
import styles from '../../styles/Home.module.css'
import { useWindowSize } from '../../hooks/hooks'
import { JobBoardContext, JobBoardContextValue } from '../../context/JobBoardContext'
import Dashboard from '../../components/Dashboard'
import axios from 'axios'
import axiosInstance from '../../api/axios'
import countryCodes from '../../data/country_codes.json'
import { Employer } from '../../models/User'
import { useSession } from '../../context/SessionContext'

const ERROR = {
    EMPTY: 'Field cannot be empty',
    WEBSITE_LINK: 'Invalid link format [https://www.example.com]',
    DUPLICATE_COMPANY: 'A company with this name already exists'
}

const initErrors: { [key: string]: string | null } = {
    firstName: null,
    lastName: null,
    addressLine1: null,
    addressLine2: null,
    city: null,
    state: null,
    country: null,
    postalCode: null
}

const initState = {
    firstName: '',
    lastName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US'
}

const OPTIONAL_FIELDS = ['addressLine2']

const BillingDetails: NextPage = () => {
    const { baseUrlApi, jobboard } = useContext(JobBoardContext) as JobBoardContextValue

    const session = useSession()

    const [form, setForm] = useState(initState)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState(initErrors)
    const [submitted, setSubmitted] = useState(false)
    const [formLoaded, setFormLoaded] = useState(false)

    const showErrorMessage = Object.keys(errors).some(field => errors[field])

    const windowSize = useWindowSize()
    const mobile = !!(windowSize.width && windowSize.width < 500 )

    const fetchUser = async () => {
        if (session?.user) {
            const res = await axiosInstance.get(`${baseUrlApi}auth/users/${session.user._id}`)
            const { billingAddress } = (res.data as Employer).employer
            setForm(billingAddress ?? initState)
            setFormLoaded(true)
        }
    }

    useEffect(() => {
        if (session?.user && !formLoaded) {
            fetchUser()
        }
    }, [session?.user])

    const handleInputChange = (e: { persist: () => void; target: { name: any; value: any } }) => {
        e.persist()
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSelectChange = (e: SelectChangeEvent<string>) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const validate = () => {
        let isValid = true
        const newErrors = Object.assign({}, initErrors)

        for (const field in form) {
            // @ts-ignore
            if ((typeof form[field] === 'string' && !form[field].trim() && !OPTIONAL_FIELDS.includes(field))) {
                newErrors[field] = ERROR.EMPTY
                isValid = false
            }
        }

        setErrors(newErrors)

        return isValid
    }

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
                    employer: {
                        ...(session.user as Employer).employer,
                        billingAddress: {
                            firstName: form.firstName.trim(),
                            lastName: form.lastName.trim(),
                            addressLine1: form.addressLine1.trim(),
                            addressLine2: form.addressLine2.trim(),
                            city: form.city.trim(),
                            state: form.state.trim(),
                            postalCode: form.postalCode.trim(),
                            country: form.country.trim()
                        }
                    }

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
                console.log(message)
            } else {
                console.log(err)
            }
        }
        
        setLoading(false)
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>{`${jobboard.title} | Dashboard: Billing details`}</title>
                <meta name="description" content="Dashboard: Billing details" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Dashboard content={(
                <Grid xs={12} pb={2} pt={mobile ? 0 : 2}>
                    <Box sx={{ backgroundColor: '#fff', borderRadius: 1 }} p={mobile ? 1 : 2} pb={2}>
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
                                <Grid xs={12} sm={6}>
                                    <FormControl hiddenLabel fullWidth>
                                        <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>First Name</Typography>
                                        <FilledInput error={!!errors['firstName']} disableUnderline={!errors['firstName']} onChange={handleInputChange} name='firstName' value={form.firstName} autoComplete='off' placeholder='First Name' fullWidth />
                                        <FormHelperText error>{errors['firstName']}</FormHelperText>
                                    </FormControl>
                                </Grid>

                                <Grid xs={12} sm={6}>
                                    <FormControl hiddenLabel fullWidth>
                                        <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Last Name</Typography>
                                        <FilledInput error={!!errors['lastName']} disableUnderline={!errors['lastName']} onChange={handleInputChange} name='lastName' value={form.lastName} autoComplete='off' placeholder='Last Name' fullWidth />
                                        <FormHelperText error>{errors['lastName']}</FormHelperText>
                                    </FormControl>
                                </Grid>

                                <Grid xs={12}>
                                    <FormControl hiddenLabel fullWidth>
                                        <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Address 1</Typography>
                                        <FilledInput error={!!errors['addressLine1']} disableUnderline={!errors['addressLine1']} onChange={handleInputChange} name='addressLine1' value={form.addressLine1} autoComplete='off' placeholder='Address 1' fullWidth />
                                        <FormHelperText error>{errors['addressLine1']}</FormHelperText>
                                    </FormControl>
                                </Grid>

                                <Grid xs={12}>
                                    <FormControl hiddenLabel fullWidth>
                                        <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Address 2</Typography>
                                        <FilledInput disableUnderline onChange={handleInputChange} name='addressLine2' value={form.addressLine2} autoComplete='off' placeholder='Address 2' fullWidth />
                                        <FormHelperText>Optional</FormHelperText>
                                    </FormControl>
                                </Grid>

                                <Grid xs={12} sm={6}>
                                    <FormControl hiddenLabel fullWidth>
                                        <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>City</Typography>
                                        <FilledInput error={!!errors['city']} disableUnderline={!errors['city']} onChange={handleInputChange} name='city' value={form.city} autoComplete='off' placeholder='City' fullWidth />
                                        <FormHelperText error>{errors['city']}</FormHelperText>
                                    </FormControl>
                                </Grid>

                                <Grid xs={12} sm={6}>
                                    <FormControl hiddenLabel fullWidth>
                                        <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>State</Typography>
                                        <FilledInput error={!!errors['state']} disableUnderline={!errors['state']} onChange={handleInputChange} name='state' value={form.state} autoComplete='off' placeholder='State' fullWidth />
                                        <FormHelperText error>{errors['state']}</FormHelperText>
                                    </FormControl>
                                </Grid>

                                <Grid xs={12} sm={6}>
                                    <FormControl hiddenLabel fullWidth>
                                        <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Postal Code</Typography>
                                        <FilledInput error={!!errors['postalCode']} disableUnderline={!errors['postalCode']} onChange={handleInputChange} name='postalCode' value={form.postalCode} autoComplete='off' placeholder='Postal Code' fullWidth />
                                        <FormHelperText error>{errors['postalCode']}</FormHelperText>
                                    </FormControl>
                                </Grid>

                                <Grid xs={12} sm={6}>
                                    <FormControl hiddenLabel fullWidth>
                                        <Typography sx={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Country</Typography>
                                        <Select onChange={(value) => handleSelectChange(value)} name='country' value={form.country} variant='filled' disableUnderline fullWidth>
                                            {countryCodes.map(country => <MenuItem key={country.code} value={country.code}>{country.name}</MenuItem>)}
                                        </Select>
                                        <FormHelperText error>{errors['country']}</FormHelperText>
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

export default BillingDetails

export const getServerSideProps: GetServerSideProps = async (context) => {
    return { props: {} }
}