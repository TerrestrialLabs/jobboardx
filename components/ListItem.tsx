import { Box, Button, Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import { AccessTime, Close, LocationOn, Paid } from '@mui/icons-material'
import { getTimeDifferenceString } from '../utils/utils'
import { useRouter } from 'next/router'
import { TYPE_MAP } from '../const/const'
import { formatSalaryRange } from '../utils/utils'
import { JobData } from '../models/Job'

type ListItemProps = JobData & {
  first: boolean
  last: boolean
  trackJobApplyClick?: ({ jobId, subtype }: { jobId: string, subtype: string }) => void
  noLogo?: boolean
}
export const ListItem = ({
  _id,
  first,
  last,
  createdAt,
  datePosted,
  title,
  company,
  companyLogo,
  type,
  location,
  remote,
  skills,
  featured,
  applicationLink,
  salaryMin,
  salaryMax,
  trackJobApplyClick
}: ListItemProps) => {
  const router = useRouter()

  return (
    <Box onClick={() => router.push(`/jobs/${_id}`)} p={2} sx={{ 
      backgroundColor: featured ? 'lightyellow' : '#FAF9F6',
      border: '1px solid #e8e8e8',
      borderTopLeftRadius: first ? 4 : 0,
      borderTopRightRadius: first ? 4 : 0,
      borderBottomLeftRadius: last ? 4 : 0,
      borderBottomRightRadius: last ? 4 : 0,
      cursor: 'pointer',
      transition: '.3s',
      '&:hover': {
        boxShadow: '0px 5px 25px rgba(0, 0, 0, 0.1)',
        borderLeft: '6px solid #4d64e4',
      }
    }}>
      <Grid container alignItems='center'>
        <Grid xs={5} container alignItems='center'>
            <Grid xs={2}>
              <Box mr={2} sx={{ borderRadius: '50%', border: '1px solid #e8e8e8', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '58px', width: '60px', backgroundColor: '#e8f3fd' }}>
                {companyLogo && <img style={{ borderRadius: '50%' }} src={companyLogo} alt="Company logo" width={'100%'} height={'100%'} />}
                {!companyLogo && <Typography fontSize={20}>{company.slice(0, 1).toUpperCase()}</Typography>}
              </Box>
            </Grid>

          <Grid xs={10}>
            <Box mr={2}>
              <Typography variant='subtitle1' sx={{ fontWeight: '600' }}>{title}</Typography>
              <Typography variant='subtitle1' sx={{ fontSize: '13.5px' }}>{company}</Typography>
            </Box>
          </Grid>
        </Grid>
        <Grid xs={5} container>
          <Box display='flex' flexDirection='column'>
            <Grid xs container>
              {skills.slice(0, 3).map(skill => <Grid key={skill} sx={{
                backgroundColor: 'secondary.main',
                margin: 0.5,
                padding: 0.75,
                borderRadius: 1,
                transition: '0.3s',
                cursor: 'pointer',
                fontSize: '14.5px',
                fontWeight: 600,
                color: '#fff'
              }}>
                {skill}
              </Grid>)}
            </Grid>

            <Box mt={1} display='flex' alignItems='center' color='grey'>
                <LocationOn fontSize='small' style={{marginRight: '0.25rem'}} />
                <Typography variant='subtitle2' mr={2}>{remote ? 'Remote' : location}</Typography>

                <AccessTime fontSize='small' style={{marginRight: '0.25rem'}} />
                <Typography variant='subtitle2' mr={2}>{TYPE_MAP[type] || type || 'N/A'}</Typography>

                <Paid fontSize='small' style={{marginRight: '0.25rem'}} />
                <Typography variant='subtitle2'>{formatSalaryRange(salaryMin, salaryMax)}</Typography>
            </Box>
          </Box>
        </Grid>
        <Grid xs={2} container direction='column' alignItems='flex-end'>
          <Grid>
            {/* TO DO: Phase out createdAt when all jobs have datePosted */}
            <Typography variant='caption'>{getTimeDifferenceString(datePosted || createdAt)}</Typography>
          </Grid>
          <Grid>
            <Box mt={2}>
              <Button variant='outlined' onClick={() => trackJobApplyClick && trackJobApplyClick({ jobId: _id, subtype: applicationLink.startsWith('http') ? 'url' : 'email' })} href={applicationLink}>Apply</Button>
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  )
}

export const ListItemMobile = ({
  _id,
  first,
  last,
  createdAt,
  datePosted,
  title,
  company,
  companyLogo,
  type,
  location,
  remote,
  skills,
  perks,
  featured,
  applicationLink,
  salaryMin,
  salaryMax,
  trackJobApplyClick
}: ListItemProps) => {
  const router = useRouter()

  return (
    <Box onClick={() => router.push(`jobs/${_id}`)} p={2} mb={2} sx={{ 
      backgroundColor: featured ? 'lightyellow' : '#fff',
      border: '1px solid #e8e8e8',
      borderRadius: '4px',
      cursor: 'pointer',
      transition: '.3s',
      '&:hover': {
        boxShadow: '0px 5px 25px rgba(0, 0, 0, 0.1)',
        borderLeft: '6px solid #4d64e4',
      }
    }}>
      <Box>
        <Grid container>
          {companyLogo && (<Grid xs={2}>
            <Box sx={{ borderRadius: '50%', border: '1px solid #e8e8e8', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '58px', width: '60px', backgroundColor: '#e8f3fd' }}>
              <img style={{ borderRadius: '50%' }} src={companyLogo} alt="Company logo" width={'100%'} height={'100%'} />
            </Box>
          </Grid>)}

          <Grid xs={companyLogo ? 10 : 12}>
            <Box sx={{ marginLeft: companyLogo ? 2 : 0 }}>
              <Typography variant='subtitle1' sx={{ fontSize: '18px', fontWeight: '600' }}>{title}</Typography>
              <Typography variant='subtitle1' sx={{ fontSize: '13.5px' }}>{company}</Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Box mt={1} display='flex' flexWrap='wrap'>
        <Box display='flex' alignItems='center' color='grey'>
          <LocationOn fontSize='small' style={{marginRight: '0.25rem'}} />
          <Typography variant='subtitle2' mr={2}>{remote ? 'Remote' : location}</Typography>
        </Box>

        <Box display='flex' alignItems='center' color='grey'>
          <AccessTime fontSize='small' style={{marginRight: '0.25rem'}} />
          <Typography variant='subtitle2' mr={2}>{TYPE_MAP[type] || type || 'N/A'}</Typography>
        </Box>

        <Box display='flex' alignItems='center' color='grey'>
          <Paid fontSize='small' style={{marginRight: '0.25rem'}} />
          <Typography variant='subtitle2'>{formatSalaryRange(salaryMin, salaryMax)}</Typography>
        </Box>
      </Box>

      <Box mt={1}>
        <Grid xs container>
          {skills.slice(0, 3).map(skill => <Grid key={skill} sx={{
            backgroundColor: 'secondary.main',
            margin: 0.5,
            padding: 0.75,
            borderRadius: 1,
            transition: '0.3s',
            cursor: 'pointer',
            fontSize: '14.5px',
            fontWeight: 600,
            color: '#fff'
          }}>
            {skill}
          </Grid>)}
        </Grid>
      </Box>

      <Box mt={0.25}>
        <Grid xs container>
          {perks.slice(0, 3).map(perk => <Grid key={perk} sx={{
            backgroundColor: '#e74c3c',
            margin: 0.5,
            padding: 0.75,
            borderRadius: 1,
            transition: '0.3s',
            cursor: 'pointer',
            fontSize: '14.5px',
            fontWeight: 600,
            color: '#fff'
          }}>
            {perk}
          </Grid>)}
        </Grid>
      </Box>

      <Box mt={2} display='flex' justifyContent='space-between' alignItems='center'>
        <Button onClick={() => trackJobApplyClick && trackJobApplyClick({ jobId: _id, subtype: applicationLink.startsWith('http') ? 'url' : 'email' })} sx={{ width: '100px' }} variant='outlined' href={applicationLink}>Apply</Button>
        <Typography variant='caption'>{getTimeDifferenceString(datePosted || createdAt)}</Typography>
      </Box>
    </Box>
  )
}