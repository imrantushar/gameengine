import React, { useEffect, useState } from 'react';
import TopBar from '@GFComponents/TopBar';
import { __ } from '@wordpress/i18n';
import LeftBar from './LeftBar';
import { useLocation } from 'react-router-dom';
import GeneralSettings from './Tabs/GeneralSettings';
import { primaryBtn } from '../../../../../assets/scss/chakra/recipe';
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
  const onSubmitHandle = (values, actions) => {
    actions.setSubmitting(true);
    try {
      switch (tab) {
        case "general-settings":
        case "log":
          return dispatch(saveSettings({
            key: 'logs',
            payloadData: values.logs
          }));
        case "economy":
          return dispatch(saveSettings({
            key: 'economy',
            payloadData: values.economy
          }));
        case "marketplace":
          return dispatch(saveSettings({
            key: 'marketplace',
            payloadData: values.marketplace
          }));
        case "payout":
          return dispatch(saveSettings({
            key: 'payout',
            payloadData: values.payout
          }));
        case "dashboard":
          return dispatch(saveSettings({
            key: 'dashboard',
            payloadData: values.dashboard
          }));
        case "email_templates":
          return dispatch(saveSettings({
            key: 'email_templates',
            payloadData: values.email_templates
          }));
        default:
          return null;
      }
    } catch (error) {
      console.warn({
        error
      });
    } finally {
      actions.setSubmitting(false);
    }
  };
  return <>
    {settingsLoading ? <SettingsLoader /> : <Formik enableReinitialize initialValues={settingsData} onSubmit={onSubmitHandle}>
      {({
        handleSubmit,
        isSubmitting,
        dirty
      }) => {
        return <>
          <TopBar path={__("Settings", "gameengine")} rightContent={<>
            {isEmailTab ? null : <button style={primaryBtn} onClick={handleSubmit} disabled={!dirty}>
              {__('Save Changes', 'gameengine')}
            </button>}

            <GetHelp filterText={['setting']} />
          </>} />

          <div className='gameengine-page-content'>
            <div className="flex justify-between items-center" style={{
              "padding": "24px 0"
            }}>
              <GFLabel type="plainHeading" margin={0} label={__("Settings", "gameengine")} />
            </div>

            <div className="flex items-start w-full gap-4 " gapX={4}>

              <LeftBar />
              <div className="gameengine-fade-in w-full" key={tab}>
                {tab === "dashboard" && <Dashboard />}
                {tab === "log" && <GeneralSettings />}
                {tab === "economy" && <Economy />}
                {tab === "marketplace" && <MarketPlace />}
                {tab === "payout" && <Payout />}
                {tab === "license" && <License />}
                {tab === "email_templates" && <EmailTemplates handleSubmit={handleSubmit} isSubmitting={isSubmitting} dirty={dirty} />}
              </div>
            </div>
          </div>
        </>;
      }}
    </Formik>}
  </>;
};
export default Settings;