import React, { useMemo } from 'react';
import SettingsHeader from '../../components/SettingsHeader';
import { __ } from '@wordpress/i18n';
import { TiPointOfInterestOutline } from "react-icons/ti";
import { GrAchievement } from "react-icons/gr";
import { SiLevelsdotfyi } from "react-icons/si";
import { Icon } from '@GFComponents/UI';
import GFLabel from '@GFComponents/Labels/GFLabel';
import { useFormikContext } from 'formik';
import { plugin_root_url } from '@GFUtils/helper';
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
const pointsData = {
  author: {
    use_case: 'Multi-author blogs, magazines, news sites',
    achievements: ['First Draft', 'Published Author', 'Consistent Writer', 'Trusted Author'],
    levels: ['New Author', 'Regular Author', 'Senior Author', 'Master Author']
  },
  blogger: {
    use_case: 'Personal blogs, content creators',
    achievements: ['First Post', 'Active Blogger', 'Growing Blog', 'Blog Authority'],
    levels: ['Beginner Blogger', 'Active Blogger', 'Pro Blogger', 'Top Blogger']
  },
  shop: {
    use_case: 'WooCommerce, loyalty programs',
    achievements: ['First Purchase', 'Repeat Buyer', 'Loyal Customer', 'VIP Shopper'],
    levels: ['Shopper', 'Regular Buyer', 'Loyal Buyer', 'VIP Member']
  },
  performance: {
    use_case: 'Teams, companies, internal dashboards',
    achievements: ['Onboarded', 'Task Completed', 'Consistent Performer', 'Top Performer'],
    levels: ['Junior', 'Associate', 'Senior', 'Lead']
  },
  community: {
    use_case: 'Forums, membership communities',
    achievements: ['Welcome Member', 'First Contribution', 'Active Member', 'Trusted Voice'],
    levels: ['Newcomer', 'Member', 'Contributor', 'Community Leader']
  },
  growth: {
    use_case: 'Marketing teams, agencies, SaaS growth',
    achievements: ['Campaign Launched', 'Lead Generator', 'Growth Booster', 'Growth Champion'],
    levels: ['Marketer', 'Growth Specialist', 'Growth Manager', 'Growth Leader']
  }
};
const DataPreview = () => {
  const {
    values,
    setFieldValue
  } = useFormikContext();
  const selectedCard = previewCards.find(item => item.slug === values.preset);
  const previewData = [{
    title: __("Achievement", "gamneengine"),
    slug: 'achievements'
  }, {
    title: __("Levels", "gamneengine"),
    slug: 'levels'
  }];
  return <>
      <SettingsHeader title={__('Setup Your GameEngine', 'gemboards')} subTitle={__('Choose your preferred gamification setup', 'gemboards')} />
      <div className="w-full">
        <div className="flex flex-wrap gap-4">
          {previewCards.map((item, idx) => {
          const isSelected = item.slug === values.preset;
          return <div className="flex items-center cursor-pointer gap-3 p-4 rounded text-center" style={{
            "maxWidth": "280px",
            "width": "calc((100% / 3) - 11px)",
            "border": `1px solid ${isSelected ? 'var(--gameengine-primary)' : '#E0E4E8'}`,
            "background": isSelected && '#F3F5FF'
          }} key={idx} onClick={() => {
            setFieldValue('preset', item.slug);
          }}>
                <img className="h-auto" style={{
              "maxWidth": "36px"
            }} src={plugin_root_url + item.icon} />
                <div className="flex flex-col items-start gap-1">
                  <GFLabel type="simpleHeading" margin={0} padding={0} label={item.label} lineHeight={'20px'} />
                  <GFLabel type="simple" margin={0} padding={0} label={item.description} fontSize={'12px'} lineHeight={'16px'} />
                </div>
              </div>;
        })}
        </div>
        <div className="flex w-full flex-col p-4 gap-4 rounded-md mt-6" style={{
        "background": "#F3F5FF"
      }}>
          <GFLabel type="simple" margin={0} padding={0} label={__('Levels & Achievements Preview', 'gameengine')}
        // fontSize={'16px'}
        // lineHeight={'24px'}
        />
          <div className="flex gap-4">
            {previewData.map((item, idx) => {
            return <div className="flex flex-col gap-3 bg-white rounded" style={{
              "width": "calc(100% / 2)",
              "padding": "16px 24px"
            }}>
                  <div className="flex items-center gap-0.5" wordWrap={'break-word'}>
                    <GFLabel type="simpleHeading" margin={0} padding={0} label={item.title} fontSize={'16px'} lineHeight={'24px'} />
                    {selectedCard && <GFLabel type="simple" margin={'2px 0 0 0'} padding={0} label={' ( ' + selectedCard.label + ' Points )'} fontSize={'12px'} lineHeight={'24px'} />}
                  </div>
                  {values.preset && pointsData[values.preset][item.slug].map((dataItem, index) => <GFLabel type="simple" margin={0} padding={0} label={dataItem} />)}
                </div>;
          })}
          </div>
        </div>
      </div>
    </>;
};
export default DataPreview;