// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {UserProfile} from '@mattermost/types/users';

import {getEmailUrl, splitEmailBodyText} from '../utils';

import {ChainableT} from './api/types';

function getRecentEmail({username, email}: Pick<UserProfile, 'username' | 'email'>): ChainableT<any> {
    return cy.task('getRecentEmail', {username, email, mailUrl: getEmailUrl()}).then(({status, data}) => {
        expect(status).to.equal(200);

        const {to, date, body: {text}} = data;

        // * Verify that email is addressed to a user
        expect(to.length).to.equal(1);
        expect(to[0]).to.contain(email);

        // * Verify that date is current
        const isoDate = new Date().toISOString().substring(0, 10);
        expect(date).to.contain(isoDate);

        const body = splitEmailBodyText(text);
        return cy.wrap({...data, body});
    });
}

Cypress.Commands.add('getRecentEmail', getRecentEmail);

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {

            /**
             * getRecentEmail is a task to get an email sent to a user
             * from the email service provider
             * @param options.username - username of the user
             * @param options.email - email of the user
             *
             * @example
             *   cy.getRecentEmail().then((data) => {
             *       // do something with the email data/content
             *   });
             */
            getRecentEmail: typeof getRecentEmail;
        }
    }
}
