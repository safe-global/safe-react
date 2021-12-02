import React from 'react'
import { Loader } from '@gnosis.pm/safe-react-components'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { matchPath, Redirect, Route, Switch, useHistory, useLocation } from 'react-router-dom'

import { LoadingContainer } from 'src/components/LoaderContainer'
import { useAnalytics } from 'src/utils/googleAnalytics'
import { lastViewedSafe } from 'src/logic/currentSession/store/selectors'
import {
  generateSafeRoute,
  getPrefixedSafeAddressSlug,
  LOAD_SPECIFIC_SAFE_ROUTE,
  OPEN_SAFE_ROUTE,
  ADDRESSED_ROUTE,
  SAFE_ROUTES,
  WELCOME_ROUTE,
  hasPrefixedSafeAddressInUrl,
  ROOT_ROUTE,
  LOAD_SAFE_ROUTE,
  NETWORK_ROOT_ROUTES,
  TRANSACTION_ID_SLUG,
  DAOCREATOR_ROUTE,
} from './routes'
import { getCurrentShortChainName } from 'src/config'
import { switchNetworkWithUrl } from 'src/utils/history'
import { setNetwork } from 'src/logic/config/utils'
import { isDeeplinkedTx } from './safe/components/Transactions/TxList/utils'

const Welcome = React.lazy(() => import('./welcome/Welcome'))
const CreateSafePage = React.lazy(() => import('./CreateSafePage/CreateSafePage'))
const LoadSafePage = React.lazy(() => import('./LoadSafePage/LoadSafePage'))
const Safe = React.lazy(() => import('./safe/container'))
const DAOcreator = React.lazy(()=>import('./DAOcreator/DAOcreator'))

const Routes = (): React.ReactElement => {
  const location = useLocation()
  const history = useHistory()
  const defaultSafe = useSelector(lastViewedSafe)
  const { trackPage } = useAnalytics()

  useEffect(() => {
    const unsubscribe = history.listen(switchNetworkWithUrl)
    return unsubscribe
  }, [history])

  useEffect(() => {
    let pathname = location.pathname

    // Anonymize safe address
    if (hasPrefixedSafeAddressInUrl()) {
      pathname = pathname.replace(getPrefixedSafeAddressSlug(), 'SAFE_ADDRESS')
    }

    // Anonymize deeplinked transaction
    if (isDeeplinkedTx()) {
      const match = matchPath(location.pathname, {
        path: SAFE_ROUTES.TRANSACTIONS_SINGULAR,
      })

      pathname = pathname.replace(match?.params[TRANSACTION_ID_SLUG], 'TRANSACTION_ID')
    }

    trackPage(pathname + location.search)

    // Track when pathname changes
  }, [location.pathname, location.search, trackPage])

  return (
    <Switch>
      <Route
        // Remove all trailing slashes
        path="/:url*(/+)"
        render={() => <Redirect to={location.pathname.replace(/\/+$/, `${location.search}${location.hash}`)} />}
      />
      {
        // Redirection to open network specific welcome pages
        NETWORK_ROOT_ROUTES.map(({ id, route }) => (
          <Route
            key={id}
            path={route}
            render={() => {
              setNetwork(id)
              return <Redirect to={ROOT_ROUTE} />
            }}
          />
        ))
      }
      <Route
        exact
        path={ROOT_ROUTE}
        render={() => {
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
                to={generateSafeRoute(SAFE_ROUTES.ASSETS_BALANCES, {
                  shortName: getCurrentShortChainName(),
                  safeAddress: defaultSafe,
                })}
              />
            )
          }

          return <Redirect to={WELCOME_ROUTE} />
        }}
      />
      <Route component={DAOcreator} exact path={DAOCREATOR_ROUTE} />
      <Route component={Welcome} exact path={WELCOME_ROUTE} />
      <Route component={CreateSafePage} exact path={OPEN_SAFE_ROUTE} />
      <Route component={Safe} path={ADDRESSED_ROUTE} />
      <Route component={LoadSafePage} path={[LOAD_SAFE_ROUTE, LOAD_SPECIFIC_SAFE_ROUTE]} />
      <Redirect to={ROOT_ROUTE} />
    </Switch>
  )
}

export default Routes
