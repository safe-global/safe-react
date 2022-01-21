import { ReactElement, ReactNode } from 'react'
import styled from 'styled-components'
import { CopyToClipboardBtn, Text } from '@gnosis.pm/safe-react-components'

import { InlinePrefixedEthHashInfo, StyledGridRow } from './styled'
import { getExplorerInfo } from 'src/config'
import { getByteLength } from 'src/utils/getByteLength'
import Value from 'src/routes/safe/components/Transactions/TxList/MethodValue'

const FlexWrapper = styled.div<{ margin: number }>`
  display: flex;
  align-items: center;

  > :nth-child(2) {
    margin-left: ${({ margin }) => margin}px;
  }
`

type TxDataRowType = {
  children?: ReactNode
  inlineType?: 'hash' | 'rawData'
  hasExplorer?: boolean
  title: string
  value?: string
  isArray?: boolean
  method?: string
  paramType?: string
}

export const TxDataRow = ({
  children,
  inlineType,
  hasExplorer = true,
  title,
  value,
  isArray,
  method,
  paramType,
}: TxDataRowType): ReactElement => (
  <StyledGridRow>
    <Text size="xl" as="span" color="placeHolder">
      {title}
    </Text>
    {isArray && value && method && paramType && <Value method={method} type={paramType} value={value as string} />}
    {value && typeof value === 'string' && inlineType === 'hash' && (
      <InlinePrefixedEthHashInfo
        textSize="xl"
        hash={value}
        shortenHash={8}
        showCopyBtn
        explorerUrl={hasExplorer ? getExplorerInfo(value) : undefined}
      />
    )}
    {value && typeof value === 'string' && inlineType === 'rawData' && (
      <FlexWrapper margin={5}>
        <Text size="xl">{value ? getByteLength(value) : 0} bytes</Text>
        <CopyToClipboardBtn textToCopy={value} />
      </FlexWrapper>
    )}
    {!inlineType && !isArray && value && (
      <Text size="xl" as="span">
        {value}
      </Text>
    )}
    {children}
  </StyledGridRow>
)
