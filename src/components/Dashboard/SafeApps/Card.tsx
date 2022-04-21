import { ReactElement, useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { Text } from '@gnosis.pm/safe-react-components'
import { Bookmark, BookmarkBorder } from '@material-ui/icons'
import { Box, IconButton } from '@material-ui/core'
import { Link, generatePath } from 'react-router-dom'

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
    padding: 5px;
  }

  svg {
    width: 20px;
    height: 20px;
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
  const [localPinned, setLocalPinned] = useState<boolean>(isPinned)

  const handlePinClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      setLocalPinned((prev) => !prev)
    },
    [setLocalPinned],
  )

  useEffect(() => {
    if (localPinned === isPinned) return

    // Add a small delay when pinning/unpinning for visual feedback
    const delay = setTimeout(onPin, 500)
    return () => clearTimeout(delay)
  }, [localPinned, isPinned, onPin])

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

      <IconBtn onClick={handlePinClick}>{localPinned ? <Bookmark fontSize="medium" /> : <BookmarkBorder />}</IconBtn>
    </StyledLink>
  )
}

export default Card
