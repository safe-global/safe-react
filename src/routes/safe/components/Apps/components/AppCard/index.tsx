import React, { SyntheticEvent } from 'react'
import styled from 'styled-components'
import { fade } from '@material-ui/core/styles/colorManipulator'
import { Title, Text, Button, Card } from '@gnosis.pm/safe-react-components'

import appsIconSvg from 'src/assets/icons/apps.svg'
import { AppIconSK, DescriptionSK, TitleSK } from './skeleton'

const AppCard = styled(Card)`
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: space-evenly;
  box-shadow: 1px 2px 10px 0 ${({ theme }) => fade(theme.colors.shadow.color, 0.18)};
  height: 232px;
  cursor: pointer;

  :hover {
    box-shadow: 1px 2px 16px 0 ${({ theme }) => fade(theme.colors.shadow.color, 0.35)};
    transition: box-shadow 0.3s ease-in-out;
    cursor: pointer;

    h4 {
      color: ${({ theme }) => theme.colors.primary};
    }
  }
`

const IconImg = styled.img<{ size: 'md' | 'lg'; src: string | undefined }>`
  width: ${({ size }) => (size === 'md' ? '48px' : '102px')};
  height: ${({ size }) => (size === 'md' ? '60px' : '92px')};
  object-fit: contain;
`

const AppName = styled(Title)`
  text-align: center;
`

const AppDescription = styled(Text)`
  height: 40px;
  text-align: center;
`

export const setAppImageFallback = (error: SyntheticEvent<HTMLImageElement, Event>): void => {
  error.currentTarget.onerror = null
  error.currentTarget.src = appsIconSvg
}

export enum TriggerType {
  Button,
  Content,
}

type Props = {
  onClick?: () => void
  isLoading?: boolean
  className?: string
  name?: string
  description?: string
  iconUrl?: string
  iconSize?: 'md' | 'lg'
  buttonText?: string
}

const Apps = ({
  isLoading = false,
  className,
  name,
  description,
  iconUrl,
  iconSize = 'md',
  buttonText,
  onClick = () => undefined,
}: Props): React.ReactElement => {
  if (isLoading) {
    return (
      <AppCard className={className}>
        <AppIconSK />
        <TitleSK />
        <DescriptionSK />
        <DescriptionSK />
      </AppCard>
    )
  }

  return (
    <AppCard className={className} onClick={onClick}>
      <IconImg alt={`${name || 'App'} Logo`} src={iconUrl} onError={setAppImageFallback} size={iconSize} />

      {name && <AppName size="sm">{name}</AppName>}

      {description && <AppDescription size="lg">{description} </AppDescription>}

      {buttonText && (
        <Button size="md" color="primary" variant="contained" onClick={onClick}>
          {buttonText}
        </Button>
      )}
    </AppCard>
  )
}

export default Apps
