import React from 'react'
import styled from 'styled-components'
import { getNetwork } from 'src/config'

import {
  Icon,
  EthHashInfo,
  Text,
  Identicon,
  Button,
  CopyToClipboardBtn,
  EtherscanButton,
} from '@gnosis.pm/safe-react-components'

const Container = styled.div`
  max-width: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

const IdenticonContainer = styled.div`
  width: 100%;
  margin: 8px;
  display: flex;
  justify-content: space-between;

  div:first-of-type {
    width: 32px;
  }
`

const IconContainer = styled.div`
  width: 100px;
  display: flex;
  padding: 8px 0;
  justify-content: space-evenly;
`
const StyledText = styled(Text)`
  margin: 8px 0 16px 0;
`

type Props = {
  address: string
  safeName: string
  balance: string
}

const WalletInfo = ({ address, safeName, balance }: Props): React.ReactElement => {
  return (
    <Container>
      <IdenticonContainer>
        <div></div>
        <Identicon address={address} size="md" />
        <Icon size="md" type="circleDropdown" />
      </IdenticonContainer>

      <Text size="xl">{safeName}</Text>
      <EthHashInfo hash={address} shortenHash={4} textSize="sm" />
      <IconContainer>
        <Icon size="sm" type="qrCode" />
        <CopyToClipboardBtn textToCopy={address} />
        <EtherscanButton value={address} network={getNetwork()} />
      </IconContainer>
      <StyledText size="xl">{balance}</StyledText>
      <Button size="md" iconType="transactionsInactive" color="primary" variant="contained">
        New Transaction
      </Button>
    </Container>
  )
}

export default WalletInfo
