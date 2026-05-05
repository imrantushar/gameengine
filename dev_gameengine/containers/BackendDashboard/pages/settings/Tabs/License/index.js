import React, { useState, useCallback } from 'react';
import { __, sprintf } from '@wordpress/i18n';
import { createInterpolateElement } from '@wordpress/element';
import moment from 'moment';
import Spinner from '@GFComponents/Spinner/Spinner';
import { LuRefreshCw, LuLink, LuKey } from 'react-icons/lu';
import { useDispatch } from 'react-redux';
import { showNotification } from '@GFRedux/Slices/notificationSlice/notificationSlice';
import { API, plugin_root_url } from '@GFUtils/helper';
import HireUs from './HireUs';

import "./styles.scss";

const SeSdk = window.SE_SDK_GAMEENGINE_PRO || {};

const licenseRequest = (endpoint, payload) => API.post(SeSdk?.rest_url + endpoint, payload);
const licenseGet = (endpoint, params) => API.get(SeSdk?.rest_url + endpoint, {
  params
});

const buildPurchaseUrl = () => {
  const base = 'https://gameengine.pro/';
  try {
    const url = new URL(base);
    url.searchParams.set('utm_source', 'license-activation');
    url.searchParams.set('utm_medium', 'license-form');
    url.searchParams.set('utm_campaign', 'license-activation-upsell');
    url.searchParams.set('utm_content', 'purchase-link');
    url.searchParams.set('utm_term', 'gameengine-pro');
    url.searchParams.set('locale', SeSdk.locale);
    url.searchParams.set('wordpress', SeSdk.WordPress);
    url.searchParams.set('sdk_version', SeSdk.version);
    url.searchParams.set('instance', SeSdk.device_id);
    return url.toString();
  } catch {
    return base;
  }
};

const PURCHASE_URL = buildPurchaseUrl();

