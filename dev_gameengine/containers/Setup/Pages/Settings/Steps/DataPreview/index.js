import React, { useEffect, useState } from 'react';
import SettingsHeader from '../../components/SettingsHeader';
import { __, sprintf } from '@wordpress/i18n';
import GFLabel from '@GFComponents/Labels/GFLabel';
import { useFormikContext } from 'formik';
import { API, plugin_root_url } from '@GFUtils/helper';

const previewCards = [{
  label: __('Author', 'gameengine'),
  description: __('For authors active', 'gameengine'),
  icon: '/assets/images/setup/author.svg',
  slug: 'author'
}, {
  label: __('Blogger', 'gameengine'),
  description: __('For blog activity', 'gameengine'),
  icon: '/assets/images/setup/blogger.svg',
  slug: 'blogger'
}, {
  label: __('eCommerce', 'gameengine'),
  description: __('For shop customers', 'gameengine'),
  icon: '/assets/images/setup/eCommerce.svg',
  slug: 'shop'
}, {
  label: __('Performance', 'gameengine'),
  description: __('For task results', 'gameengine'),
  icon: '/assets/images/setup/performance.svg',
  slug: 'performance'
}, {
  label: __('Community', 'gameengine'),
  description: __('For community help', 'gameengine'),
  icon: '/assets/images/setup/community.svg',
  slug: 'community'
}, {
  label: __('Growth', 'gameengine'),
  description: __('For growth actions', 'gameengine'),
  icon: '/assets/images/setup/growth.svg',
  slug: 'growth'
}];

/**
 * Preset picker and preview.
 *
 * Only the cards are defined here. What each preset creates comes from the
 * server's preset definitions, the same ones the import uses, so the preview
 * can't promise something the import doesn't do.
 */
const DataPreview = () => {
  const { values, setFieldValue } = useFormikContext();
  const [presets, setPresets] = useState(null);

  useEffect(() => {
    API.get('/setup/presets')
      .then((response) => setPresets(Array.isArray(response.data) ? response.data : []))
      .catch(() => setPresets([]));
  }, []);

  const presetFor = (slug) => (presets || []).find((preset) => preset.slug === slug);
  const selected = presetFor(values.preset);

  return (
    <>
      <SettingsHeader title={__('Setup Your GameEngine', 'gameengine')} subTitle={__('Choose a starter set that fits your site. You can change all of it later.', 'gameengine')} />
      <div className="w-full">
        <div className="grid grid-cols-3 gap-3 max-w-[900px] mx-auto">
          {previewCards.map((item) => {
            const preset = presetFor(item.slug);
            const unavailable = preset ? !preset.available : false;
            const isSelected = item.slug === values.preset;
            const choose = () => !unavailable && setFieldValue('preset', item.slug);

            return (
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all border-[1px] border-solid
  ${isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                  } ${unavailable ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                key={item.slug}
                role="button"
                tabIndex={unavailable ? -1 : 0}
                aria-pressed={isSelected}
                aria-disabled={unavailable}
                onClick={choose}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    choose();
                  }
                }}
              >
                <img className="h-auto max-w-[36px]" src={plugin_root_url + item.icon} alt="" />
                <div className="flex flex-col items-start gap-1">
                  <GFLabel type="simpleHeading" margin={0} padding={0} label={item.label} lineHeight={'20px'} />
                  <GFLabel type="simple" margin={0} padding={0} label={unavailable ? __('Needs WooCommerce', 'gameengine') : item.description} fontSize={'12px'} lineHeight={'16px'} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col p-4 gap-3 rounded-lg mt-4 bg-[#F3F5FF]">
          <GFLabel type="simple" margin={0} padding={0} label={__('What this creates', 'gameengine')} fontSize="14px" color="#64748B" />

          {!presets && (
            <p className="m-0 text-sm text-[#475569]">{__('Loading the preview…', 'gameengine')}</p>
          )}

          {presets && !selected && (
            <p className="m-0 text-sm text-[#475569]">{__('The preview could not be loaded, but setup will still work.', 'gameengine')}</p>
          )}

          {selected && (
            <>
              <div className="flex flex-wrap items-baseline gap-x-2 -mt-1">
                <GFLabel type="simpleHeading" margin={0} padding={0} label={selected.point} fontSize={'16px'} lineHeight={'24px'} />
                <span className="text-[#94A3B8]" aria-hidden="true">·</span>
                <p className="m-0 text-sm text-[#475569]">
                  {sprintf(
                    /* translators: 1: number of points, 2: an action such as "publishes a post" */
                    __('+%1$d each time someone %2$s', 'gameengine'),
                    selected.points,
                    selected.trigger_label
                  )}
                </p>
              </div>

              <div className="flex gap-4 w-full">
                <div className="flex flex-col gap-2 bg-white rounded-lg w-1/2 px-4 py-3 shadow-sm">
                  <GFLabel type="simpleHeading" margin={0} padding={0} label={__('Achievements', 'gameengine')} fontSize={'16px'} lineHeight={'24px'} />
                  {(selected.achievements || []).map((achievement) => {
                    const title = typeof achievement === 'string' ? achievement : achievement.title;
                    const points = typeof achievement === 'object' ? achievement.points : null;

                    return (
                      <p key={title} className="m-0 text-sm text-[#475569] flex justify-between gap-2">
                        <span>{title}</span>
                        {points ? (
                          <span className="text-[#64748B] whitespace-nowrap">
                            {sprintf(
                              /* translators: %s: number of points */
                              __('at %s points', 'gameengine'),
                              points
                            )}
                          </span>
                        ) : null}
                      </p>
                    );
                  })}
                </div>

                <div className="flex flex-col gap-2 bg-white rounded-lg w-1/2 px-4 py-3 shadow-sm">
                  <GFLabel type="simpleHeading" margin={0} padding={0} label={__('Levels', 'gameengine')} fontSize={'16px'} lineHeight={'24px'} />
                  {(selected.levels || []).map((level) => (
                    <p key={level.title} className="m-0 text-sm text-[#475569] flex justify-between gap-2">
                      <span>{level.title}</span>
                      <span className="text-[#64748B] whitespace-nowrap">
                        {sprintf(
                          /* translators: 1: lowest points, 2: highest points */
                          __('%1$s–%2$s points', 'gameengine'),
                          level.min,
                          level.max
                        )}
                      </span>
                    </p>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default DataPreview;
