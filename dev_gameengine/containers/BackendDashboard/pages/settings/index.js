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
      {({
        handleSubmit,
        isSubmitting,
        dirty
      }) => {
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
            <div className="flex justify-between items-center" style={{
              "padding": "24px 0"
            }}>
              <GFLabel type="plainHeading" margin={0} label={__("Settings", "gameengine")} />
            </div>

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
              </div>
            </div>
          </div>
        </>;
      }}
    </Formik>}
  </>;
};
export default Settings;