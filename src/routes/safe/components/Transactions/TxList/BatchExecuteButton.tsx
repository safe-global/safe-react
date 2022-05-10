import { Theme, Tooltip, withStyles } from '@material-ui/core'
import { ReactElement, useCallback, useContext, useMemo } from 'react'
import { useSelector } from 'react-redux'
import Button from 'src/components/layout/Button'
import { OnboardingWidget } from 'src/components/OnboardingWidget'
import { getBatchableTransactions } from 'src/logic/safe/store/selectors/gatewayTransactions'
import { isTxPending } from 'src/logic/safe/store/selectors/pendingTransactions'
import { AppReduxState } from 'src/store'
import { md, sm } from 'src/theme/variables'
import styled from 'styled-components'
import { BatchExecuteHoverContext } from './BatchExecuteHoverProvider'

interface BatchExecuteButtonProps {
  onClick: () => void
}

const helpLocalStorageId = 'batchExecutionButtonSeen'

export const BatchExecuteButton = ({ onClick }: BatchExecuteButtonProps): ReactElement => {
  const batchableTransactions = useSelector(getBatchableTransactions)
  const hoverContext = useContext(BatchExecuteHoverContext)
  const store = useSelector((state: AppReduxState) => state)
  const hasPendingTx = useMemo(
    () => batchableTransactions.some(({ id }) => isTxPending(store, id)),
    [batchableTransactions, store],
  )
  const isBatchable = batchableTransactions.length > 1
  const isDisabled = !isBatchable || hasPendingTx

  const handleOnMouseEnter = useCallback(() => {
    hoverContext.setActiveHover(batchableTransactions.map((tx) => tx.id))
  }, [batchableTransactions, hoverContext])

  const handleOnMouseLeave = useCallback(() => {
    hoverContext.setActiveHover()
  }, [hoverContext])

  return (
    <OnboardingWidget
      text="Queued transactions can now be executed in batch!"
      widgetLocalStorageId={helpLocalStorageId}
    >
      {/* Button wrapper needed, because the Tooltip otherwise can't correctly bind its mouseEnter and mouseLeave events to the button */}
      <StyledTooltip
        interactive
        title={
          isDisabled
            ? 'Batch execution is only available for transactions that have been fully signed and which are strictly sequential in Safe Nonce.'
            : 'All transactions highlighted in light green will be included in the batch execution.'
        }
        arrow
        placement="top-start"
      >
        <ButtonWrapper>
          <Button
            color="primary"
            variant="contained"
            onClick={onClick}
            disabled={isDisabled}
            onMouseEnter={handleOnMouseEnter}
            onMouseLeave={handleOnMouseLeave}
          >
            Execute Batch {isBatchable && `(${batchableTransactions.length})`}
          </Button>
        </ButtonWrapper>
      </StyledTooltip>
    </OnboardingWidget>
  )
}

const ButtonWrapper = styled.span`
  align-self: flex-end;
  margin-right: ${sm};
  margin-top: -51px;
  margin-bottom: ${md};
  z-index: 0;
`

const StyledTooltip = withStyles(({ palette }: Theme) => ({
  arrow: {
    '&::before': {
      backgroundColor: palette.common.white,
      boxShadow: '1px 2px 10px rgba(40, 54, 61, 0.18)',
    },
  },
  tooltip: {
    color: palette.common.black,
    backgroundColor: palette.common.white,
    borderRadius: '8px',
    boxShadow: '1px 2px 10px rgba(40, 54, 61, 0.18)',
    fontSize: '14px',
    padding: '16px',
  },
}))(Tooltip)
