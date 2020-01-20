// @flow
import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import cn from 'classnames'
import Button from '~/components/layout/Button'
import Img from '~/components/layout/Img'
import EtherscanLink from '~/components/EtherscanLink'
import Identicon from '~/components/Identicon'
import Block from '~/components/layout/Block'
import Paragraph from '~/components/layout/Paragraph'
import { type Owner } from '~/routes/safe/store/models/owner'
import { styles } from './style'
import ConfirmSmallGreyIcon from './assets/confirm-small-grey.svg'
import ConfirmSmallGreenIcon from './assets/confirm-small-green.svg'
import ConfirmSmallFilledIcon from './assets/confirm-small-filled.svg'
import ConfirmSmallRedIcon from './assets/confirm-small-red.svg'
import CancelSmallFilledIcon from './assets/cancel-small-filled.svg'
import { getNameFromAddressBook } from '~/logic/addressBook/utils'

export const CONFIRM_TX_BTN_TEST_ID = 'confirm-btn'
export const EXECUTE_TX_BTN_TEST_ID = 'execute-btn'
export const CANCEL_TX_BTN_TEST_ID = 'cancel-btn'

type OwnerProps = {
  classes: Object,
  confirmed?: boolean,
  executor?: string,
  isCancelTx?: boolean,
  onTxCancel?: Function,
  onTxConfirm: Function,
  onTxExecute: Function,
  owner: Owner,
  showCancelBtn: Boolean,
  showConfirmBtn: boolean,
  showExecuteBtn: boolean,
  thresholdReached: boolean,
  userAddress: string,
}

const OwnerComponent = ({
  onTxCancel,
  classes,
  confirmed,
  executor,
  isCancelTx,
  onTxConfirm,
  onTxExecute,
  owner,
  showCancelBtn,
  showConfirmBtn,
  showExecuteBtn,
  thresholdReached,
  userAddress,
}: OwnerProps) => {
  const nameInAdbk = getNameFromAddressBook(owner.address)
  const ownerName = owner.name === 'UNKNOWN' && nameInAdbk ? nameInAdbk : owner.name

  return (
    <Block className={classes.container}>
      <div
        className={
          // eslint-disable-next-line no-nested-ternary
          confirmed || thresholdReached || executor
            ? isCancelTx ? classes.verticalLineCancelProgressDone : classes.verticalLineProgressDone
            : classes.verticalLineProgressPending
        }
      />
      <div className={classes.iconState}>
        {confirmed ? (
          <Img src={isCancelTx ? CancelSmallFilledIcon : ConfirmSmallFilledIcon} />
        ) : thresholdReached || executor ? (
          <Img src={isCancelTx ? ConfirmSmallRedIcon : ConfirmSmallGreenIcon} />
        ) : (
          <Img src={ConfirmSmallGreyIcon} />
        )}
      </div>
      <Identicon address={owner.address} diameter={32} className={classes.icon} />
      <Block>
        <Paragraph className={classes.name} noMargin>
          {ownerName}
        </Paragraph>
        <EtherscanLink
          className={classes.address}
          type="address"
          value={owner.address}
          cut={4}
        />
      </Block>
      <Block className={classes.spacer} />
      {showConfirmBtn && owner.address === userAddress && (
        <Button
          className={classes.button}
          color="primary"
          onClick={onTxConfirm}
          testId={CONFIRM_TX_BTN_TEST_ID}
          variant="contained"
        >
          Confirm
        </Button>
      )}
      {showExecuteBtn && owner.address === userAddress && (
        <Button
          className={classes.button}
          color="primary"
          onClick={onTxExecute}
          testId={EXECUTE_TX_BTN_TEST_ID}
          variant="contained"
        >
          Execute
        </Button>
      )}
      {(showExecuteBtn || showConfirmBtn) && showCancelBtn && owner.address === userAddress && (
        <Button
          className={cn(classes.button, classes.lastButton)}
          color="secondary"
          onClick={onTxCancel}
          testId={CANCEL_TX_BTN_TEST_ID}
          variant="contained"
        >
          Reject
        </Button>
      )}
      {owner.address === executor && (
        <Block className={classes.executor}>Executor</Block>
      )}
    </Block>
  )
}

export default withStyles(styles)(OwnerComponent)
