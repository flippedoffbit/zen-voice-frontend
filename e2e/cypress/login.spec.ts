// Example Cypress E2E test for Email OTP flow
// Prereqs: Install Cypress in frontend repo (npm i -D cypress)
// Start backend with FIXED_OTP env and frontend dev server as described in spec.md

context('Login (email OTP) - Cypress', () => {
    beforeEach(() => {
        cy.visit('/login');
    });

    it('requests OTP and verifies using FIXED_OTP', () => {
        // Choose email tab if present
        cy.contains('button', /email/i).click({ force: true });

        cy.get('label:contains("Email")').find('input').type('test@example.com');
        cy.contains('button', /send otp/i).click();
        cy.contains(/otp sent/i).should('be.visible');

        cy.get('label:contains("OTP")').find('input').type('1234');
        cy.contains(/verify/i).click();

        cy.url().should('eq', Cypress.config().baseUrl + '/');
        cy.contains(/logout/i).should('be.visible');
    });
});
