// @flow
import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  display: flex;
  align-items: center;
`
const Icon = styled.img`
  max-width: 15px;
  max-height: 15px;
  margin-right: 5px;
`
const Text = styled.div`
  height: 17px;
`

const IconText = ({ iconUrl, text }: { iconUrl: string, text: string }) => (
  <Wrapper>
    <Icon src={iconUrl} alt={text} />
    <Text>{text}</Text>
  </Wrapper>
)

export default IconText
