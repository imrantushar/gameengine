import React from 'react';
import { __ } from '@wordpress/i18n';
import { useFormikContext } from 'formik';

const INTEGRATIONS = [
  {
    key: 'buddypress',
    label: __('BuddyPress / BuddyBoss', 'gameengine'),
    desc: __('Award points for friend connections, profile updates, group activity, and messages.', 'gameengine'),
    events: [
      { key: 'friends_connected', label: __('Friends Connected', 'gameengine') },
      { key: 'profile_updated', label: __('Profile Updated', 'gameengine') },
      { key: 'group_joined', label: __('Joined a Group', 'gameengine') },
      { key: 'message_sent', label: __('Sent a Message', 'gameengine') },
    ],
  },
  {
    key: 'learndash',
    label: __('LearnDash', 'gameengine'),
    desc: __('Award points for course completions, lessons finished, quiz passes and fails.', 'gameengine'),
    events: [
      { key: 'course_completed', label: __('Course Completed', 'gameengine') },
      { key: 'lesson_completed', label: __('Lesson Completed', 'gameengine') },
      { key: 'quiz_passed', label: __('Quiz Passed', 'gameengine') },
      { key: 'quiz_failed', label: __('Quiz Failed', 'gameengine') },
    ],
  },
  {
    key: 'bbpress',
    label: __('bbPress', 'gameengine'),
    desc: __('Award points for creating topics, posting replies, and first forum posts.', 'gameengine'),
    events: [
      { key: 'new_topic', label: __('New Topic Created', 'gameengine') },
      { key: 'new_reply', label: __('New Reply Posted', 'gameengine') },
      { key: 'first_forum_post', label: __('First Post in Forum', 'gameengine') },
      { key: 'topic_resolved', label: __('Topic Marked Resolved', 'gameengine') },
    ],
  },
];

const Integrations = () => {
  const { values, setFieldValue } = useFormikContext();
  const intg = values?.integrations || {};

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-base font-semibold text-gray-800 mb-1">{__('Integrations', 'gameengine')}</h3>
        <p className="text-sm text-gray-500">{__('Configure which events from third-party plugins award points. Each integration requires the corresponding plugin to be active.', 'gameengine')}</p>
      </div>

      {INTEGRATIONS.map(intItem => {
        const cfg = intg[intItem.key] || {};
        return (
          <div key={intItem.key} className="border border-gray-100 rounded-lg p-5 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="font-semibold text-gray-800">{intItem.label}</span>
                <p className="text-xs text-gray-500 mt-0.5">{intItem.desc}</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={!!cfg.enabled}
                  onChange={e => setFieldValue(`integrations.${intItem.key}.enabled`, e.target.checked)}
                />
                <span className="text-sm font-medium">{__('Enable', 'gameengine')}</span>
              </label>
            </div>

            {cfg.enabled && (
              <div className="mt-4 grid grid-cols-1 gap-3">
                {intItem.events.map(ev => {
                  const evCfg = cfg.events?.[ev.key] || {};
                  return (
                    <div key={ev.key} className="flex items-center gap-4 pl-2">
                      <label className="flex items-center gap-2 w-44 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!evCfg.enabled}
                          onChange={e => setFieldValue(`integrations.${intItem.key}.events.${ev.key}.enabled`, e.target.checked)}
                        />
                        <span className="text-sm">{ev.label}</span>
                      </label>
                      {evCfg.enabled && (
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-500">{__('Points:', 'gameengine')}</label>
                          <input
                            type="number"
                            min="0"
                            className="border border-gray-300 rounded px-2 py-1 text-sm w-20"
                            value={evCfg.points || ''}
                            onChange={e => setFieldValue(`integrations.${intItem.key}.events.${ev.key}.points`, parseInt(e.target.value, 10) || 0)}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Integrations;
