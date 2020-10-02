import axios from 'axios'

import { getTxServiceUrl } from 'src/config/index'

const fetchTokenBalanceList = (safeAddress) => {
  const apiUrl = getTxServiceUrl()
  const url = `${apiUrl}safes/${safeAddress}/balances/`

  return axios.get(url, {
    params: {
      limit: 3000,
    },
  })
}

export default fetchTokenBalanceList
