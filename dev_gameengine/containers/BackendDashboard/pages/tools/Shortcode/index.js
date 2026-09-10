import React from 'react';
import { __ } from '@wordpress/i18n';
import ShortCodeItem from './ShortCodeItem';
import { getShortcodes } from '@GFUtils/extend';

const shortCodeData = [
  {
    title: __('Highest Level', 'gameengine'),
    shortCode: '[gameengine_level]',
    subtitle: __(
      'Displays the current users highest achieved level rank with a trophy icon.',
      'gameengine'
    ),
    description: __(
      'Perfect for user headers, bio sections, or profile sidebar widgets.',
      'gameengine'
    ),
    url: 'https://gameengine.pro/docs/',
  },
  {
    title: __('Points Balance', 'gameengine'),
    shortCode: '[gameengine_points]',
    subtitle: __(
      'Shows the current users total points balance with a coin icon.',
      'gameengine'
    ),
    description: __(
      'Ideal for menus, headers, or any place where you want to show the users wallet balance.',
      'gameengine'
    ),
    url: 'https://gameengine.pro/docs/',
  },
  {
    title: __('Achievements List', 'gameengine'),
    shortCode: '[gameengine_achievements]',
    subtitle: __(
      'Displays a clean grid of all achievements earned by the user.',
      'gameengine'
    ),
    description: __(
      'Shows badge images, titles, and unlock hints for any locked achievements.',
      'gameengine'
    ),
    url: 'https://gameengine.pro/docs/',
  },
  {
    title: __('Profile Dashboard', 'gameengine'),
    shortCode: '[gameengine_profile]',
    subtitle: __(
      'Displays the full modern gamification dashboard with Tabs and Progress Map.',
      'gameengine'
    ),
    description: __(
      'A complete hub where users can see their points, badges, and roadmap in one place.',
      'gameengine'
    ),
    url: 'https://gameengine.pro/docs/',
  },
  {
    title: __('Progress Map', 'gameengine'),
    shortCode: '[gameengine_progress_map]',
    subtitle: __(
      'Shows a visual zig-zag roadmap of levels and achievements progression.',
      'gameengine'
    ),
    description: __(
      'Provides an interactive journey timeline without the full dashboard layout.',
      'gameengine'
    ),
    url: 'https://gameengine.pro/docs/how-to-work-gameengine-progress-map-addon/',
  },
  {
    title: __('Content Restriction', 'gameengine'),
    shortCode: '[gameengine_restrict type="points" value="50"]',
    subtitle: __(
      'Lock specific text, images, or links based on points, badges, or levels.',
      'gameengine'
    ),
    description: __(
      'Usage: type (points/achievement/level), value (amount or ID), and optional custom message.',
      'gameengine'
    ),
    url: 'https://gameengine.pro/docs/restrict-content-using-points-gameengine/',
  },
];

const ShortCode = () => {
  return (
    <div className="gameengine-tools-page__short-code border-0 border-t border-solid border-[var(--gameengine-border-color)] pt-6">
      {getShortcodes(shortCodeData).map((item, index) => (
        <ShortCodeItem shortCodeItem={item} key={index} />
      ))}
    </div>
  );
};

export default ShortCode;
