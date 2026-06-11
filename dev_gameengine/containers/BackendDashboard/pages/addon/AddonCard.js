import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { __, sprintf } from '@wordpress/i18n';
import CustomSwitch from '@GFComponents/CustomSwitch';
import { fetchAddons, saveAddon, } from '@GFRedux//Slices/addonsSlice/addonsSlice';
import { useFormikContext } from 'formik';
import { admin_url, is_pro, } from '@GFUtils/helper';
import { showNotification } from '@GFRedux/Slices/notificationSlice/notificationSlice';
import { fetchSettings } from '@GFRedux/Slices/settingsSlice/settingsSlice';
import { LuSettings } from 'react-icons/lu';
import { FaLock } from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import { fetchAdminMenuItems } from '@GFRedux/Slices/menuSlice/menuSlice';
import KodezenTooltip from '@GFComponents/Tooltip/KodezenTooltip';
import { TbExternalLink } from 'react-icons/tb';

const AddonCard = ({ item, value }) => {
  const { values, setFieldValue } = useFormikContext();
  const [updating, setUpdating] = useState(false);
  const dispatch = useDispatch();

  const onChangeHandler = () => {
    setUpdating(true);

    const status = !value;

    dispatch(
      saveAddon({
        addon: item.name,
        status,
      })
    ).then(({ payload }) => {
      if (payload) {
        if (payload?.success) {
          setFieldValue(item.name, status);

          dispatch(fetchAddons());

          const statusMessage = payload?.active_addons[item.name]
            ? __('Activated', 'gameengine')
            : __('Deactivate', 'gameengine');

          dispatch(
            showNotification({
              message: sprintf(
                __('%1$s successfully %2$s', 'gameengine'),
                item.label,
                statusMessage
              ),
              isShow: true,
              type: 'success',
            })
          );

          setUpdating(false);

          dispatch(fetchSettings());
          dispatch(fetchAdminMenuItems());
        } else {
          setFieldValue(item.name, false);

          dispatch(
            showNotification({
              message: payload.data,
              isShow: true,
              type: 'error',
            })
          );

          setUpdating(false);
        }
      }
    });
  };

  const isShowProTag = !is_pro && item.is_pro;
  const showSwitch = !item.is_coming_soon && !isShowProTag;
  const showSettings =
    item?.route &&
    !item.is_coming_soon &&
    values[item.name] === true;

  const getIconBorderColor = () => {
    if (item.name === 'certificates') return '#7b68ee';
    if (item.name === 'academylms') return '#7B68EE';
    if (item.name === 'tutorlms') return '#0049F8';
    if (item.name === 'storeengine') return '#008dff';
    if (item.name === 'woocommerce') return '#873eff';
    if (item.name === 'restrict_unlock') return '#8270DB';
    if (item.name === 'restrict_content') return '#4F46E5';
    if (item.name === 'progress_map') return '#10B981';
    if (item.name === 'referrals') return '#10B981';
    if (item.name === 'wallet') return '#10B981';
    if (item.name === 'lucky-wheels') return '#F97316';
    return '#e2e8f0';
  };

  return (
    <div className="flex flex-col bg-white p-4 rounded-md [border:1px_solid_var(--gameengine-border-color)] w-full md:w-[calc(50%_-_42px)] lg:w-[calc((100%/3)_-_11px)]">
      <div className="flex justify-between items-start mb-4">
        <div
          className="items-center justify-center p-2 rounded-md flex w-10 h-10"
          style={{
            border: `1px solid ${getIconBorderColor()}`,
          }}
        >
          {item.icon ? (
            item.icon
          ) : (
            <img
              className="w-6 h-6"
              src={item.image}
              objectFit="contain"
            />
          )}
        </div>

        <div className="flex items-center gap-2">
          {showSettings && (
            <Link to={admin_url + item?.route}>
              <LuSettings
                size={20}
                color="var(--gameengine-subtitle-color, #6B7280)"
              />
            </Link>
          )}

          {item.is_coming_soon ? (
            <span
              style={{
                padding: '3px 10px',
                borderRadius: '10px',
                fontSize: '11px',
              }}
            >
              {__('Coming Soon', 'gameengine')}
            </span>
          ) : isShowProTag ? (
            <KodezenTooltip
              openerContent={
                <FaLock size="20px" color="orange" />
              }
              contentWidth="fit-content"
            >
              <p
                className="font-normal m-0"
                style={{ fontSize: '13px' }}
              >
                {__('Available in pro', 'gameengine')}
              </p>
            </KodezenTooltip>
          ) : (
            <div
              style={{
                pointerEvents: updating ? 'none' : 'auto',
                opacity: updating ? 0.6 : 1,
              }}
            >
              {showSwitch && (
                <CustomSwitch
                  name={item.name}
                  value={values[item.name]}
                  onChange={onChangeHandler}
                />
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <p
          className="text-[16px] font-medium leading-6 m-0 text-[var(--gameengine-font-color)]"
        >
          {item.label}
        </p>

        {item.docsUrl && (
          <a
            href={item.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center leading-none"
            style={{ color: '#718096' }}
          >
            <TbExternalLink
              size={15}
              color="var(--gameengine-primary)"
            />
          </a>
        )}
      </div>

      <p
        className="text-xs font-normal leading-5 m-0 text-[#738496]"
      >
        {item.details}
      </p>
    </div>
  );
};

export default AddonCard;
