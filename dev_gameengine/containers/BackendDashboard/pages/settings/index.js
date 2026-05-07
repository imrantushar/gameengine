import React, { useEffect, useState } from 'react';
import TopBar from '@GFComponents/TopBar';
import { __ } from '@wordpress/i18n';
import LeftBar from './LeftBar';
import { useLocation } from 'react-router-dom';
import GeneralSettings from './Tabs/GeneralSettings';
import Button from '@GFComponents/Button';
import { fetchSettings, saveSettings } from '@GFRedux/Slices/settingsSlice/settingsSlice';
import { useDispatch, useSelector } from 'react-redux';
import { Formik } from 'formik';
import GetHelp from '@GFComponents/GetHelp';
import SettingsLoader from '@GFComponents/GameEngineLoader/SettingsLoader';
import GFLabel from '@GFComponents/Labels/GFLabel';
import Economy from './Tabs/Economy';
import MarketPlace from './Tabs/MarketPlace';
import Payout from './Tabs/Payout';
import Dashboard from './Tabs/Dashboard';
import License from './Tabs/License';
import EmailTemplates from './Tabs/EmailTemplates';
import ReferralSettings from './Tabs/ReferralSettings';
import Expiration from './Tabs/Expiration';
import Integrations from './Tabs/Integrations';
import SocialSharing from './Tabs/SocialSharing';
import ProgressBarSettings from './Tabs/ProgressBarSettings';
import EngagementTriggers from './Tabs/EngagementTriggers';
import TransfersSettings from './Tabs/TransfersSettings';
import BuyPointsSettings from './Tabs/BuyPointsSettings';
import PointExchange from './Tabs/PointExchange';
import PointsCapSettings from './Tabs/PointsCapSettings';
import SellContent from './Tabs/SellContent';
import ToastNotificationsSettings from './Tabs/ToastNotificationsSettings';
import OpenBadgesSettings from './Tabs/OpenBadgesSettings';

const Settings = () => {
  const locationQuery = useLocation();
  const tabMatch = locationQuery.search.match(/[?&]tab=([^&]+)/);
  const tab = tabMatch ? tabMatch[1] : 'dashboard';
  const {
    data: settingsData
  } = useSelector(state => state.settings);
  const [settingsLoading, setSettingsLoading] = useState(!settingsData);
  const dispatch = useDispatch();
  const isEmailTab = tab === 'email_templates';

  useEffect(() => {
    if (!settingsData) {
      setSettingsLoading(true);
      dispatch(fetchSettings()).then(() => {
        setSettingsLoading(false);
      });
    }
  }, []);

  const onSubmitHandle = async (values, actions) => {
    try {
      switch (tab) {
        case "general-settings":
        case "log":
          await dispatch(saveSettings({ key: 'logs', payloadData: values.logs }));
          break;
        case "economy":
          await dispatch(saveSettings({ key: 'economy', payloadData: values.economy }));
          break;
        case "marketplace":
          await dispatch(saveSettings({ key: 'marketplace', payloadData: values.marketplace }));
          break;
        case "payout":
          await dispatch(saveSettings({ key: 'payout', payloadData: values.payout }));
          break;
        case "dashboard":
          await dispatch(saveSettings({ key: 'dashboard', payloadData: values.dashboard }));
          break;
        case "email_templates":
          await dispatch(saveSettings({ key: 'email_templates', payloadData: values.email_templates }));
          break;
        case "referral":
          await dispatch(saveSettings({ key: 'referral', payloadData: values.referral }));
          break;
        case "expiration":
          await dispatch(saveSettings({ key: 'expiration', payloadData: values.expiration }));
          break;
        case "integrations":
          await dispatch(saveSettings({ key: 'integrations', payloadData: values.integrations }));
          break;
        case "social_sharing":
          await dispatch(saveSettings({ key: 'social_sharing', payloadData: values.social_sharing }));
          break;
        case "progress_bar_settings":
          await dispatch(saveSettings({ key: 'progress_bar_settings', payloadData: values.progress_bar_settings }));
          break;
        case "engagement_triggers":
          await dispatch(saveSettings({ key: 'engagement_triggers', payloadData: values.engagement_triggers }));
          break;
        case "sell_content":
          await dispatch(saveSettings({ key: 'sell_content', payloadData: values.sell_content }));
          break;
        case "open_badges":
          await dispatch(saveSettings({ key: 'open_badges', payloadData: values.open_badges }));
          break;
        default:
          break;
      }
    } catch (error) {
      console.warn({ error });
    } finally {
      actions.setSubmitting(false);
    }
  };

  return <>
    {settingsLoading ? <SettingsLoader /> : <Formik enableReinitialize initialValues={settingsData} onSubmit={onSubmitHandle}>
      {({ handleSubmit, isSubmitting, dirty }) => {
        return <>
          <TopBar path={__("Settings", "gameengine")} rightContent={<>
            {isEmailTab ?
              null : (
                <Button
                  label={__('Save Changes', 'gameengine')}
                  loadingLabel={__('Save Changes', 'gameengine')}
                  isLoading={isSubmitting}
                  isDisabled={!dirty || isSubmitting}
                  onClick={handleSubmit}
                />
              )}

            <GetHelp filterText={['setting']} />
          </>} />

          <div className='gameengine-page-content'>
            <h2 className="gameengine-page-heading py-6">
              {__("Settings", "gameengine")}
            </h2>

            <div className="flex items-start gap-4">
              <LeftBar />

              <div className="gameengine-fade-in w-full" key={tab}>
                {tab === "dashboard" && <Dashboard />}
                {tab === "log" && <GeneralSettings />}
                {tab === "economy" && <Economy />}
                {tab === "marketplace" && <MarketPlace />}
                {tab === "payout" && <Payout />}
                {tab === "license" && <License />}
                {tab === "email_templates" && <EmailTemplates handleSubmit={handleSubmit} isSubmitting={isSubmitting} dirty={dirty} />}
                {tab === "referral" && <ReferralSettings />}
                {tab === "expiration" && <Expiration />}
                {tab === "integrations" && <Integrations />}
                {tab === "social_sharing" && <SocialSharing />}
                {tab === "progress_bar_settings" && <ProgressBarSettings />}
                {tab === "engagement_triggers" && <EngagementTriggers />}
                {tab === "transfers" && <TransfersSettings />}
                {tab === "buy_points_settings" && <BuyPointsSettings />}
                {tab === "point_exchange" && <PointExchange />}
                {tab === "points_cap_settings" && <PointsCapSettings />}
                {tab === "sell_content" && <SellContent />}
                {tab === "toast_notifications" && <ToastNotificationsSettings />}
                {tab === "open_badges" && <OpenBadgesSettings />}
              </div>
            </div>
          </div>
        </>;
      }}
    </Formik>}
  </>;
};

export default Settings;
