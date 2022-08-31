import { ReactElement } from 'react'
import { useDispatch } from 'react-redux'
import Track from 'src/components/Track'
import { BannerCookiesType, COOKIES_KEY, COOKIE_IDS } from 'src/logic/cookies/model/cookie'
import { openCookieBanner } from 'src/logic/cookies/store/actions/openCookieBanner'
import { loadFromCookie } from 'src/logic/cookies/utils'
import styled from 'styled-components'
import { WidgetBody, WidgetContainer, WidgetTitle } from '../styled'

const StyledContainer = styled.div`
  width: 100%;
  height: 227px;
  background: url('./rebranding-banner.png') no-repeat 0 0;
  background-size: contain;
  cursor: pointer;
`

const RebrandingBanner = (): ReactElement => {
  const dispatch = useDispatch()

  const onClick = (): void => {
    const cookiesState = loadFromCookie<BannerCookiesType>(COOKIES_KEY)
    if (!cookiesState) {
      dispatch(openCookieBanner({ cookieBannerOpen: true }))
      return
    }
    if (!cookiesState.acceptedSupportAndUpdates) {
      dispatch(
        openCookieBanner({
          cookieBannerOpen: true,
          key: COOKIE_IDS.BEAMER,
        }),
      )
    }
  }

  return (
    <WidgetContainer>
      <WidgetTitle>&nbsp;</WidgetTitle>

      <WidgetBody>
        <Track category="rebranding" action="banner-click">
          <StyledContainer onClick={onClick} className="beamer-trigger" />
        </Track>
      </WidgetBody>
    </WidgetContainer>
  )
}

export default RebrandingBanner
