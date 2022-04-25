import { ReactElement, useCallback } from 'react'
import styled from 'styled-components'
import { Text } from '@gnosis.pm/safe-react-components'
import { Box, IconButton } from '@material-ui/core'
import { Link, generatePath } from 'react-router-dom'
import { Icon } from '@gnosis.pm/safe-react-components'

import { GENERIC_APPS_ROUTE } from 'src/routes/routes'
import { md, lg } from 'src/theme/variables'

export const CARD_HEIGHT = 200
export const CARD_PADDING = 24

const StyledLink = styled(Link)`
  display: block;
  text-decoration: none;
  color: black;
  height: 100%;
  position: relative;
  background-color: white;
  border-radius: 8px;
  padding: ${CARD_PADDING}px;
  box-sizing: border-box;
`

const StyledLogo = styled.img`
  display: block;
  width: auto;
  height: 60px;
  margin-bottom: ${md};
`

const IconBtn = styled(IconButton)`
  &.MuiButtonBase-root {
    position: absolute;
    top: ${lg};
    right: ${lg};
    z-index: 10;
    padding: 8px;
  }

  svg {
    width: 16px;
    height: 16px;
    padding-left: 2px;
  }
`

type CardProps = {
  name: string
  description: string
  logoUri: string
  appUri: string
  isPinned: boolean
  onPin: () => void
}

const Card = (props: CardProps): ReactElement => {
  const appRoute = generatePath(GENERIC_APPS_ROUTE) + `?appUrl=${props.appUri}`
  const { isPinned, onPin } = props

  const handlePinClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      onPin()
    },
    [onPin],
  )

  return (
    <StyledLink to={appRoute}>
      <StyledLogo src={props.logoUri} alt={`${props.name} logo`} />

      <Box mb={1}>
        <Text size="xl" strong>
          {props.name}
        </Text>
      </Box>

      <Text size="lg" color="inputFilled">
        {props.description}
      </Text>

      <IconBtn onClick={handlePinClick}>
        {isPinned ? <Icon type="bookmarkFilled" size="md" color="primary" /> : <Icon type="bookmark" size="md" />}
      </IconBtn>
    </StyledLink>
  )
}

export default Card
