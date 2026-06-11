import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik } from 'formik';
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
import './addon-tabs.css';

const infoCardsData = [
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
    image:
      plugin_root_url + 'assets/images/progress_map.svg',
    docsUrl: '#',
    route: 'admin.php?page=gameengine-lucky-wheels',
  },
];

const TABS = [
  { value: 'all',      label: __('All',      'gameengine') },
  { value: 'active',   label: __('Active',   'gameengine') },
  { value: 'inactive', label: __('Inactive', 'gameengine') },
  { value: 'free',     label: __('Free',     'gameengine') },
  { value: 'pro',      label: __('Pro',      'gameengine') },
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

            <div className="gameengine-addon-tabs">
              {TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setFilterMenu(tab.value)}
                  className={`gameengine-addon-tabs__tab${filterMenu === tab.value ? ' gameengine-addon-tabs__tab--active' : ''}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

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
