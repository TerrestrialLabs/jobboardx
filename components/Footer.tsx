import styles from '../styles/Home.module.css'
import Image from 'next/image'
import { Box, Grid, Typography } from '@mui/material'
import Link from 'next/link'
import { useWindowSize } from '../hooks/hooks'
import { useRouter } from 'next/router'
import { useContext } from 'react'
import { JobBoardContext, JobBoardContextValue } from '../context/JobBoardContext'
import { useSession } from '../context/SessionContext'

const Footer = () => {
    const { jobboard, isAdminSite } = useContext(JobBoardContext) as JobBoardContextValue

    const session = useSession()

    const windowSize = useWindowSize()
    const mobile = !!(windowSize.width && windowSize.width < 500)

    const router = useRouter()

    const boardTitle = jobboard ? jobboard.title : 'JobBoardX'

    // TO DO: Return from route functions
    const unsubscribePage = router.pathname === '/unsubscribe/[id]'
    const verifyPage = router.pathname === '/verify'

    if (unsubscribePage || verifyPage) {
        return null
    }
    
    return (
        <footer style={{ padding: '2rem', paddingLeft: 0, paddingRight: 0, paddingBottom: '2rem', borderTop: '1px solid #eaeaea' }}>
            <Grid container justifyContent='center'>
                {isAdminSite && (
                    <Grid justifyContent='center' item xs={11} sm={9} display='flex' flexDirection={mobile ? 'column' : 'row'}>
                        <Box pr={mobile ? 0 : 4} mb={mobile ? 2 : 0} display='flex' flexDirection='column' alignItems={mobile ? 'center' : 'flex-start'}>
                            <Typography fontWeight='bold' mb={1}>Product</Typography>
                            <Typography sx={{ cursor: 'pointer' }} mb={0.5} mr={mobile ? 0 : 4}><Link href='/login'>Sign in</Link></Typography>
                        </Box>
                        <Box pr={mobile ? 0 : 4} mb={mobile ? 2 : 0} display='flex' flexDirection='column' alignItems={mobile ? 'center' : 'flex-start'}>
                            <Typography fontWeight='bold' mb={1}>Legal</Typography>
                            <Typography sx={{ cursor: 'pointer' }} mb={0.5} mr={mobile ? 0 : 4}><Link href='/terms'>Terms of Service</Link></Typography>
                            <Typography sx={{ cursor: 'pointer' }} mb={0.5} mr={mobile ? 0 : 4}><Link href='/privacy'>Privacy Policy</Link></Typography>
                        </Box>
                        <Box display='flex' flexDirection='column' alignItems={mobile ? 'center' : 'flex-start'}>
                            <Typography fontWeight='bold' mb={1}>Contact</Typography>
                            <Typography sx={{ cursor: 'pointer' }} mb={0.5} mr={mobile ? 0 : 4}><Link href='/contact'>Get in touch</Link></Typography>
                        </Box>
                    </Grid>
                )}

                {!isAdminSite && (
                    <Grid justifyContent='center' item xs={11} sm={9} display='flex' flexDirection={mobile ? 'column' : 'row'}>
                        <Box pr={mobile ? 0 : 4} mb={mobile ? 2 : 0} display='flex' flexDirection='column' alignItems={mobile ? 'center' : 'flex-start'}>
                            <Typography fontWeight='bold' mb={1}>Job seekers</Typography>
                            <Typography sx={{ cursor: 'pointer' }} mb={0.5} mr={mobile ? 0 : 4}><Link href='/'>Search jobs</Link></Typography>
                            <Typography sx={{ cursor: 'pointer' }} mb={0.5} mr={mobile ? 0 : 4}><Link href='/companies'>Companies</Link></Typography>
                        </Box>
                        <Box pr={mobile ? 0 : 4} mb={mobile ? 2 : 0} display='flex' flexDirection='column' alignItems={mobile ? 'center' : 'flex-start'}>
                            <Typography fontWeight='bold' mb={1}>Employers</Typography>
                            <Typography sx={{ cursor: 'pointer' }} mb={0.5} mr={mobile ? 0 : 4}><Link href={session?.user ? '/post' : '/employers/login'}>Post a job</Link></Typography>
                            <Typography sx={{ cursor: 'pointer' }} mb={0.5} mr={mobile ? 0 : 4}><Link href='/employers/login'>Sign in</Link></Typography>
                            <Typography sx={{ cursor: 'pointer' }} mb={0.5} mr={mobile ? 0 : 4}><Link href='/signup'>Sign up</Link></Typography>
                        </Box>
                        <Box pr={mobile ? 0 : 4} mb={mobile ? 2 : 0} display='flex' flexDirection='column' alignItems={mobile ? 'center' : 'flex-start'}>
                            <Typography fontWeight='bold' mb={1}>Legal</Typography>
                            <Typography sx={{ cursor: 'pointer' }} mb={0.5} mr={mobile ? 0 : 4}><Link href='/terms'>Terms of Service</Link></Typography>
                            <Typography sx={{ cursor: 'pointer' }} mb={0.5} mr={mobile ? 0 : 4}><Link href='/privacy'>Privacy Policy</Link></Typography>
                        </Box>
                        <Box display='flex' flexDirection='column' alignItems={mobile ? 'center' : 'flex-start'}>
                            <Typography fontWeight='bold' mb={1}>Contact</Typography>
                            <Typography sx={{ cursor: 'pointer' }} mb={0.5} mr={mobile ? 0 : 4}><Link href='/contact'>Get in touch</Link></Typography>
                        </Box>
                    </Grid>
                )}
            </Grid>

            <Grid container justifyContent='center' pt={mobile ? 6 : 4}>
                <Grid item xs={6} >
                    <Box display='flex' justifyContent='center'>
                        <Typography color='grey'>{boardTitle} &#169; 2023</Typography>
                    </Box>
                </Grid>
            </Grid>
        </footer>
    )
}

export default Footer