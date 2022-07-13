// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useMemo} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {useIntl} from 'react-intl';

import {isModalOpen} from 'selectors/views/modals';
import {GlobalState} from 'types/store';

import {closeModal} from 'actions/views/modals';

import {DispatchFunc} from 'mattermost-redux/types/actions';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/common';
import {savePreferences} from 'mattermost-redux/actions/preferences';

import {trackEvent} from 'actions/telemetry_actions';

import {CloudBanners, ConsolePages, ModalIdentifiers, Preferences, TELEMETRY_CATEGORIES} from 'utils/constants';

import GenericModal from 'components/generic_modal';
import GuestAccessSvg from 'components/common/svg_images_components/guest_access_svg';
import MonitorImacLikeSVG from 'components/common/svg_images_components/monitor_imaclike_svg';
import SystemRolesSVG from 'components/admin_console/feature_discovery/features/images/system_roles_svg';
import useOpenPricingModal from 'components/common/hooks/useOpenPricingModal';
import WorkspaceLimitsPanel from 'components/cloud_usage_modal/workspace_limits_panel';
import useGetUsage from 'components/common/hooks/useGetUsage';
import useGetLimits from 'components/common/hooks/useGetLimits';

import ThreeDaysLeftTrialCard, {ThreeDaysLeftTrialCardProps} from './three_days_left_trial_modal_card';

import './three_days_left_trial_modal.scss';

type Props = {
    onClose?: () => void;
    limitsOVerpassed: boolean;
}

function ThreeDaysLeftTrialModal(props: Props): JSX.Element | null {
    const dispatch = useDispatch<DispatchFunc>();
    const currentUserId = useSelector(getCurrentUserId);
    const {formatMessage} = useIntl();
    const openPricingModal = useOpenPricingModal();
    const show = useSelector((state: GlobalState) => isModalOpen(state, ModalIdentifiers.THREE_DAYS_LEFT_TRIAL_MODAL));
    const usage = useGetUsage();
    const [limits] = useGetLimits();

    const handleOnClose = useCallback(() => async () => {
        if (props.onClose) {
            props.onClose();
        }
        trackEvent(
            TELEMETRY_CATEGORIES.CLOUD_ADMIN,
            'dismissed_three_days_left_trial_modal',
        );

        await dispatch(savePreferences(currentUserId, [{
            category: Preferences.CLOUD_TRIAL_BANNER,
            user_id: currentUserId,
            name: CloudBanners.THREE_DAYS_LEFT_TRIAL_MODAL,
            value: 'true',
        }]));
        dispatch(closeModal(ModalIdentifiers.THREE_DAYS_LEFT_TRIAL_MODAL));
    }, []);

    const buttonLabel = formatMessage({id: 'three_days_left_trial_modal.learnMore', defaultMessage: 'Learn more'});

    const steps: ThreeDaysLeftTrialCardProps[] = useMemo(() => [
        {
            id: 'useSso',
            title: formatMessage({id: 'three_days_left_trial.modal.useSsoTitle', defaultMessage: 'Use SSO (with OpenID, SAML, Google, O365)'}),
            description: formatMessage({id: 'three_days_left_trial.modal.useSsoDescription', defaultMessage: 'Sign on quickly and easily with our SSO feature that works with OpenID, SAML, Google, and O365.'}),
            svgWrapperClassName: 'guestAccessSvg',
            svgElement: (
                <GuestAccessSvg
                    width={400}
                    height={180}
                />
            ),
            pageURL: 'https://docs.mattermost.com/onboard/sso-saml.html',
            buttonLabel,
        },
        {
            id: 'ldap',
            title: formatMessage({id: 'three_days_left_trial.modal.ldapTitle', defaultMessage: 'Synchronize your Active Directory/LDAP groups'}),
            description: formatMessage({id: 'three_days_left_trial.modal.ldapDescription', defaultMessage: 'Use AD/LDAP groups to organize and apply actions to multiple users at once. Manage team and channel memberships, permissions and more.'}),
            svgWrapperClassName: 'personMacSvg',
            svgElement: (
                <MonitorImacLikeSVG
                    width={400}
                    height={180}
                />
            ),
            pageURL: 'https://docs.mattermost.com/onboard/ad-ldap.html',
            buttonLabel,
        },
        {
            id: 'systemConsole',
            title: formatMessage({id: 'three_days_left_trial.modal.systemConsoleTitle', defaultMessage: 'Provide controlled access to the System Console'}),
            description: formatMessage({id: 'three_days_left_trial.modal.systemConsoleDescription', defaultMessage: 'Use System Roles to give designated users read and/or write access to select sections of System Console.'}),
            svgWrapperClassName: 'personBoxSvg',
            svgElement: (
                <SystemRolesSVG
                    width={400}
                    height={180}
                />
            ),
            pageURL: ConsolePages.LICENSE,
            buttonLabel,
        },
    ], []);

    let headerText = formatMessage({id: 'three_days_left_trial.modal.title', defaultMessage: 'Your trial ends soon'});
    let headerSubtitleText = formatMessage({id: 'three_days_left_trial.modal.subtitle', defaultMessage: 'There is still time to explore what our paid plans can help you accomplish.'});

    let content: React.ReactNode = useMemo(
        () =>
            steps.map(({id, ...rest}) => (
                <ThreeDaysLeftTrialCard
                    {...rest}
                    id={id}
                    key={id}
                />
            )),
        [],
    );

    if (props.limitsOVerpassed) {
        headerText = formatMessage({id: 'three_days_left_trial.modal.titleLimitsOverpassed', defaultMessage: 'Upgrade before the trial ends'});
        headerSubtitleText = formatMessage({id: 'three_days_left_trial.modal.subtitleLimitsOverpassed', defaultMessage: 'There are 3 days left on your trial. Upgrade to our Professional or Enterprise plan to avoid exceeding your data limits on the Starter plan.'});
        content = () => (
            <WorkspaceLimitsPanel
                showIcons={true}
                limits={limits}
                usage={usage}
            />
        );
    }

    if (!show) {
        return null;
    }

    return (
        <GenericModal
            className='ThreeDaysLeftTrialModal'
            id='threeDaysLeftTrialModal'
            onExited={handleOnClose}
            modalHeaderText={headerText}
        >
            <div className='headerSubtitleText'>
                {headerSubtitleText}
            </div>
            {content}
            <div className='divisory-line'/>
            <div className='footer-content'>
                <button
                    onClick={openPricingModal}
                    className='AlertBanner__buttonLeft'
                >
                    {formatMessage({id: 'three_days_left_trial.modal.viewPlans', defaultMessage: 'View plan options'})}
                </button>
            </div>
        </GenericModal>
    );
}

export default ThreeDaysLeftTrialModal;
