import { Box, Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import { useWindowSize } from '../hooks/hooks'

const CheckEmail = ({ signup }: { signup?: boolean }) => {
    const windowSize = useWindowSize()
    const mobile = !!(windowSize.width && windowSize.width < 500 )

    return (
        <Grid p={mobile ? 2 : 12} container justifyContent='center'>
            <Grid xs={12} sm={4}>
                <Box p={mobile ? 2 : 4} pt={mobile ? 3 : 4} pb={mobile ? 3 : 4} sx={{ backgroundColor: '#fff', borderRadius: 1 }}>
                    <Grid xs={12}>
                        <Box mb={4}><Typography fontWeight='bold' variant='h1' fontSize={22} align='center'>Check your email</Typography></Box>
                    </Grid>

                    <Box>
                        <Typography textAlign='center'>A {signup ? 'verification' : 'sign in'} link has been sent to your email address.</Typography>
                    </Box>
                </Box>
            </Grid>
        </Grid>
    )
}

export default CheckEmail