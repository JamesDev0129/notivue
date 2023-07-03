/// <reference types="cypress" />

import { mount } from 'cypress/vue'

import { notivueCypress } from '@/core/notivue'
import { DEFAULT_DURATION } from '@/core/constants'
import { parseText } from './utils'

import type { NotivueConfig } from 'index'

type MountParams = Parameters<typeof mount>
type OptionsParam = MountParams[1]

declare global {
   namespace Cypress {
      interface Chainable {
         mount(
            component: any,
            notivueOptions?: { config: NotivueConfig },
            options?: OptionsParam
         ): Chainable<any>
         throwIfDurationMismatch(duration: number): void

         clickRandomStatic(): Chainable<any>
         clickAllStatic(): Chainable<any>
         clickAll(): Chainable<any>
         getNotifications(): Chainable<any>
         getAriaLive(): Chainable<any>
         checkSlotAgainst(obj: Record<string, any>): Chainable<any>
         checkSlotPropsAgainst(obj: Record<string, any>): Chainable<any>
         checkAnimations(
            enterClass: string,
            leaveClass: string,
            clearAllClass: string
         ): Chainable<any>
         checkTransitions(element: HTMLElement, height: number): Chainable<any>
      }
   }
}

Cypress.Commands.add(
   'mount',
   (component, notivueOptions: { config: NotivueConfig } = { config: {} }, options = {}) => {
      options.global = options.global || {}
      options.global.plugins = options.global.plugins || []
      options.global.plugins.push(notivueCypress(notivueOptions.config))

      return mount(component, options).then(({ wrapper }) => {
         return cy.wrap(wrapper).as('vue')
      })
   }
)

Cypress.Commands.add('throwIfDurationMismatch', (duration: number) => {
   if (DEFAULT_DURATION !== duration) {
      throw new Error(
         `Default success duration is not ${duration}ms. Is the default config changed?`
      )
   }
})

Cypress.Commands.add('clickAllStatic', () => {
   cy.get('.Success')
      .click()

      .get('.Error')
      .click()

      .get('.Info')
      .click()

      .get('.Warning')
      .click()
})

Cypress.Commands.add('clickRandomStatic', () => {
   const randomSelector = ['.Success', '.Error', '.Info', '.Warning'][Math.floor(Math.random() * 4)]

   return cy.get(randomSelector).click()
})

Cypress.Commands.add('clickAll', () => {
   cy.clickAllStatic()

      .get('.Promise')
      .click()
})

Cypress.Commands.add('getNotifications', () => cy.get('li > div > div:first-of-type'))

Cypress.Commands.add('getAriaLive', () => {
   return cy.get('li > div > div:last-of-type')
})

Cypress.Commands.add('checkSlotAgainst', (obj: Record<string, any>) =>
   cy.getNotifications().then((el) => cy.wrap(parseText(el)).should('contain', obj))
)

Cypress.Commands.add('checkSlotPropsAgainst', (obj: Record<string, any>) =>
   cy.getNotifications().then((el) => cy.wrap(parseText(el).props).should('eql', obj))
)

Cypress.Commands.add(
   'checkAnimations',
   (enterClass: string, leaveClass: string, clearAllClass: string) =>
      cy
         .get('.Success')
         .click()

         .get(enterClass)
         .should('exist')
         .get(leaveClass)
         .should('not.exist')

         .wait(DEFAULT_DURATION)

         .get(leaveClass)
         .should('exist')
         .get(enterClass)
         .should('not.exist')

         .get('.Success')
         .click()
         .get('.ClearAll')
         .click()

         .get(clearAllClass)
         .should('exist')
)

Cypress.Commands.add('checkTransitions', (element: HTMLElement, height: number) =>
   cy
      .wrap(element)
      .should('have.attr', 'style')
      .and('include', `transform: translate3d(0px, ${height}px, 0px)`)
      .and('include', 'transition-duration: 0.3s')
      .and('include', 'transition-property: transform')
      .and('include', 'transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1)')
)
