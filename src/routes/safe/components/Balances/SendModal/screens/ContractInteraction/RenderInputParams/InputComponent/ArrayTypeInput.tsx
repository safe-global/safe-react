import React from 'react'

import TextareaField from 'src/components/forms/TextareaField'
import {
  isAddress,
  isBoolean,
  isByte,
  isInt,
  isNotBooleanType,
  isNotNumberType,
  isNotStringType,
  isString,
  isUint,
} from 'src/routes/safe/components/Balances/SendModal/screens/ContractInteraction/utils'

const typeValidator = (type: string) => (value: string): string | undefined => {
  try {
    const values = JSON.parse(value)

    if (!Array.isArray(values)) {
      return 'be sure to surround value with []'
    }

    if ((isAddress(type) || isString(type) || isByte(type)) && values.some(isNotStringType)) {
      return 'values must be surrounded with "'
    }

    if (isBoolean(type) && values.some(isNotBooleanType)) {
      return 'values must be of boolean type'
    }

    if ((isUint(type) || isInt(type)) && values.some(isNotNumberType)) {
      return 'values must be of integer type'
    }
  } catch (e) {
    return 'invalid format'
  }
}

const typePlaceholder = (type: string): string => {
  if (isAddress(type)) {
    return '["0xACa94ef8bD5ffEE41947b4585a84BdA5a3d3DA6E","0x1dF62f291b2E969fB0849d99D9Ce41e2F137006e"]'
  }

  if (isBoolean(type)) {
    return '[true, false, false, true]'
  }

  if (isUint(type)) {
    return '[1000, 212, 320000022, 23]'
  }

  if (isInt(type)) {
    return '[1000, -212, 1232, -1]'
  }

  if (isByte(type)) {
    return `["0xc00000000000000000000000000000000000", "0xc00000000000000000000000000000000001"]`
  }

  return '["first value", "second value", "third value"]'
}

const ArrayTypeInput = ({ name, text, type }: { name: string; text: string; type: string }): JSX.Element => (
  <TextareaField
    name={name}
    placeholder={typePlaceholder(type)}
    text={text}
    type="text"
    validate={typeValidator(type)}
  />
)

export default ArrayTypeInput
