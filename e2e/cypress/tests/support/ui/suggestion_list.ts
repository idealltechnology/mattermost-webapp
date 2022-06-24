// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ChainableT} from '../api/types';

interface User {
    username: string;
    first_name: string;
    last_name: string;
    nickname: string;
}

function uiVerifyAtMentionInSuggestionList(user: User, isSelected = false, sectionDividerName = null): ChainableT<JQuery> {
    // * Verify that the suggestion list is open and visible
    return cy.get('#suggestionList').should('be.visible').within(() => {
        if (sectionDividerName) {
            // * Verify the section name is as expected
            cy.get('.suggestion-list__divider').findByText(sectionDividerName).should('be.visible');
            cy.get('.suggestion-list__divider').next().findByTestId(`mentionSuggestion_${user.username}`).should('be.visible');
        }

        // * Verify that the user is selected
        return cy.uiVerifyAtMentionSuggestion(user, isSelected);
    });
}
Cypress.Commands.add('uiVerifyAtMentionInSuggestionList', uiVerifyAtMentionInSuggestionList);

function uiVerifyAtMentionSuggestion(user: User, isSelected = false): ChainableT<JQuery> {
    const {
        username,
        first_name: firstName,
        last_name: lastName,
        nickname,
    } = user;

    // * Verify that the user is selected
    cy.findByTestId(`mentionSuggestion_${username}`).as('selectedMentionSuggestion').should('be.visible');
    if (isSelected) {
        cy.get('@selectedMentionSuggestion').should('have.class', 'suggestion--selected');
    }

    cy.get('@selectedMentionSuggestion').findByText(`@${username}`).should('be.visible');
    cy.get('@selectedMentionSuggestion').findByText(`${firstName} ${lastName} (${nickname})`).should('be.visible');

    return cy.findByTestId(`mentionSuggestion_${username}`);
}
Cypress.Commands.add('uiVerifyAtMentionSuggestion', uiVerifyAtMentionSuggestion);

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {

            /**
             * Verify user's at-mention in the suggestion list
             * @param {UserProfile} user - user object
             * @param {boolean} isSelected - check if user is selected with false as default
             * @param {string} sectionDividerName - name of the section in suggestion list, ex. "Channel Members"
             *
             * @example
             *   cy.uiVerifyAtMentionInSuggestionList(user, true, 'Channel Members');
             */
            uiVerifyAtMentionInSuggestionList: typeof uiVerifyAtMentionInSuggestionList;

            /**
             * Verify user's at-mention suggestion
             * @param {UserProfile} user - user object
             * @param {boolean} isSelected - check if user is selected with false as default
             *
             * @example
             *   cy.uiVerifyAtMentionSuggestion(user, true);
             */
            uiVerifyAtMentionSuggestion: typeof uiVerifyAtMentionSuggestion;
        }
    }
}
