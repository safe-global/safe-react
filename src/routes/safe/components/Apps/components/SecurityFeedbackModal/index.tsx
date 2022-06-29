import { memo, useMemo, useState } from 'react'
import styled from 'styled-components'
import Grid from '@material-ui/core/Grid'
import LinearProgress from '@material-ui/core/LinearProgress'
import { alpha } from '@material-ui/core/styles'
import Slider from './Slider'
import LegalDisclaimer from './LegalDisclaimer'
import SecurityFeedbackList from './SecurityFeedbackList'
import UnknownAppWarning from './UnknownAppWarning'
import { SECURITY_PRACTICES } from './constants'
import SecurityFeedbackContent from './SecurityFeedbackContent'
import { SecurityFeedbackPractice } from '../../types'
import SecurityFeedbackDomain from './SecurityFeedbackDomain'

interface SecurityFeedbackModalProps {
  onCancel: () => void
  onConfirm: (hideWarning: boolean) => void
  appUrl: string
  isConsentAccepted?: boolean
  isSafeAppInDefaultList: boolean
  isFirstTimeAccessingApp: boolean
  isExtendedListReviewed: boolean
}

const SecurityFeedbackModal = ({
  onCancel,
  onConfirm,
  appUrl,
  isConsentAccepted,
  isSafeAppInDefaultList,
  isFirstTimeAccessingApp,
  isExtendedListReviewed,
}: SecurityFeedbackModalProps): JSX.Element => {
  const [hideWarning, setHideWarning] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(1)

  const handleComplete = () => {
    onConfirm(hideWarning)
  }

  const handleSlideChange = (step: number) => {
    setCurrentSlide(step + 1)
  }

  const totalSlides = useMemo(() => {
    let totalSlides = 0

    if (!isConsentAccepted) {
      totalSlides += 1
    }

    if (isFirstTimeAccessingApp && isExtendedListReviewed) {
      totalSlides += 1
    }

    if (isFirstTimeAccessingApp && !isExtendedListReviewed) {
      totalSlides += SECURITY_PRACTICES.length
    }

    if (!isSafeAppInDefaultList && isFirstTimeAccessingApp) {
      totalSlides += 1
    }

    return totalSlides
  }, [isConsentAccepted, isExtendedListReviewed, isFirstTimeAccessingApp, isSafeAppInDefaultList])

  const progressValue = useMemo(() => {
    return (currentSlide * 100) / totalSlides
  }, [currentSlide, totalSlides])

  const isLastSlide = useMemo(() => {
    return currentSlide === totalSlides
  }, [currentSlide, totalSlides])

  const shouldShowUnknownAppWarning = useMemo(
    () => !isSafeAppInDefaultList && isFirstTimeAccessingApp,
    [isFirstTimeAccessingApp, isSafeAppInDefaultList],
  )

  return (
    <StyledContainer>
      <StyledWrapper>
        <StyledLinearProgress
          variant="determinate"
          value={progressValue}
          isWarningStep={isLastSlide && shouldShowUnknownAppWarning}
        />
        <StyledGrid container justifyContent="center" alignItems="center" direction="column">
          <Slider onCancel={onCancel} onComplete={handleComplete} onSlideChange={handleSlideChange}>
            {!isConsentAccepted && <LegalDisclaimer />}
            {isFirstTimeAccessingApp && isExtendedListReviewed && (
              <SecurityFeedbackList practices={SECURITY_PRACTICES} appUrl={appUrl} />
            )}
            {isFirstTimeAccessingApp &&
              !isExtendedListReviewed &&
              SECURITY_PRACTICES.map((practice: SecurityFeedbackPractice) => {
                return practice.imageSrc ? (
                  <SecurityFeedbackContent key={practice.id} {...practice} />
                ) : (
                  <SecurityFeedbackContent key={practice.id} {...practice}>
                    <SecurityFeedbackDomain url={appUrl} />
                  </SecurityFeedbackContent>
                )
              })}
            {shouldShowUnknownAppWarning && <UnknownAppWarning onHideWarning={setHideWarning} />}
          </Slider>
        </StyledGrid>
      </StyledWrapper>
    </StyledContainer>
  )
}

const StyledContainer = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`

const StyledWrapper = styled.div`
  width: 450px;
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: 8px;
  box-shadow: 1px 2px 10px 0 ${({ theme }) => alpha(theme.colors.shadow.color, 0.18)};
`

const StyledGrid = styled(Grid)`
  text-align: center;
  padding: 24px;
`

const StyledLinearProgress = styled(LinearProgress)<{ isWarningStep: boolean }>`
  height: 6px;
  background-color: #fff;
  border-radius: 8px 8px 0 0;
  .MuiLinearProgress-bar {
    background-color: ${({ theme, isWarningStep }) => (isWarningStep ? '#e8663d' : theme.colors.primary)};
    border-radius: 8px;
  }
`

export default memo(SecurityFeedbackModal)
