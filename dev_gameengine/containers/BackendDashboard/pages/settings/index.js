import React, { useEffect, useMemo, useState } from 'react';
import TopBar from '@GFComponents/TopBar';
import { __ } from '@wordpress/i18n';
import LeftBar from './LeftBar';
import { useLocation } from 'react-router-dom';
import Button from '@GFComponents/Button';
import { fetchSettings, saveSettings } from '@GFRedux/Slices/settingsSlice/settingsSlice';
import { useDispatch, useSelector } from 'react-redux';
import { Formik } from 'formik';
import GetHelp from '@GFComponents/GetHelp';
import SettingsLoader from '@GFComponents/GameEngineLoader/SettingsLoader';
import { DEFAULT_TAB, findTab } from './tabs-config';

const EMAIL_STRING_FIELDS = [
  'sender_name', 'sender_email',
  'level_subject', 'level_body',
  'achievement_subject', 'achievement_body',
  'inactivity_subject', 'inactivity_body', 'inactivity_days',
  'milestone_subject', 'milestone_body',
];

const normalizeEmailTemplates = (data) => {
  if (!data) return data;
  const et = { ...(data.email_templates || {}) };
  EMAIL_STRING_FIELDS.forEach(key => {
    if (et[key] == null) et[key] = '';
  });
  return { ...data, email_templates: et };
};

const Settings = () => {
  const locationQuery = useLocation();
  const tabMatch = locationQuery.search.match(/[?&]tab=([^&]+)/);
  const tab = tabMatch ? tabMatch[1] : DEFAULT_TAB;
  const {
    data: settingsData
  } = useSelector(state => state.settings);
  const normalizedSettings = useMemo(() => normalizeEmailTemplates(settingsData), [settingsData]);
  const [settingsLoading, setSettingsLoading] = useState(!settingsData);
  const dispatch = useDispatch();

  const activeTab = findTab(tab) || findTab(DEFAULT_TAB);

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
      const saveKey = activeTab?.saveKey;
      if (saveKey) {
        await dispatch(saveSettings({ key: saveKey, payloadData: values[saveKey] }));
      }
    } catch (error) {
      console.warn({ error });
    } finally {
      actions.setSubmitting(false);
      actions.resetForm({ values });
    }
  };

  return <>
    {settingsLoading ? <SettingsLoader /> : <Formik enableReinitialize initialValues={normalizedSettings} onSubmit={onSubmitHandle}>
      {(formik) => {
        const { handleSubmit, isSubmitting, dirty } = formik;
        return <>
          <TopBar path={__("Settings", "gameengine")} rightContent={<>
            {activeTab?.selfSubmitting ?
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
                {activeTab?.render(formik)}
              </div>
            </div>
          </div>
        </>;
      }}
    </Formik>}
  </>;
};

export default Settings;
