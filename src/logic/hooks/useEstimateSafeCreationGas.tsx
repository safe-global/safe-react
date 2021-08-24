import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import throttle from 'lodash/throttle'
import { estimateGasForDeployingSafe } from 'src/logic/contracts/safeContracts'
import { fromTokenUnit } from 'src/logic/tokens/utils/humanReadableValue'
import { formatAmount } from 'src/logic/tokens/utils/formatAmount'
import { getNetworkInfo } from 'src/config'

import { calculateGasPrice } from 'src/logic/wallets/ethTransactions'
import { userAccountSelector } from '../wallets/store/selectors'

type EstimateSafeCreationGasProps = {
  addresses: string[]
  numOwners: number
  safeCreationSalt: number
}

type SafeCreationEstimationResult = {
  gasEstimation: number // Amount of gas needed for execute or approve the transaction
  gasCostFormatted: string // Cost of gas in format '< | > 100'
  gasLimit: number // Minimum gas requited to execute the Tx
}

const estimateGas = throttle(
  async (
    userAccount: string,
    numOwners: number,
    safeCreationSalt: number,
    addresses: string[],
  ): Promise<SafeCreationEstimationResult> => {
    const [gasEstimation, gasPrice] = await Promise.all([
      estimateGasForDeployingSafe(addresses, numOwners, userAccount, safeCreationSalt),
      calculateGasPrice(),
    ])
    const estimatedGasCosts = gasEstimation * parseInt(gasPrice, 10)
    const { nativeCoin } = getNetworkInfo()
    const gasCost = fromTokenUnit(estimatedGasCosts, nativeCoin.decimals)
    const gasCostFormatted = formatAmount(gasCost)

    return {
      gasEstimation,
      gasCostFormatted,
      gasLimit: gasEstimation,
    }
  },
  3000,
  { leading: true, trailing: false },
)

export const useEstimateSafeCreationGas = ({
  addresses,
  numOwners,
  safeCreationSalt,
}: EstimateSafeCreationGasProps): SafeCreationEstimationResult => {
  const [gasEstimation, setGasEstimation] = useState<SafeCreationEstimationResult>({
    gasEstimation: 0,
    gasCostFormatted: '< 0.001',
    gasLimit: 0,
  })
  const userAccount = useSelector(userAccountSelector)

  useEffect(() => {
    if (!addresses.length || !numOwners || !userAccount) {
      return
    }

    estimateGas(userAccount, numOwners, safeCreationSalt, addresses)?.then(setGasEstimation)
  }, [numOwners, safeCreationSalt, addresses.join()])

  return gasEstimation
}
