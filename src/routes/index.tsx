import React from 'react'
import { Loader } from '@gnosis.pm/safe-react-components'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { generatePath, Redirect, Route, Switch, useLocation, useRouteMatch } from 'react-router-dom'

import {
  BASE_SAFE_ROUTE,
  getNetworkSlug,
  LOAD_ROUTE,
  OPEN_ROUTE,
  ROOT_ROUTE,
  SAFE_ROUTES,
  WELCOME_ROUTE,
} from 'src/routes/routes'
import { LoadingContainer } from 'src/components/LoaderContainer'
import { useAnalytics } from 'src/utils/googleAnalytics'
import { lastViewedSafe } from 'src/logic/currentSession/store/selectors'

const Welcome = React.lazy(() => import('./welcome/Welcome'))
const CreateSafePage = React.lazy(() => import('./CreateSafePage/CreateSafePage'))
const LoadSafePage = React.lazy(() => import('./LoadSafePage/LoadSafePage'))
const Safe = React.lazy(() => import('./safe/container'))

const Routes = (): React.ReactElement => {
  const [isInitialLoad, setInitialLoad] = useState(true)
  const location = useLocation()
  const matchSafeWithAction = useRouteMatch<{ safeAddress: string; safeAction: string }>({
    path: `${BASE_SAFE_ROUTE}/:safeAction`,
  })

  const defaultSafe = useSelector(lastViewedSafe)
  const { trackPage } = useAnalytics()

  useEffect(() => {
    if (isInitialLoad && ['/', generatePath(ROOT_ROUTE, { network: getNetworkSlug() })].includes[location.pathname]) {
      setInitialLoad(false)
    }
  }, [location.pathname, isInitialLoad])

  useEffect(() => {
    if (matchSafeWithAction) {
      const safePage = generatePath(BASE_SAFE_ROUTE, {
        network: getNetworkSlug(),
        // prevent logging safeAddress
        safeAddress: 'SAFE_ADDRESS',
        ...(matchSafeWithAction.params?.safeAction && {
          safeAction: matchSafeWithAction.params.safeAction,
        }),
      })

      trackPage(safePage)
    } else {
      const pathname = location.pathname
        .split('/')
        .map((el) => (el.startsWith('0x') ? 'SAFE_ADDRESS' : el))
        .join('/')
      trackPage(pathname + location.search)
    }
  }, [location, matchSafeWithAction, trackPage])

  const baseRouteSlugs = {
    network: getNetworkSlug(),
  }

  return (
    <Switch>
      <Route
        exact
        path={['/', ROOT_ROUTE]}
        render={() => {
          if (!isInitialLoad) {
            return <Redirect to={generatePath(WELCOME_ROUTE, baseRouteSlugs)} />
          }

          if (defaultSafe === null) {
            return (
              <LoadingContainer>
                <Loader size="md" />
              </LoadingContainer>
            )
          }

          if (defaultSafe) {
            return (
              <Redirect
                to={generatePath(SAFE_ROUTES.ASSETS_BALANCES, {
                  ...baseRouteSlugs,
                  safeAddress: defaultSafe,
                })}
              />
            )
          }

          return <Redirect to={generatePath(WELCOME_ROUTE, baseRouteSlugs)} />
        }}
      />
      <Route component={Welcome} exact path={WELCOME_ROUTE} />
      <Route component={CreateSafePage} exact path={OPEN_ROUTE} />
      <Route component={Safe} path={BASE_SAFE_ROUTE} />
      <Route component={LoadSafePage} path={`${LOAD_ROUTE}/:safeAddress?`} />
      <Redirect to={generatePath(ROOT_ROUTE, baseRouteSlugs)} />
    </Switch>
  )
}

export default Routes
