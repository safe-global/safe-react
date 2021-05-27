import { mustBeEthereumContractAddress } from 'src/components/forms/validator'
import { ETHEREUM_NETWORK } from 'src/config/networks/network.d'
import { AddressBookEntry, AddressBookState } from 'src/logic/addressBook/model/addressBook'
import { sameAddress } from 'src/logic/wallets/ethAddresses'
import { AppReduxState } from 'src/store'
import { Overwrite } from 'src/types/helpers'

export type OldAddressBookEntry = {
  address: string
  name: string
  isOwner: boolean
}

export type OldAddressBookType = {
  [safeAddress: string]: [OldAddressBookEntry]
}

const ADDRESS_BOOK_INVALID_NAMES = ['UNKNOWN', 'OWNER #', 'MY WALLET', '']

type GetNameFromAddressBookOptions = {
  filterOnlyValidName: boolean
}

export const getNameFromAddressBook = (
  addressBook: AddressBookState,
  userAddress: string,
  options?: GetNameFromAddressBookOptions,
): string | null => {
  const entry = addressBook.find((addressBookItem) => addressBookItem.address === userAddress)
  if (entry) {
    return options?.filterOnlyValidName ? getValidAddressBookName(entry.name) : entry.name
  }
  return null
}

export const isValidAddressBookName = (addressBookName: string): boolean => {
  const hasInvalidName = ADDRESS_BOOK_INVALID_NAMES.find((invalidName) =>
    addressBookName?.toUpperCase().includes(invalidName),
  )
  return !hasInvalidName
}

// TODO: is this really required?
export const getValidAddressBookName = (addressBookName: string): string | null => {
  return isValidAddressBookName(addressBookName) ? addressBookName : null
}

export const formatAddressListToAddressBookNames = (
  addressBook: AddressBookState,
  addresses: string[],
): AddressBookEntry[] => {
  if (!addresses.length) {
    return []
  }
  return addresses.map((address) => {
    const ownerName = getNameFromAddressBook(addressBook, address)
    return {
      address: address,
      name: ownerName || '',
      chainId: ETHEREUM_NETWORK.UNKNOWN,
    }
  })
}

/**
 * If the safe is not loaded, the owner wasn't deleted
 * If the safe is already loaded and the owner has a valid name, will return true if the address is not already on the addressBook
 * @param name
 * @param address
 * @param addressBook
 * @param safeAlreadyLoaded
 */
export const checkIfEntryWasDeletedFromAddressBook = (
  { name, address }: AddressBookEntry,
  addressBook: AddressBookState,
  safeAlreadyLoaded: boolean,
): boolean => {
  if (!safeAlreadyLoaded) {
    return false
  }

  const addressShouldBeOnTheAddressBook = !!getValidAddressBookName(name)
  const isAlreadyInAddressBook = !!addressBook.find((entry) => sameAddress(entry.address, address))
  return addressShouldBeOnTheAddressBook && !isAlreadyInAddressBook
}

/**
 * Returns a filtered list of AddressBookEntries whose addresses are contracts
 * @param {Array<AddressBookEntry>} addressBook
 * @returns Array<AddressBookEntry>
 */
export const filterContractAddressBookEntries = async (addressBook: AddressBookState): Promise<AddressBookEntry[]> => {
  const abFlags = await Promise.all(
    addressBook.map(
      async ({ address }: AddressBookEntry): Promise<boolean> => {
        return (await mustBeEthereumContractAddress(address)) === undefined
      },
    ),
  )

  return addressBook.filter((_, index) => abFlags[index])
}

/**
 * Filters the AddressBookEntries by `address` or `name` based on the `inputValue`
 * @param {Array<AddressBookEntry>} addressBookEntries
 * @param {Object} filterParams
 * @param {String} filterParams.inputValue
 * @return Array<AddressBookEntry>
 */
export const filterAddressEntries = (
  addressBookEntries: AddressBookEntry[],
  { inputValue }: { inputValue: string },
): AddressBookEntry[] =>
  addressBookEntries.filter(({ address, name }) => {
    const inputLowerCase = inputValue.toLowerCase()
    const foundName = name.toLowerCase().includes(inputLowerCase)
    const foundAddress = address?.toLowerCase().includes(inputLowerCase)

    return foundName || foundAddress
  })

export const getEntryIndex = (
  state: AppReduxState['addressBook'],
  addressBookEntry: Overwrite<AddressBookEntry, { name?: string }>,
): number =>
  state.findIndex(
    ({ address, chainId }) => chainId === addressBookEntry.chainId && sameAddress(address, addressBookEntry.address),
  )
