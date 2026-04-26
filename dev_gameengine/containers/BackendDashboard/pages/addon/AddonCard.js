import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { __, sprintf } from '@wordpress/i18n';
import { Icon } from '@GFComponents/UI';
import CustomSwitch from '@GFComponents/CustomSwitch';
import { fetchAddons, saveAddon } from '@GFRedux//Slices/addonsSlice/addonsSlice';
import { useFormikContext } from 'formik';
import { admin_url, is_pro } from '@GFUtils/helper';
import { showNotification } from '@GFRedux/Slices/notificationSlice/notificationSlice';
import { fetchSettings } from '@GFRedux/Slices/settingsSlice/settingsSlice';
import { LuSettings } from "react-icons/lu";
import { FaLock } from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import { fetchAdminMenuItems } from '@GFRedux/Slices/menuSlice/menuSlice';
import KodezenTooltip from '@GFComponents/Tooltip/KodezenTooltip';
import { TbExternalLink } from 'react-icons/tb';
const AddonCard = ({
  item,
  index,
  value
}) => {
  const {
    values,
    setFieldValue
  } = useFormikContext();
  const [updating, setUpdating] = useState(false);
  const dispatch = useDispatch();
  const onChangeHandler = () => {
    setUpdating(true);
    const status = !value;
    dispatch(saveAddon({
      addon: item.name,
      status
    })).then(({
      payload
    }) => {
      if (payload) {
        if (payload?.success) {
          setFieldValue(item.name, status);
          dispatch(fetchAddons());
          const statusMessage = payload?.active_addons[item.name] ? __('Activated', 'academy') : __('Deactivate', 'academy');
          dispatch(showNotification({
            message: sprintf(
            // translators: %1$s: AddonName, %2$s: AddonStatus
            __('%1$s successfully %2$s', 'academy'), item.label, statusMessage),
            isShow: true,
            type: 'success'
          }));
          setUpdating(false);
          dispatch(fetchSettings());
          dispatch(fetchAdminMenuItems());
        } else {
          setFieldValue(item.name, false);
          dispatch(showNotification({
            message: payload.data,
            isShow: true,
            type: 'error'
          }));
          setUpdating(false);
        }
      }
    });
  };
  const isShowProTag = !is_pro && item.is_pro;
  const showSwitch = !item.is_coming_soon && !isShowProTag;
  const showSettings = item?.route && !item.is_coming_soon && values[item.name] === true;
  const getIconBorderColor = () => {
    if (item.name === 'certificates') return '#7b68ee';
    if (item.name === 'storeengine') return '#008dff';
    if (item.name === 'woocommerce') return '#873eff';
    return '#e2e8f0';
  };
  return <div className="flex flex-col bg-white p-4 gap-3 rounded-md [box-shadow:var(--gameengine-shadow)] [border:1px_solid_var(--gameengine-border-color)] w-full md:w-[calc(50%_-_42px)] lg:w-[calc(33.333%_-_45px)]">
			<div className="flex justify-between items-start">
				<div className="items-center justify-center p-2 rounded-md flex w-10 h-10" style={{
        "border": `1px solid ${getIconBorderColor()}`
      }}>
					{item.icon ? item.icon : <img className="w-6 h-6" src={item.image} objectFit="contain" />}
				</div>

				<div className="flex items-center gap-2">
					{showSettings && <Link to={admin_url + item?.route}>
							<LuSettings size={24} color="var(--gameengine-subtitle-color, #6B7280)" />
						</Link>}

					{item.is_coming_soon ? <span style={{
          "padding": "3px 10px",
          "borderRadius": "10px",
          "fontSize": "11px"
        }}>
							{__('Coming Soon', 'gameengine')}
						</span> : isShowProTag ? <KodezenTooltip openerContent={<Icon as={FaLock} boxSize={5} color="orange" />} contentWidth="fit-content">
							<p className="font-normal m-0" style={{
            "fontSize": "13px"
          }}>
								{__('Available in pro', 'gameengine')}
							</p>
						</KodezenTooltip> : <div style={{
          "pointerEvents": updating ? 'none' : 'auto',
          "opacity": updating ? 0.6 : 1
        }}>
							{showSwitch && <CustomSwitch name={item.name} value={values[item.name]} onChange={onChangeHandler} />}
						</div>}
				</div>
			</div>

			<div className="flex items-center gap-1.5">
				<p className="text-sm font-semibold m-0 text-[var(--gameengine-font-color)]" style={{
        "lineHeight": "1.4"
      }}>
					{item.label}
				</p>
				{item.docsUrl && <a href={item.docsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center leading-none" style={{
        color: '#718096'
      }}>
						<TbExternalLink size={15} color='var(--gameengine-primary)' />
					</a>}
			</div>

			<p className="text-xs font-normal m-0" style={{
      "color": "#738496",
      "lineHeight": "1.6"
    }}>
				{item.details}
			</p>
		</div>;
};
export default AddonCard;