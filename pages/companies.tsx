import { Box, Button, Link, Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { useWindowSize } from '../hooks/hooks'
import EmailFooter from '../components/EmailFooter'
import { JobBoardContext, JobBoardContextValue } from '../context/JobBoardContext'
import { Employer } from '../models/User'

interface Props {
  data: Employer[]
}

const Companies: NextPage<Props> = ({ data }) => {
  const { baseUrlApi, jobboard } = useContext(JobBoardContext) as JobBoardContextValue

  const windowSize = useWindowSize()
  const mobile = !!(windowSize.width && windowSize.width < 500 )

  return (
    <div className={styles.container}>
      <Head>
        <title>{jobboard.title}</title>
        <meta name="description" content="Home" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main} style={{backgroundColor: '#f5f5f5', paddingTop: 58}}>
        <Grid container justifyContent='center'>
          <Grid xs={12} sm={10} lg={9}>
            <Box py={10} bgcolor='secondary.main' color='white' sx={{ position: 'relative', height: '260px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Image priority={true} style={{ zIndex: 0, height: '100%', width: '100%', opacity: 1 }} alt='Hero image' src={jobboard.heroImage} layout='fill' objectFit='cover' objectPosition='center' />
              <Box p={2} sx={{ zIndex: 1 }}>
                <Typography mb={2} textAlign='center' color='#fff' variant='h1' fontSize={mobile ? '36px' : '48px'} fontWeight='bold'>Companies</Typography>
                <Typography textAlign='center' color='#fff' variant='h2' fontSize={mobile ? '26px' : '32px'}>{jobboard.homeSubtitle}</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Grid container justifyContent='center' sx={{ position: 'relative' }}>
          <Grid xs={11} sm={10} lg={9}>
            <Box pb={4} pt={2}>

              <Grid container spacing={2}>
                {data.map((employer, index) => {
                  const hasWebsite = employer.employer.website && employer.employer.website !== 'N/A'
                  return (
                    <Grid key={index} xs={12} md={4} pt={1}>
                      <Box p={mobile ? 2 : 4} sx={{ backgroundColor: '#fff', borderRadius: 1, height: '100%' }}>
                        <Grid pt={0} pb={0} xs={12} display='flex' flexDirection='column' justifyContent='space-between' sx={{ height: '100%' }}>

                          <Box>
                            <Grid pt={0} xs={12} justifyContent='center' display='flex'>
                              <Box sx={{ borderRadius: '50%', border: '1px solid #e8e8e8', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60px', width: '60px', backgroundColor: '#e8f3fd', flexShrink: 0, flexGrow: 0 }}>
                                {employer.employer.logo && <img style={{ borderRadius: '50%' }} src={employer.employer.logo} alt="Company logo" width={'100%'} height={'100%'} />}
                                {!employer.employer.logo && <Typography fontSize={20}>{employer.employer.company.slice(0, 1).toUpperCase()}</Typography>}
                              </Box>
                            </Grid>

                            <Grid mr={0} xs={12} justifyContent='center'>
                              <Typography textAlign='center' fontWeight='bold'>{employer.employer.company}</Typography>
                            </Grid>
                          </Box>
                          
                          <Box>
                            {hasWebsite && (
                              <Grid pt={0} pb={0} mr={0} xs={12} justifyContent='center' display='flex'>
                                <Link href={employer.employer.website} sx={{ textDecoration: 'none' }} rel='noopener noreferrer' target='_blank'>
                                  <Typography textAlign='center' variant='caption'>Visit company website</Typography>
                                </Link>
                              </Grid>
                            )}

                            <Grid pb={0} pt={mobile ? 1 : 0} xs={12} mt={mobile ? 1 : 2} display='flex' justifyContent='center' alignItems='flex-end'>
                              <Button variant='outlined' href={`/?search=${employer.employer.company}`}>View jobs</Button>
                            </Grid>
                          </Box>

                        </Grid>
                      </Box>
                    </Grid>
                  )}
                )}
              </Grid>

              {!data.length && <Box mt={4}><Typography textAlign='center'>No employers found</Typography></Box>}
            </Box>
          </Grid>
        </Grid>
      </main>

      <EmailFooter />
    </div>
  )
}

export default Companies

export const getServerSideProps: GetServerSideProps = async (context) => {
  const protocol = context.req.headers.host?.includes('localhost') ? 'http' : 'https'
  const baseUrl = `${protocol}://${context.req.headers.host}/`
  const baseUrlApi = `${baseUrl}api/`

  const jobboardRes = await axios.get(`${baseUrlApi}jobboards/current`)
  const res = await axios.get(`${baseUrlApi}companies?jobboardId=${jobboardRes.data._id}`)
  
  return {
      props: {
          data: res.data
      }
  }
}