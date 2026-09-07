import React, { memo } from 'react';
import { __ } from '@wordpress/i18n';
import './styles.scss';
let _noticeCounter = 0;
const Notice = ({
  notice,
  style,
  onDismiss
}) => {
  const classes = ['gameengine-admin-notice', 'gameengine-admin-notice-' + notice.type, 'notice', ...(Array.isArray(notice?.classes) ? notice.classes : [notice?.classes].filter(s => !!s))];
  switch (notice.type) {
    case 'error':
      classes.push('notice-error');
      break;
    case 'warning':
      classes.push('notice-warning');
      break;
    case 'success':
      classes.push('notice-success');
      break;
    case 'info':
    default:
      classes.push('notice-info');
      break;
  }
  if (notice.large) {
    classes.push('notice-large');
  }
  if (notice.alt) {
    classes.push('notice-alt');
  }
  if (notice.dismissible) {
    classes.push('is-dismissible');
  }
  const notice_id = notice?.key ? `gameengine-admin-notice-${notice.key}` : `gameengine-admin-notice-${++_noticeCounter}`;
  return <div id={notice_id} className={classes.join(' ')} role="alert" style={style} aria-live="polite">
			{notice.title && <h3 className="notice-title flex items-center gap-[5px]">
					{notice.icon && <span className={`${`gameengine-icon gameengine-icon--${notice.icon}`} flex`} aria-hidden={true} />}
					<span>{notice.title}</span>
				</h3>}
			<div className="gameengine-admin-notice__wrapper">
				{!notice.title && notice.icon && <div className="gameengine-admin-notice__icon">
						<span className={`${`gameengine-icon gameengine-icon--${notice.icon}`} flex`} aria-hidden={true} />
					</div>}
				{React.isValidElement(notice.message) ? <div className="gameengine-admin-notice__content">
						{notice.message}
					</div> : <div className="gameengine-admin-notice__content" dangerouslySetInnerHTML={{
        __html: notice.message
      }} />}
				{notice.has_buttons && <div className="gameengine-admin-notice__control">
						{notice.button_text && notice.button_action && <a className={notice.button_class || 'gameengine-btn gameengine-btn--md gameengine-btn--preset-purple'} target={notice.button_target || '_self'} href={notice.button_action.replace(/&#038;/g, '&').replace(/&amp;/g, '&')}>
								{notice.button_text.replace(/&#038;/g, '&').replace(/&amp;/g, '&')}
							</a>}
                                                {notice.dismissible && notice.key && <button className="gameengine-admin-notice-close notice-dismiss cursor-pointer p-0 [background:none] border-0" aria-label={__('Dismiss this notice', 'gameengine')} onClick={() => onDismiss(notice.key)}>
								<span className="gameengine-icon gameengine-icon--close flex" aria-hidden={true} />
							</button>}
					</div>}
			</div>
		</div>;
};
export default memo(Notice);