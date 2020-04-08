// @flow
import { withStyles } from '@material-ui/core/styles'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import Receive from './Receive'
import Tokens from './Tokens'
import { styles } from './style'

import Modal from '~/components/Modal'
import ButtonLink from '~/components/layout/ButtonLink'
import Col from '~/components/layout/Col'
import Divider from '~/components/layout/Divider'
import Link from '~/components/layout/Link'
import Row from '~/components/layout/Row'
import { SAFELIST_ADDRESS } from '~/routes/routes'
import Fetchtokens, { useFetchTokens } from '~/routes/safe/components/Balances/FetchTokens'
import SendModal from '~/routes/safe/components/Balances/SendModal'
import DropdownCurrency from '~/routes/safe/components/DropdownCurrency'
import { safeFeaturesEnabledSelector, safeParamAddressFromStateSelector } from '~/routes/safe/store/selectors'
import { history } from '~/store'
const Collectibles = React.lazy(() => import('~/routes/safe/components/Balances/Collectibles'))
const Coins = React.lazy(() => import('~/routes/safe/components/Balances/Coins'))

export const MANAGE_TOKENS_BUTTON_TEST_ID = 'manage-tokens-btn'
export const BALANCE_ROW_TEST_ID = 'balance-row'

type State = {
  erc721Enabled: boolean,
  subMenuOptions: string[],
  sendFunds: Object,
  showCoins: boolean,
  showCollectibles: boolean,
  showReceive: boolean,
  showToken: boolean,
  showManageCollectibleModal: boolean,
}

type Props = {
  classes: Object,
}

type Action = 'Token' | 'Send' | 'Receive' | 'ManageCollectibleModal'

const INITIAL_STATE: State = {
  erc721Enabled: false,
  subMenuOptions: [],
  showToken: false,
  showManageCollectibleModal: false,
  sendFunds: {
    isOpen: false,
    selectedToken: undefined,
  },
  showCoins: true,
  showCollectibles: false,
  showReceive: false,
}

const Balances = (props: Props) => {
  const [state, setState] = useState(INITIAL_STATE)

  const address = useSelector(safeParamAddressFromStateSelector)
  const featuresEnabled = useSelector(safeFeaturesEnabledSelector)
  useFetchTokens()

  useEffect(() => {
    const isCoinsLocation = /\/balances\/?$/
    const isCollectiblesLocation = /\/balances\/collectibles$/
    const showCollectibles = isCollectiblesLocation.test(history.location.pathname)
    const showCoins = isCoinsLocation.test(history.location.pathname)

    if (!showCollectibles && !showCoins) {
      history.replace(`${SAFELIST_ADDRESS}/${address}/balances`)
    }

    const subMenuOptions = [{ enabled: showCoins, legend: 'Coins', url: `${SAFELIST_ADDRESS}/${address}/balances` }]
    const erc721Enabled = featuresEnabled.includes('ERC721')

    if (erc721Enabled) {
      subMenuOptions.push({
        enabled: showCollectibles,
        legend: 'Collectibles',
        url: `${SAFELIST_ADDRESS}/${address}/balances/collectibles`,
      })
    } else {
      if (showCollectibles) {
        history.replace(subMenuOptions[0].url)
      }
    }

    setState({
      ...state,
      showCoins,
      showCollectibles,
      erc721Enabled,
      subMenuOptions,
    })
  }, [])

  const onShow = (action: Action) => {
    setState({ ...state, [`show${action}`]: true })
  }

  const onHide = (action: Action) => {
    setState(() => ({ ...state, [`show${action}`]: false }))
  }

  const showSendFunds = (tokenAddress: string) => {
    setState({
      ...state,
      sendFunds: {
        isOpen: true,
        selectedToken: tokenAddress,
      },
    })
  }

  const hideSendFunds = () => {
    setState({
      ...state,
      sendFunds: {
        isOpen: false,
        selectedToken: undefined,
      },
    })
  }

  const {
    assetDivider,
    assetTab,
    assetTabActive,
    assetTabs,
    controls,
    manageTokensButton,
    receiveModal,
    tokenControls,
  } = props.classes
  const {
    erc721Enabled,
    sendFunds,
    showCoins,
    showCollectibles,
    showManageCollectibleModal,
    showReceive,
    showToken,
    subMenuOptions,
  } = state

  const renderCollectiblesTab = () => (
    <React.Suspense>
      <Collectibles />
    </React.Suspense>
  )
  const renderCoinsTab = () => (
    <React.Suspense>
      <Coins showReceiveFunds={() => onShow('Receive')} showSendFunds={showSendFunds} />
    </React.Suspense>
  )

  return (
    <>
      <Row align="center" className={controls}>
        <Col className={assetTabs} sm={6} start="sm" xs={12}>
          {subMenuOptions.length > 1 &&
            subMenuOptions.map(({ enabled, legend, url }, index) => (
              <React.Fragment key={`legend-${index}`}>
                {index > 0 && <Divider className={assetDivider} />}
                <Link
                  className={enabled ? assetTabActive : assetTab}
                  data-testid={`${legend.toLowerCase()}'-assets-btn'`}
                  size="md"
                  to={url}
                  weight={enabled ? 'bold' : 'regular'}
                >
                  {legend}
                </Link>
              </React.Fragment>
            ))}
        </Col>
        <Col className={tokenControls} end="sm" sm={6} xs={12}>
          {showCoins && <DropdownCurrency />}
          <ButtonLink
            className={manageTokensButton}
            onClick={erc721Enabled && showCollectibles ? () => onShow('ManageCollectibleModal') : () => onShow('Token')}
            size="lg"
            testId="manage-tokens-btn"
          >
            Manage List
          </ButtonLink>
          <Modal
            description={
              erc721Enabled ? 'Enable and disables assets to be listed' : 'Enable and disable tokens to be listed'
            }
            handleClose={showManageCollectibleModal ? () => onHide('ManageCollectibleModal') : () => onHide('Token')}
            open={showToken || showManageCollectibleModal}
            title="Manage List"
          >
            <Tokens
              modalScreen={showManageCollectibleModal ? 'assetsList' : 'tokenList'}
              onClose={showManageCollectibleModal ? () => onHide('ManageCollectibleModal') : () => onHide('Token')}
              safeAddress={address}
            />
          </Modal>
        </Col>
      </Row>
      {showCoins && renderCoinsTab()}
      {erc721Enabled && showCollectibles && renderCollectiblesTab()}
      <SendModal
        activeScreenType="sendFunds"
        isOpen={sendFunds.isOpen}
        onClose={hideSendFunds}
        selectedToken={sendFunds.selectedToken}
      />
      <Modal
        description="Receive Tokens Form"
        handleClose={() => onHide('Receive')}
        open={showReceive}
        paperClassName={receiveModal}
        title="Receive Tokens"
      >
        <Receive onClose={() => onHide('Receive')} />
      </Modal>
    </>
  )
}

export default withStyles(styles)(Balances)
