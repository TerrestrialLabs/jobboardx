import { useState } from "react"
import { useWindowSize } from "../hooks/hooks"
import axios from 'axios'
import { Box, Button, CircularProgress, FilledInput, FormControl, FormHelperText, Grid, IconButton, Typography } from '@mui/material'
import { Close } from '@mui/icons-material'

const EmailFooter = () => {
    const [open, setOpen] = useState(true)
    const [email, setEmail] = useState('')
    const [error, setError] = useState(false)
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
  
    const windowSize = useWindowSize()
    const mobile = windowSize.width && windowSize.width < 500
  
    const validate = () => {
      return email.length > 0 && isValidEmail(email)
  }
  
    const isValidEmail = (email: string) => {
      if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
          return (true)
      } else {
          return (false)
      }
    }
  
    const createSubscription = async () => {
        setLoading(true)
        if (!validate()) {
            setError(true)
            setLoading(false)
            return
        }
        setError(false)
        await axios.post(`http://localhost:3000/api/subscriptions`, { email })
        setLoading(false)
        setSubmitted(true)
    }
  
    if (!open) {
      return null
    }
  
    if (mobile) {
      return (
        <Grid container>
          <Grid xs={11}>
            <Box sx={{ backgroundColor: '#fff', borderTop: '1px solid #e8e8e8', zIndex: 999 }} padding='1rem' width='100%' display='flex' alignItems='center' justifyContent='center' position='fixed' bottom={0}>
              <IconButton onClick={() => setOpen(false)} style={{ position: 'absolute', top: '0.25rem', right: '0.25rem' }}>
                <Close />
              </IconButton>
              {submitted ? (
                <>
                  <Typography color='success.main'>
                    Success! You'll be receiving job alerts to your inbox soon.
                  </Typography>
                </>
                ) : (
                <Box display='flex' flexDirection='column' width='100%'>
                  <Typography>Get the best jobs right in your inbox</Typography>
                  <Grid xs={12}>
                    <Box display='flex' mt={1}>
                      <FormControl hiddenLabel fullWidth>
                        <FilledInput placeholder='Your email address' error={error} disableUnderline={!error} sx={{ marginRight: '1rem', height: '45px' }} value={email} onChange={(e) => setEmail(e.target.value)} />
                        {error && <FormHelperText error>Invalid email address</FormHelperText>}
                      </FormControl>
                      <Button onClick={createSubscription} variant='contained' disableElevation sx={{ height: '45px' }}>
                        {loading ? <CircularProgress color='secondary' size={22} /> : 'Subscribe'}
                      </Button>
                    </Box>
                  </Grid>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      )
    }
  
    return (
      <Box color='primary.main' sx={{ backgroundColor: '#fff', borderTop: '1px solid #e8e8e8', zIndex: 999 }} padding='1rem' width='100%' height='78px' display='flex' alignItems='center' justifyContent='center' position='fixed' bottom={0}>
          <IconButton onClick={() => setOpen(false)} style={{ position: 'absolute', top: '0.25rem', right: '0.25rem' }}>
            <Close />
          </IconButton>
          {submitted ? (
            <>
              <Typography color='success.main'>
                Success! You'll be receiving job alerts to your inbox soon.
              </Typography>
            </>
            ) : (
            <>
              <Typography mr={'1rem'}>Get the best jobs right in your inbox</Typography>
              <FormControl hiddenLabel>
                <FilledInput placeholder='Your email address' error={error} disableUnderline={!error} sx={{ marginRight: '1rem', height: '45px', width: '225px' }} value={email} onChange={(e) => setEmail(e.target.value)} />
                {error && <FormHelperText error>Invalid email address</FormHelperText>}
              </FormControl>
              <Button onClick={createSubscription} variant='contained' disableElevation sx={{ height: '45px' }}>
                {loading ? <CircularProgress color='secondary' size={22} /> : 'Subscribe'}
              </Button>
            </>
          )}
        </Box>
    )
}

export default EmailFooter