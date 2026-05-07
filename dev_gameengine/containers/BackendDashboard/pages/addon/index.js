import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik } from 'formik';
import Select from 'react-select';
import { __ } from '@wordpress/i18n';
import AddonCard from './AddonCard';
import TopBar from '@GFComponents/TopBar';
import Search from '@GFComponents/Search';
import GameEngineBox from '@GFComponents/GameEngineBox';
import AddOnsLoader from '@GFComponents/GameEngineLoader/AddOnsLoader';
import CustomTableMessage from '@GFComponents/Oops/CustomTableMessage';
import { fetchAddons } from '@GFRedux/Slices/addonsSlice/addonsSlice';
import {
  academyLms,
  storeEngine,
  wooCommerce,
  tutorLms,
  referralIcon,
} from '@GFUtils/icons';
import { plugin_root_url } from '@GFUtils/helper';
import Button from '@GFComponents/Button';
import GetHelp from '@GFComponents/GetHelp';

const infoCardsData = [
  // ── Free addons ──────────────────────────────────────────────────────────
  {
    label: __('Academy LMS', 'gameengine'),
    name: 'academylms',
    is_pro: false,
    is_coming_soon: false,
    details: __(
      'Reward learners with points, badges, and levels for course progress, quizzes, and engagement. boost!',
      'gameengine'
    ),
    required_plugin: [
      {
        plugin_dir_path: 'academy/academy.php',
        plugin_name: 'Academy LMS',
      },
    ],
    icon: academyLms(),
    docsUrl:
      'https://quizpress.pro/docs/how-to-use-quizpress-certificate-builder/',
    route: '',
  },
  {
    label: __('Tutor LMS', 'gameengine'),
    name: 'tutorlms',
    is_pro: false,
    is_coming_soon: false,
    details: __(
      'Reward learners with points, badges, and levels for course completions, lessons, and quizzes.',
      'gameengine'
    ),
    required_plugin: [
      {
        plugin_dir_path: 'tutor/tutor.php',
        plugin_name: 'Tutor LMS',
      },
    ],
    icon: tutorLms(),
    docsUrl: 'https://www.themeum.com/docs/tutor-lms-introduction/',
    route: '',
  },
  {
    label: __('StoreEngine', 'gameengine'),
    name: 'storeengine',
    is_pro: false,
    is_coming_soon: false,
    details: __(
      'Gamify purchases by rewarding customers for orders, spending, reviews, and store actions engagement',
      'gameengine'
    ),
    required_plugin: [
      {
        plugin_dir_path: 'storeengine/storeengine.php',
        plugin_name: 'StoreEngine',
      },
    ],
    icon: storeEngine(),
    route: '',
  },
  {
    label: __('WooCommerce', 'gameengine'),
    name: 'woocommerce',
    is_pro: false,
    is_coming_soon: false,
    details: __(
      'Add points, achievements, and ranks to WooCommerce actions like buying, reviews, and refunds. perks!',
      'gameengine'
    ),
    required_plugin: [
      {
        plugin_dir_path: 'woocommerce/woocommerce.php',
        plugin_name: 'WooCommerce',
      },
    ],
    icon: wooCommerce(),
    docsUrl:
      'https://quizpress.pro/docs/how-to-sell-quiz-with-woocommerce/',
    route: '',
  },
  {
    label: __('Restrict Unlock', 'gameengine'),
    name: 'restrict_unlock',
    is_pro: false,
    is_coming_soon: false,
    details: __(
      'Unlock content, levels, or rewards only when users complete goals or achievements earned progress!!',
      'gameengine'
    ),
    required_plugin: false,
    icon: false,
    image:
      plugin_root_url + 'assets/images/restrict_unlock.svg',
    docsUrl:
      'https://quizpress.pro/docs/how-to-sell-quiz-with-woocommerce/',
    route: 'admin.php?page=gameengine-achievements&action=new',
  },
  {
    label: __('Restrict Content', 'gameengine'),
    name: 'restrict_content',
    is_pro: false,
    is_coming_soon: false,
    details: __(
      'Control access by restricting posts, pages, or sections based on points, ranks, or badges. controlled',
      'gameengine'
    ),
    required_plugin: false,
    icon: false,
    image:
      plugin_root_url + 'assets/images/restrict_content.svg',
    docsUrl:
      'https://quizpress.pro/docs/how-to-sell-quiz-with-woocommerce/',
    route: '',
  },
  {
    label: __('Progress Map', 'gameengine'),
    name: 'progress_map',
    is_pro: false,
    is_coming_soon: false,
    details: __(
      'Visualize user progress with maps showing completed tasks, paths, milestones, and rewards. gamified!',
      'gameengine'
    ),
    required_plugin: false,
    icon: false,
    image:
      plugin_root_url + 'assets/images/progress_map.svg',
    docsUrl:
      'https://quizpress.pro/docs/how-to-sell-quiz-with-woocommerce/',
    route: '',
  },
  // ── New free addons (gameengine-feature-expansion) ───────────────────────
  {
    label: __('Points Expiration', 'gameengine'),
    name: 'points_expiration',
    is_pro: false,
    is_coming_soon: false,
    details: __(
      'Automatically expire points after a configurable period to keep users engaged and encourage timely redemption.',
      'gameengine'
    ),
    required_plugin: false,
    icon: false,
    image: plugin_root_url + 'assets/images/progress_map.svg',
    docsUrl: 'https://kodezen.com/docs/gameengine/points-expiration/',
    route: '',
  },
  {
    label: __('Enhanced Email Notifications', 'gameengine'),
    name: 'enhanced_email_notifications',
    is_pro: false,
    is_coming_soon: false,
    details: __(
      'Send fully customizable email notifications for points, achievements, rank-ups, and other gamification events.',
      'gameengine'
    ),
    required_plugin: false,
    icon: false,
    image: plugin_root_url + 'assets/images/progress_map.svg',
    docsUrl: 'https://kodezen.com/docs/gameengine/email-notifications/',
    route: '',
  },
  {
    label: __('New Engagement Triggers', 'gameengine'),
    name: 'new_engagement_triggers',
    is_pro: false,
    is_coming_soon: false,
    details: __(
      'Unlock additional trigger events — daily streaks, profile completion, social sharing, and custom hooks — to reward deeper engagement.',
      'gameengine'
    ),
    required_plugin: false,
    icon: false,
    image: plugin_root_url + 'assets/images/progress_map.svg',
    docsUrl: 'https://kodezen.com/docs/gameengine/engagement-triggers/',
    route: '',
  },
  {
    label: __('Social Sharing', 'gameengine'),
    name: 'social_sharing',
    is_pro: false,
    is_coming_soon: false,
    details: __(
      'Reward users for sharing achievements and content on social media platforms, driving viral growth.',
      'gameengine'
    ),
    required_plugin: false,
    icon: false,
    image: plugin_root_url + 'assets/images/progress_map.svg',
    docsUrl: 'https://kodezen.com/docs/gameengine/social-sharing/',
    route: '',
  },
  {
    label: __('Bulk Admin Tools', 'gameengine'),
    name: 'bulk_admin_tools',
    is_pro: false,
    is_coming_soon: false,
    details: __(
      'Award, deduct, or reset points and achievements in bulk for multiple users at once from the admin dashboard.',
      'gameengine'
    ),
    required_plugin: false,
    icon: false,
    image: plugin_root_url + 'assets/images/progress_map.svg',
    docsUrl: 'https://kodezen.com/docs/gameengine/bulk-tools/',
    route: '',
  },
  {
    label: __('Data Import / Export', 'gameengine'),
    name: 'data_import_export',
    is_pro: false,
    is_coming_soon: false,
    details: __(
      'Import and export points, achievements, and rank data as CSV for migration, backup, or bulk updates.',
      'gameengine'
    ),
    required_plugin: false,
    icon: false,
    image: plugin_root_url + 'assets/images/progress_map.svg',
    docsUrl: 'https://kodezen.com/docs/gameengine/import-export/',
    route: '',
  },
  {
    label: __('Progress Bar', 'gameengine'),
    name: 'progress_bar',
    is_pro: false,
    is_coming_soon: false,
    details: __(
      'Display beautiful progress bars showing how close users are to the next level, achievement, or points goal.',
      'gameengine'
    ),
    required_plugin: false,
    icon: false,
    image: plugin_root_url + 'assets/images/progress_map.svg',
    docsUrl: 'https://kodezen.com/docs/gameengine/progress-bar/',
    route: '',
  },
  {
    label: __('BuddyPress / BuddyBoss', 'gameengine'),
    name: 'buddypress_integration',
    is_pro: false,
    is_coming_soon: false,
    details: __(
      'Integrate with BuddyPress and BuddyBoss to award points for friend connections, profile updates, group activity, and more.',
      'gameengine'
    ),
    required_plugin: [
      {
        plugin_dir_path: 'buddypress/bp-loader.php',
        plugin_name: 'BuddyPress',
      },
    ],
    icon: false,
    image: plugin_root_url + 'assets/images/progress_map.svg',
    docsUrl: 'https://kodezen.com/docs/gameengine/buddypress/',
    route: '',
  },
  {
    label: __('LearnDash', 'gameengine'),
    name: 'learndash_integration',
    is_pro: false,
    is_coming_soon: false,
    details: __(
      'Connect GameEngine with LearnDash to reward learners for course completions, quiz passes, lesson progress, and more.',
      'gameengine'
    ),
    required_plugin: [
      {
        plugin_dir_path: 'sfwd-lms/sfwd_lms.php',
        plugin_name: 'LearnDash LMS',
      },
    ],
    icon: false,
    image: plugin_root_url + 'assets/images/progress_map.svg',
    docsUrl: 'https://kodezen.com/docs/gameengine/learndash/',
    route: '',
  },
  {
    label: __('bbPress', 'gameengine'),
    name: 'bbpress_integration',
    is_pro: false,
    is_coming_soon: false,
    details: __(
      'Award points for new forum topics, replies, and first posts in bbPress to build an active discussion community.',
      'gameengine'
    ),
    required_plugin: [
      {
        plugin_dir_path: 'bbpress/bbpress.php',
        plugin_name: 'bbPress',
      },
    ],
    icon: false,
    image: plugin_root_url + 'assets/images/progress_map.svg',
    docsUrl: 'https://kodezen.com/docs/gameengine/bbpress/',
    route: '',
  },
  // ── Pro addons ────────────────────────────────────────────────────────────
  {
    label: __('Wallet', 'gameengine'),
    name: 'wallet',
    is_pro: true,
    is_coming_soon: false,
    details: __(
      'Manage and view your wallet transactions with a clear list of balances, earnings, expenses, and payment history. Stay organized and in control!',
      'gameengine'
    ),
    required_plugin: false,
    icon: false,
    image:
      plugin_root_url + 'assets/images/progress_map.svg',
    docsUrl:
      'https://quizpress.pro/docs/how-to-sell-quiz-with-woocommerce/',
    route: 'admin.php?page=gameengine-wallet',
  },
  {
    label: __('Referrals & Affiliates', 'gameengine'),
    name: 'referrals',
    is_pro: true,
    is_coming_soon: false,
    details: __(
      'Boost growth by rewarding users for referring friends, tracked clicks, signups, and affiliate commissions.',
      'gameengine'
    ),
    required_plugin: false,
    icon: referralIcon(),
    docsUrl: 'https://kodezen.com/docs/gameengine/referrals/',
    route: 'admin.php?page=gameengine-referrals',
  },
  {
    label: __('Spin the Wheel', 'gameengine'),
    name: 'lucky-wheels',
    is_pro: true,
    is_coming_soon: false,
    details: __(
      'Allow users to spin a lucky wheel to win points and rewards. Fully customizable slices and probabilities.',
      'gameengine'
    ),
    required_plugin: false,
    icon: false,
    image: plugin_root_url + 'assets/images/progress_map.svg',
    docsUrl: '#',
    route: 'admin.php?page=gameengine-lucky-wheels',
  },
  // ── New pro addons (gameengine-feature-expansion) ─────────────────────────
  {
    label: __('Point Transfers', 'gameengine'),
    name: 'point_transfers',
    is_pro: true,
    is_coming_soon: false,
    details: __(
      'Let users send points to each other with configurable fees, minimum/maximum amounts, and daily transfer limits.',
      'gameengine'
    ),
    required_plugin: false,
    icon: false,
    image: plugin_root_url + 'assets/images/progress_map.svg',
    docsUrl: 'https://kodezen.com/docs/gameengine/point-transfers/',
    route: '',
  },
  {
    label: __('Buy Points', 'gameengine'),
    name: 'buy_points',
    is_pro: true,
    is_coming_soon: false,
    details: __(
      'Allow users to purchase point packages via PayPal or Stripe. Admin order management with refund support.',
      'gameengine'
    ),
    required_plugin: false,
    icon: false,
    image: plugin_root_url + 'assets/images/progress_map.svg',
    docsUrl: 'https://kodezen.com/docs/gameengine/buy-points/',
    route: '',
  },
  {
    label: __('Point Exchange', 'gameengine'),
    name: 'point_exchange',
    is_pro: true,
    is_coming_soon: false,
    details: __(
      'Enable users to convert between point types at configured exchange rates, with optional fees and cooldown periods.',
      'gameengine'
    ),
    required_plugin: false,
    icon: false,
    image: plugin_root_url + 'assets/images/progress_map.svg',
    docsUrl: 'https://kodezen.com/docs/gameengine/point-exchange/',
    route: '',
  },
  {
    label: __('Points Cap', 'gameengine'),
    name: 'points_cap',
    is_pro: true,
    is_coming_soon: false,
    details: __(
      'Set maximum point balance limits per point type, with global caps and per-role overrides. Admins bypass the cap.',
      'gameengine'
    ),
    required_plugin: false,
    icon: false,
    image: plugin_root_url + 'assets/images/progress_map.svg',
    docsUrl: 'https://kodezen.com/docs/gameengine/points-cap/',
    route: '',
  },
  {
    label: __('Sell Content', 'gameengine'),
    name: 'sell_content',
    is_pro: true,
    is_coming_soon: false,
    details: __(
      'Lock posts and pages behind a points paywall. Users spend points to unlock content permanently or temporarily.',
      'gameengine'
    ),
    required_plugin: false,
    icon: false,
    image: plugin_root_url + 'assets/images/progress_map.svg',
    docsUrl: 'https://kodezen.com/docs/gameengine/sell-content/',
    route: '',
  },
  {
    label: __('Analytics Charts', 'gameengine'),
    name: 'analytics_charts',
    is_pro: true,
    is_coming_soon: false,
    details: __(
      'Visualize points economy data with charts for gain/loss trends, balance distribution, top earners, and circulation.',
      'gameengine'
    ),
    required_plugin: false,
    icon: false,
    image: plugin_root_url + 'assets/images/progress_map.svg',
    docsUrl: 'https://kodezen.com/docs/gameengine/analytics/',
    route: '',
  },
  {
    label: __('Toast Notifications', 'gameengine'),
    name: 'toast_notifications',
    is_pro: true,
    is_coming_soon: false,
    details: __(
      'Display animated browser toast notifications for points earned, achievements unlocked, level-ups, and transfers.',
      'gameengine'
    ),
    required_plugin: false,
    icon: false,
    image: plugin_root_url + 'assets/images/progress_map.svg',
    docsUrl: 'https://kodezen.com/docs/gameengine/toast-notifications/',
    route: '',
  },
  {
    label: __('Open Badges', 'gameengine'),
    name: 'open_badges',
    is_pro: true,
    is_coming_soon: false,
    details: __(
      'Issue IMS Open Badges v2.0 digital credentials when users unlock achievements. Verifiable, shareable badge assertions.',
      'gameengine'
    ),
    required_plugin: false,
    icon: false,
    image: plugin_root_url + 'assets/images/progress_map.svg',
    docsUrl: 'https://kodezen.com/docs/gameengine/open-badges/',
    route: '',
  },
];

