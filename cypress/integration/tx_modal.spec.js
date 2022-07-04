const TEST_SAFE = 'rin:0x11Df0fa87b30080d59eba632570f620e37f2a8f7'
const RECIPIENT_ENS = 'diogo.eth'
const RECIPIENT_ADDRESS = '0x6a5602335a878ADDCa4BF63a050E34946B56B5bC'
const SAFE_NONCE = '5'

describe('Tx Modal', () => {
  before(() => {
    cy.connectE2EWallet()

    // Open the Safe used for testing
    cy.visit(`/${TEST_SAFE}`)
    cy.contains('a', 'Accept selection').click()
  })

  describe('Send funds modal', () => {
    it('should open the modal when clicking New Transaction', () => {
      // Modal should be closed
      cy.get('[aria-describedby="Send Tokens Form"]').should('not.exist')

      // Opens Tx Modal
      cy.contains('New Transaction').click()
      cy.get('[aria-describedby="Send Tokens Form"]').should('be.visible')
      cy.get('.smaller-modal-window').contains('Send')
    })

    it('should close the modal by clicking outside of the modal', () => {
      // Modal is open
      cy.get('.smaller-modal-window').contains('Send')

      // Click outside of the .smaller-modal-window to close the modal
      cy.get('.smaller-modal-window').then(($target) => {
        let coords = $target[0].getBoundingClientRect()
        const { x, y } = coords
        cy.get('body').click(x - 10, y - 10)
      })

      // Modal is closed
      cy.get('[aria-describedby="Send Tokens Form"]').should('not.exist')
    })

    it('should close the modal by clicking cancel', () => {
      // Opens Send Funds modal
      cy.contains('New Transaction').click()
      cy.contains('Send funds').click()

      // Send Funds modal is open
      cy.contains('Send funds').should('be.visible')
      cy.contains('Step 1 of 2').should('be.visible')

      // Close modal when clicking Cancel
      cy.contains('Cancel').click()

      // Modal is closed
      cy.get('[aria-describedby="Send Tokens Form"]').should('not.exist')
    })

    describe('Send Funds form', () => {
      before(() => {
        // Open Send Funds Modal
        cy.contains('New Transaction').click()
        cy.contains('Send funds').click()
      })

      it('should display Send Funds modal with all the form elements', () => {
        // Modal header
        cy.get('form')
          .prev()
          .prev()
          .within(() => {
            // Send Funds modal is open
            cy.contains('Send funds').should('be.visible')
            cy.contains('Step 1 of 2').should('be.visible')

            // Current network is same as Safe
            cy.contains('Rinkeby').should('be.visible')
          })

        // It contains the form elements
        cy.get('form').within(() => {
          // Sending from the current Safe address
          const [chainPrefix, safeAddress] = TEST_SAFE.split(':')
          cy.contains(chainPrefix)
          cy.contains(safeAddress)

          // Current ETH balance
          cy.contains('Balance:').contains('0.3 ETH')

          // Recipient field
          cy.get('#address-book-input').should('be.visible')

          // Token selector
          cy.contains('Select an asset*').should('be.visible')

          // Amount field
          cy.contains('Amount').should('be.visible')
        })

        // Review button is disabled
        cy.get('button[type="submit"]').should('be.disabled')
      })

      it('should resolve the ENS name', () => {
        // Fills recipient with ens
        cy.get('#address-book-input').type(RECIPIENT_ENS)

        // Waits for resolving the ENS
        cy.contains(RECIPIENT_ADDRESS).should('be.visible')
      })

      it('should have all tokens available in the token selector', () => {
        // Click on the Token selector
        cy.contains('Select an asset*').click()

        const ownedTokens = ['Dai', 'Wrapped Ether', 'Ether', 'Uniswap', 'Gnosis', '0x', 'USD Coin']
        ownedTokens.forEach((token) => {
          cy.get('ul[role="listbox"]').contains(token)
        })
      })

      it('should validate token amount', () => {
        // Select a token
        cy.get('ul[role="listbox"]').contains('Gnosis').click()

        // Insert an incorrect amount
        cy.get('input[placeholder="Amount*"]').type('0.4')

        // Selecting more than the balance is not allowed
        cy.contains('Maximum value is 0.000004')

        // Form field contains an error class
        cy.get('input[placeholder="Amount*"]')
          // Parent div is MuiInputBase-root
          .parent('div')
          .should(($div) => {
            // Turn the classList into an array
            const classList = Array.from($div[0].classList)
            expect(classList).to.include('MuiInputBase-root').and.to.include('Mui-error')
          })

        // Insert a correct amount
        cy.get('input[placeholder="Amount*"]').clear().type('0.000002')

        // Form field does not contain an error class
        cy.get('input[placeholder="Amount*"]')
          // Parent div is MuiInputBase-root
          .parent('div')
          .should(($div) => {
            // Turn the classList into an array
            const classList = Array.from($div[0].classList)
            // Check if it contains the error class
            expect(classList).to.include('MuiInputBase-root').and.not.to.include('Mui-error')
          })

        // Click Send max fills the input with token total amount
        cy.contains('Send max').click()
        cy.get('input[placeholder="Amount*"]').should('have.value', '0.000004')
      })

      it('should advance to the Review step', () => {
        // Clicks Review
        cy.contains('Review').click()

        // Modal step 2
        cy.contains('Step 2 of 2').should('be.visible')
      })
    })

    describe('Review modal', () => {
      before(() => {
        // Wait max 10s for estimate to finish
        cy.contains('Submit', { timeout: 10000 })
      })

      it('should have the same parameters as the previous step', () => {
        // Sender
        cy.contains('Sending from').parent().next().contains(TEST_SAFE)
        // Recipient
        cy.contains('Recipient').parent().next().contains(RECIPIENT_ADDRESS)

        // Token value
        cy.contains('0.000004 GNO')
      })

      it('should contain the Safe nonce upon clicking Advanced parameters', () => {
        // Click Advanced parameters
        cy.contains('Advanced parameters').click()
        // Find Safe nonce
        cy.contains('Safe nonce').next().contains(SAFE_NONCE).should('be.visible')
      })
    })
  })
})
