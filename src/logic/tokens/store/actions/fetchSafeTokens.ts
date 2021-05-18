import { List } from 'immutable'
import { Dispatch } from 'redux'

import { fetchTokenCurrenciesBalances, TokenBalance } from 'src/logic/safe/api/fetchTokenCurrenciesBalances'
import { addTokens } from 'src/logic/tokens/store/actions/addTokens'
import { makeToken, Token } from 'src/logic/tokens/store/model/token'
import { updateSafe } from 'src/logic/safe/store/actions/updateSafe'
import { AppReduxState } from 'src/store'
import { humanReadableValue } from 'src/logic/tokens/utils/humanReadableValue'
import { safeNameSelector, safeSelector } from 'src/logic/safe/store/selectors'
import BigNumber from 'bignumber.js'
import { currentCurrencySelector } from 'src/logic/currencyValues/store/selectors'
import { ZERO_ADDRESS, sameAddress } from 'src/logic/wallets/ethAddresses'
import { LOADED_SAFE_KEY } from 'src/utils/constants'

export type BalanceRecord = {
  tokenAddress?: string
  tokenBalance: string
  fiatBalance?: string
}

interface ExtractedData {
  balances: Array<BalanceRecord>
  ethBalance: string
  tokens: List<Token>
}

const extractDataFromResult = (
  acc: ExtractedData,
  { balance, fiatBalance, tokenInfo }: TokenBalance,
): ExtractedData => {
  const { address, decimals } = tokenInfo

  acc.balances.push({
    tokenAddress: address,
    fiatBalance,
    tokenBalance: humanReadableValue(balance, Number(decimals)),
  })

  // Extract network token balance from backend balances
  if (sameAddress(address, ZERO_ADDRESS)) {
    acc.ethBalance = humanReadableValue(balance, Number(decimals))
  } else {
    acc.tokens = acc.tokens.push(makeToken({ ...tokenInfo }))
  }

  return acc
}

export const fetchSafeTokens = (safeAddress: string, currencySelected?: string) => async (
  dispatch: Dispatch,
  getState: () => AppReduxState,
): Promise<void> => {
  try {
    const state = getState()
    const safe = safeSelector(state)
    const safeName = safeNameSelector(state) || LOADED_SAFE_KEY

    if (!safe) {
      return
    }
    const selectedCurrency = currentCurrencySelector(state)

    const tokenCurrenciesBalances = await fetchTokenCurrenciesBalances({
      safeAddress,
      selectedCurrency: currencySelected ?? selectedCurrency,
    })

    const { balances, ethBalance, tokens } = tokenCurrenciesBalances.items.reduce<ExtractedData>(
      extractDataFromResult,
      {
        balances: [],
        ethBalance: '0',
        tokens: List(),
      },
    )

    dispatch(
      updateSafe({
        address: safeAddress,
        name: safeName,
        balances,
        ethBalance,
        totalFiatBalance: new BigNumber(tokenCurrenciesBalances.fiatTotal).toFixed(2),
      }),
    )
    dispatch(addTokens(tokens))
  } catch (err) {
    console.error('Error fetching active token list', err)
  }
}
