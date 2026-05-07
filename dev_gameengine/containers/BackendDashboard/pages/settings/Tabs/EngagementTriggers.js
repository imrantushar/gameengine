import React from 'react';
import { __ } from '@wordpress/i18n';
import { useFormikContext } from 'formik';

const NEW_TRIGGERS = [
  { key: 'daily_login_streak', label: __('Daily Login Streak', 'gameengine'), desc: __('Award bonus points on consecutive daily logins (e.g. 7-day streak).', 'gameengine') },
  { key: 'profile_completion', label: __('Profile Completion', 'gameengine'), desc: __('Award points when a user fills out all profile fields.', 'gameengine') },
  { key: 'first_comment', label: __('First Comment', 'gameengine'), desc: __('Award points the first time a user leaves a comment on any post.', 'gameengine') },
  { key: 'post_liked', label: __('Post Liked', 'gameengine'), desc: __('Award points when a user likes a post (requires compatible like plugin).', 'gameengine') },
  { key: 'user_followed', label: __('User Followed', 'gameengine'), desc: __('Award points when a user follows another user.', 'gameengine') },
  { key: 'media_uploaded', label: __('Media Uploaded', 'gameengine'), desc: __('Award points when a user uploads a media file.', 'gameengine') },
];

const EngagementTriggers = () => {
  const { values, setFieldValue } = useFormikContext();
  const et = values?.engagement_triggers || {};

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-base font-semibold text-gray-800 mb-1">{__('Engagement Triggers', 'gameengine')}</h3>
        <p className="text-sm text-gray-500">{__('Enable or disable additional trigger events. Disabled triggers will never fire, even if point rules reference them.', 'gameengine')}</p>
      </div>

      <div className="flex flex-col gap-3">
        {NEW_TRIGGERS.map(trigger => {
          const cfg = et[trigger.key] || {};
          return (
            <div key={trigger.key} className="border border-gray-100 rounded-lg p-4 bg-white shadow-sm flex items-start gap-4">
              <input
                type="checkbox"
                className="mt-1"
                checked={cfg.enabled !== false}
                onChange={e => setFieldValue(`engagement_triggers.${trigger.key}.enabled`, e.target.checked)}
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800 m-0">{trigger.label}</p>
                <p className="text-xs text-gray-500 m-0 mt-0.5">{trigger.desc}</p>
              </div>
              {cfg.enabled !== false && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <label className="text-xs text-gray-500">{__('Daily limit:', 'gameengine')}</label>
                  <input
                    type="number"
                    min="0"
                    className="border border-gray-300 rounded px-2 py-1 text-sm w-20"
                    value={cfg.daily_limit || ''}
                    placeholder="∞"
                    onChange={e => setFieldValue(`engagement_triggers.${trigger.key}.daily_limit`, parseInt(e.target.value, 10) || 0)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EngagementTriggers;
