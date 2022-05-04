import { ReactElement } from 'react'
import PendingTxsList from 'src/components/Dashboard/PendingTxs/PendingTxsList'
import Overview from 'src/components/Dashboard/Overview/Overview'
import SafeAppsGrid from 'src/components/Dashboard/SafeApps/Grid'
import { FeaturedApps } from 'src/components/Dashboard/FeaturedApps/FeaturedApps'
import { Grid } from '@material-ui/core'

const Dashboard = (): ReactElement => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Overview />
      </Grid>

      <Grid item xs={12} md={6} />

      <FeaturedApps />

      <Grid item xs={12} md={6}>
        <PendingTxsList size={4} />
      </Grid>

      <Grid item xs={12}>
        <SafeAppsGrid size={6} />
      </Grid>
    </Grid>
  )
}

export default Dashboard