const statusOptions = [
  { value: 'all', label: __('All Status', 'gameengine') },
  { value: 'active', label: __('Active', 'gameengine') },
  { value: 'inactive', label: __('Inactive', 'gameengine') },
];

const Addons = () => {
  const addonsSavedData = useSelector((state) => state.addons);

  const [filterText, setFilterText] = useState('');
  const [loading, setLoading] = useState(!addonsSavedData);
  const [filterMenu, setFilterMenu] = useState('all');

  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        dispatch(fetchAddons());
      } catch (error) {
        console.warn(error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleClearAll = () => {
    setFilterText('');
    setFilterMenu('all');
  };

  const getAddonLists = (values) => {
    return infoCardsData.filter((item) => {
      if (
        item.label
          .toLowerCase()
          .includes(filterText.toLowerCase())
      ) {
        if (filterMenu === 'all') {
          setLoading(false);
          return item;
        } else if (filterMenu === 'active' && values[item.name]) {
          return item;
        } else if (
          filterMenu === 'inactive' &&
          !values[item.name]
        ) {
          return item;
        } else if (filterMenu === 'pro' && item.is_pro) {
          return item;
        } else if (filterMenu === 'free' && !item.is_pro) {
          return item;
        }
      }

      setLoading(false);
      return false;
    });
  };

  const selectedStatus =
    statusOptions.find((o) => o.value === filterMenu) ||
    statusOptions[0];

  return (
    <>
      <TopBar path={__('Add-ons', 'gameengine')} rightContent={<GetHelp filterText={['addons']} />} />

      <div className="gameengine-page-content">
        <div className="flex justify-between items-center py-6 px-1">
          <h2 className="gameengine-page-heading">
            {__("Add-ons", "gameengine")}
          </h2>

          <div className="flex items-end gap-4">
            <Button
              preset='gray'
              onClick={handleClearAll}
              label={__('Clear All', 'gameengine')}
            />

            <Select
              options={statusOptions}
              value={selectedStatus}
              onChange={(selected) => {
                setFilterMenu(selected.value);
                setLoading(true);
              }}
              className="gameengine-select"
              classNamePrefix="gameengine-select"
              isSearchable={false}
            />

            <Search
              className="gameengine-search bg-white"
              placeholder={__('Search...', 'gameengine')}
              onSearchHandler={(keyword) =>
                setFilterText(keyword.trim())
              }
            />
          </div>
        </div>

        <GameEngineBox dynamicClasses="addons">
          <Formik
            enableReinitialize
            initialValues={{ ...addonsSavedData }}
          >
            {({ setFieldValue, values }) => {
              const addonLists = getAddonLists(values);

              return (
                <>
                  {loading ? (
                    <AddOnsLoader />
                  ) : (
                    <div className="gameengine-dashboard-addon-cards flex w-full flex-wrap gap-4">
                      {addonLists.length ? (
                        addonLists.map((item, index) => (
                          <AddonCard
                            item={item}
                            key={index}
                            index={index}
                            value={values[item.name]}
                            setFieldValue={setFieldValue}
                          />
                        ))
                      ) : (
                        <CustomTableMessage
                          title={__('No Addons Found!', 'gameengine')}
                        />
                      )}
                    </div>
                  )}
                </>
              );
            }}
          </Formik>
        </GameEngineBox>
      </div>
    </>
  );
};

export default Addons;
