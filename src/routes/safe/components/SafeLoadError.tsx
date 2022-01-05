import { ReactElement } from 'react'
import { useHistory } from 'react-router-dom'
import { Title } from '@gnosis.pm/safe-react-components'
import styled from 'styled-components'

import Button from 'src/components/layout/Button'
import { WELCOME_ROUTE } from 'src/routes/routes'

const SafeLoadError = (): ReactElement => {
  const history = useHistory()

  const handleClick = () => {
    history.push(WELCOME_ROUTE)
  }

  return (
    <ErrorContainer>
      <img src="./resources/error.png" alt="Error" />
      <Title size="xs">This Safe couldn&apos;t be loaded</Title>
      <Button onClick={handleClick} color="primary" size="medium" variant="contained">
        Back to Main Page
      </Button>
    </ErrorContainer>
  )
}

export const ErrorContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  // Offset so that it is centered relative to the header
  margin-top: -30px;
`

export default SafeLoadError
