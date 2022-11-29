import styles from '../styles/Home.module.css'
import Image from 'next/image'
import { Box, Grid, Typography } from '@mui/material'
import Link from 'next/link'
import { useWindowSize } from '../hooks/hooks'
import { useRouter } from 'next/router'

const Footer = () => {
    const windowSize = useWindowSize()
    const mobile = !!(windowSize.width && windowSize.width < 500)

    const router = useRouter()

    const unsubscribePage = router.pathname === '/unsubscribe/[id]'

    if (unsubscribePage) {
        return null
    }
    
    return (
        <footer style={{ padding: '2rem', paddingBottom: '3rem', borderTop: '1px solid #eaeaea' }}>

            <Grid container justifyContent='center'>
                <Grid xs={12} sm={6} display='flex' flexDirection={mobile ? 'column' : 'row'}>
                    <Grid xs={12} sm={4} mb={mobile ? 2 : 0} display='flex' flexDirection='column' alignItems={mobile ? 'center' : 'flex-start'}>
                        <Typography fontWeight='bold' mb={1}>Product</Typography>
                        <Typography sx={{ cursor: 'pointer' }} mb={0.5} mr={mobile ? 0 : 4}><Link href='/'>Home</Link></Typography>
                        <Typography sx={{ cursor: 'pointer' }} mb={0.5} mr={mobile ? 0 : 4}><Link href='/post'>Post a job</Link></Typography>
                    </Grid>
                    <Grid xs={12} sm={4} mb={mobile ? 2 : 0} display='flex' flexDirection='column' alignItems={mobile ? 'center' : 'flex-start'}>
                        <Typography fontWeight='bold' mb={1}>Legal</Typography>
                        <Typography sx={{ cursor: 'pointer' }} mb={0.5} mr={mobile ? 0 : 4}><Link href='/terms'>Terms of Service</Link></Typography>
                        <Typography sx={{ cursor: 'pointer' }} mb={0.5} mr={mobile ? 0 : 4}><Link href='/privacy'>Privacy Policy</Link></Typography>
                    </Grid>
                    <Grid xs={12} sm={4} display='flex' flexDirection='column' alignItems={mobile ? 'center' : 'flex-start'}>
                        <Typography fontWeight='bold' mb={1}>Contact</Typography>
                        <Typography sx={{ cursor: 'pointer' }} mb={0.5} mr={mobile ? 0 : 4}><Link href='/contact'>Get in touch</Link></Typography>
                    </Grid>
                </Grid>
            </Grid>

            <Grid container justifyContent='center' pt={mobile ? 6 : 4}>
                <Grid xs={6} >
                    <Box display='flex' justifyContent={mobile ? 'center' : 'flex-start'}>
                        <Typography color='grey'>React Jobs &#169; 2022</Typography>
                    </Box>
                </Grid>
            </Grid>

        </footer>
    )
}

export default Footer