const License = () => {
  const dispatch = useDispatch();
  const [licenseKey, setLicenseKey] = useState('');
  const [licenseData, setLicenseData] = useState(SeSdk?.license);
  const [optInData, setOptInData] = useState(SeSdk?.optin);
  const [isActivating, setIsActivating] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isOptinLoading, setIsOptinLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  const fetchStatus = useCallback(async () => {
    setIsCheckingStatus(true);
    try {
      const {
        data
      } = await licenseGet('license/status', {
        force: true
      });
      setLicenseData(data);
    } catch (error) {
      const message = error?.response?.data?.message || __('Failed to fetch license status.', 'gameengine');
      dispatch(showNotification({
        message,
        isShow: true,
        type: 'error'
      }));
    } finally {
      setIsCheckingStatus(false);
    }
  }, []);

  const handleActivate = async () => {
    if (!licenseKey.trim()) {
      dispatch(showNotification({
        message: __('Please enter a license key.', 'gameengine'),
        isShow: true,
        type: 'error'
      }));
      return;
    }
    setIsActivating(true);
    try {
      const {
        data: {
          license
        }
      } = await licenseRequest('license/activate', {
        license: licenseKey.trim()
      });
      setLicenseData(license);
      setLicenseKey('');
      window.dispatchEvent(new CustomEvent('gameengine:license:changed', {
        detail: {
          status: license?.status
        }
      }));
      dispatch(showNotification({
        message: __('License activated successfully.', 'gameengine'),
        isShow: true,
        type: 'success'
      }));
    } catch (error) {
      const message = error?.response?.data?.message || __('Failed to activate license.', 'gameengine');
      dispatch(showNotification({
        message,
        isShow: true,
        type: 'error'
      }));
    } finally {
      setIsActivating(false);
    }
  };

  const handleDeactivate = async () => {
    setIsDeactivating(true);
    try {
      const {
        data: {
          license
        }
      } = await licenseRequest('license/deactivate', {});
      setLicenseData(license);
      window.dispatchEvent(new CustomEvent('gameengine:license:changed', {
        detail: {
          status: license?.status
        }
      }));
      dispatch(showNotification({
        message: __('License deactivated successfully.', 'gameengine'),
        isShow: true,
        type: 'success'
      }));
    } catch (error) {
      const message = error?.response?.data?.message || __('Failed to deactivate license.', 'gameengine');
      dispatch(showNotification({
        message,
        isShow: true,
        type: 'error'
      }));
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleOptin = async optin => {
    setIsOptinLoading(true);
    try {
      const {
        data
      } = await licenseRequest('insights/optin', {
        opt_in: optin
      });
      setOptInData(data);
    } catch (error) {
      const message = error?.response?.data?.message || __('Failed to update opt-in setting.', 'gameengine');
      dispatch(showNotification({
        message,
        isShow: true,
        type: 'error'
      }));
    } finally {
      setIsOptinLoading(false);
    }
  };

  const isActive = licenseData?.status === 'active';

  return (
    <>
      <>
        {isActive ? (
          <div className="flex flex-col items-center text-center bg-white rounded p-6 [box-shadow:var(--gameengine-shadow)]">
            <h2 className="text-xl font-bold m-0 mb-2 text-[var(--gameengine-font-color)]">
              {__('GameEngine Pro — License Active', 'gameengine')}
            </h2>
            <p className="text-sm m-0 mb-6 text-[var(--gameengine-gray-color)]">
              {__('You have access to automatic updates, priority support, and all pro tools.', 'gameengine')}
            </p>

            {/* Logo pill */}
            <div className="flex items-center gap-3 rounded-full pl-5 pr-5 pt-2 pb-2 mb-6 border border-solid border-[#E2E8F0]">
              {/* <img src={plugin_root_url + '/assets/images/logo.svg'} alt="gameengine" style={{ height: '24px' }} /> */}
              <LuLink size={14} color="#888" />
              <LuKey size={'16px'} color="#888" />
            </div>

            {/* License key + buttons */}
            <div className="flex items-center flex-wrap justify-center w-full gap-3 mb-4">
              <input className="flex-1 rounded h-9 pl-3 pr-3 text-sm ![border:1px_solid_var(--gameengine-border-color)_]" style={{
                "maxWidth": "340px",
                "minWidth": "200px"
              }} value={licenseData?.license ?? ''} readOnly />
              <button className="cursor-pointer text-white shrink-0 h-9 pl-4 pr-4 rounded bg-[#E53E3E]" onClick={handleDeactivate}>
                {__('Deactivate License', 'gameengine')}
              </button>
              <a className="cursor-pointer text-white shrink-0 h-9 pl-4 pr-4 rounded bg-[#3182CE] flex items-center" href="https://store.kodezen.com/dashboard/license-keys/" target="_blank" rel="noopener noreferrer">
                {__('Manage License', 'gameengine')}
              </a>
            </div>

            {/* Opt-in checkbox */}
            <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--gameengine-font-color)]">
              <input type="checkbox" checked={optInData?.allowed ?? false} onChange={e => handleOptin(e.target.checked)} disabled={isOptinLoading} className="m-0" />
              <span>{__('Allow usage tracking to help improve GameEngine Pro.', 'gameengine')}</span>
            </label>

            {/* Separator */}
            <div className="w-full mt-6 mb-6 border-t border-solid border-[#E2E8F0]" />

            {/* Meta row */}
            <div className="flex justify-center flex-wrap w-full gap-8">
              <MetaItem label={__('Status:', 'gameengine')} value={isActive ? __('Active', 'gameengine') : licenseData?.status} valueColor={isActive ? '#1a7f37' : '#d32f2f'} />
              <MetaItem label={__('Last Checked:', 'gameengine')} value={<div className="flex items-center justify-center gap-1">
                <span className="font-semibold m-0 text-[var(--gameengine-font-color)]" style={{
                  "fontSize": "13px"
                }}>
                  {moment.utc(licenseData?.updated_at).local().format('YYYY-MM-DD HH:mm:ss')}
                </span>
                <button className="p-1 h-auto text-[#718096]" style={{ "minWidth": "auto" }} onClick={fetchStatus} aria-label={__('Refresh status', 'gameengine')}>
                  {isCheckingStatus ? <Spinner size="xs" /> : <LuRefreshCw size={8} />}
                </button>
              </div>} />
              <MetaItem label={__('Expires:', 'gameengine')} value={licenseData?.expires ? moment.utc(licenseData.expires).local().format('YYYY-MM-DD HH:mm') : __('N/A', 'gameengine')} />
              <MetaItem label={__('Activation Remaining:', 'gameengine')} value={licenseData?.unlimited ? __('Unlimited', 'gameengine') : sprintf(/* translators: 1: remaining activations, 2: total limit */
                __('%1$d out of %2$s', 'gameengine'), licenseData?.remaining, licenseData?.limit)} />
              <MetaItem label={__('Automatic Update:', 'gameengine')} value={__('Enabled', 'gameengine')} />
            </div>
          </div>
        ) : (
          <div className="flex p-6 flex-col items-center text-center bg-white rounded [box-shadow:var(--gameengine-shadow)]" >
            <h2 className="text-xl font-bold m-0 mb-2 text-[var(--gameengine-font-color)]">
              {__('Activate GameEngine Pro for updates & support.', 'gameengine')}
            </h2>
            <p className="text-sm font-normal leading-5 m-0 mb-6 text-[var(--gameengine-gray-color)]" style={{
              "maxWidth": "75%"
            }}>
              {__('Activate GameEngine Pro to unlock automatic updates, priority support, and all tools to manage your contacts and automate your marketing.', 'gameengine')}
            </p>

            {/* Logo pill */}
            <div className="flex items-center gap-3 rounded-full p-[2px_5px] m-0 mb-6 border border-solid border-[#E2E8F0]">
              <img src={plugin_root_url + '/assets/images/logo.svg'} alt="gameengine" className="h-6" />
              <LuLink size={14} color="#888" />
              <LuKey size={'16px'} color="#000000" />
            </div>

            {/* License input + Activate button */}
            <div className="flex items-center flex-wrap justify-center w-full gap-3 mb-4">
              <input className="flex-1 rounded h-9 pl-3 pr-3 text-sm ![border:1px_solid_var(--gameengine-border-color)_]" style={{
                "maxWidth": "340px",
                "minWidth": "200px"
              }} type="text" placeholder={__('Enter your license key', 'gameengine')} value={licenseKey} onChange={e => setLicenseKey(e.target.value)} onKeyDown={e => {
                if (e.key === 'Enter') handleActivate();
              }} />
              <button className="bg-[var(--gameengine-primary)] text-white text-sm font-semibold leading-5 border border-solid border-[var(--gameengine-primary)] px-4 py-2 rounded cursor-pointer" onClick={handleActivate}>
                {__('Activate License', 'gameengine')}
              </button>
            </div>

            <p className="text-sm m-0 text-[var(--gameengine-gray-color)]">
              {createInterpolateElement(__("Don't have a license key? <PurchaseLink/>", 'gameengine'), {
                PurchaseLink: <a href={PURCHASE_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--gameengine-primary)]">
                  {__('Purchase one here', 'gameengine')}
                </a>
              })}
            </p>
          </div>
        )}
      </>

      <HireUs sdk={SeSdk} />
    </>
  );
};

const MetaItem = ({
  label,
  value,
  valueColor
}) => <div className="flex flex-col items-start gap-1">
    <p className="text-xs font-normal m-0 text-[var(--gameengine-gray-color)]">
      {label}
    </p>

    {typeof value === 'string' || typeof value === 'number' ? (
      <p className="font-semibold m-0" style={{
        "fontSize": "13px",
        "color": valueColor || 'var(--gameengine-font-color)'
      }}>
        {value}
      </p>
    ) : value}
  </div>;

export default License;
