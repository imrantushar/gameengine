import React from 'react';
import { __ } from '@wordpress/i18n';
import ShortCodeItem from './ShortCodeItem';
import { getShortcodes } from '@GFUtils/extend';

const shortCodeData = [
  {
    title: __('Points Balance', 'gameengine'),
    shortCode: '[gameengine_points]',
    subtitle: __(
      "Shows the logged-in member's total points balance.",
      'gameengine'
    ),
    description: __(
      'Ideal for menus, headers, or anywhere you want their balance on show. Renders 0 for logged-out visitors.',
      'gameengine'
    ),
    attributes: [],
    example: '[gameengine_points]',
    url: 'https://gameengine.pro/docs/',
  },
  {
    title: __('Highest Level', 'gameengine'),
    shortCode: '[gameengine_level]',
    subtitle: __(
      'The level roadmap, with the member\'s current position marked.',
      'gameengine'
    ),
    description: __(
      'Good in a profile sidebar or on a page that explains how levelling works.',
      'gameengine'
    ),
    attributes: [
      {
        name: 'user_id',
        default: __('current user', 'gameengine'),
        desc: __('Whose progress to show.', 'gameengine'),
      },
      {
        name: 'point_type_id',
        default: '0',
        desc: __('Limit to one currency. 0 shows every level, whatever its currency.', 'gameengine'),
      },
    ],
    example: '[gameengine_level point_type_id="2"]',
    url: 'https://gameengine.pro/docs/',
  },
  {
    title: __('Achievements List', 'gameengine'),
    shortCode: '[gameengine_achievements]',
    subtitle: __(
      'A grid of every achievement, earned and still locked.',
      'gameengine'
    ),
    description: __(
      'Shows badges, titles and the unlock hint for anything not yet earned. Renders nothing for logged-out visitors.',
      'gameengine'
    ),
    attributes: [],
    example: '[gameengine_achievements]',
    url: 'https://gameengine.pro/docs/',
  },
  {
    title: __('Leaderboard', 'gameengine'),
    shortCode: '[gameengine_leaderboard]',
    subtitle: __(
      'Ranks members by points earned, with their level and achievement count.',
      'gameengine'
    ),
    description: __(
      'Leave time_range off for an all-time board. Point it at a season to show that season\'s standings instead — live while the season runs, frozen once it completes.',
      'gameengine'
    ),
    attributes: [
      {
        name: 'count',
        default: '10',
        desc: __('How many members to list.', 'gameengine'),
      },
      {
        name: 'point_type',
        default: '0',
        desc: __('Limit to one currency. 0 totals every currency together.', 'gameengine'),
      },
      {
        name: 'time_range',
        default: 'all_time',
        desc: __('all_time, today, this_week, this_month, this_year or last_30_days.', 'gameengine'),
      },
      {
        name: 'season_id',
        default: '0',
        desc: __('Show a season\'s standings instead of the live board. Requires Pro.', 'gameengine'),
      },
    ],
    example: '[gameengine_leaderboard count="5" time_range="this_month"]',
    url: 'https://gameengine.pro/docs/',
  },
  {
    title: __('Profile Dashboard', 'gameengine'),
    shortCode: '[gameengine_profile]',
    subtitle: __(
      'The full member dashboard: points, level, achievements and streaks.',
      'gameengine'
    ),
    description: __(
      'One page where a member sees everything they have earned. Shows a prompt to log in for visitors.',
      'gameengine'
    ),
    attributes: [],
    example: '[gameengine_profile]',
    url: 'https://gameengine.pro/docs/',
  },
  {
    title: __('Progress Map', 'gameengine'),
    shortCode: '[gameengine_progress_map]',
    subtitle: __(
      'A visual path of the milestones a member has reached and what comes next.',
      'gameengine'
    ),
    description: __(
      'Turn the Progress Map add-on on first, or the shortcode says so instead of rendering.',
      'gameengine'
    ),
    requires: __('Progress Map add-on', 'gameengine'),
    attributes: [],
    example: '[gameengine_progress_map]',
    url: 'https://gameengine.pro/docs/',
  },
  {
    title: __('Restrict Content', 'gameengine'),
    shortCode: '[gameengine_restrict type="points" value="50"]',
    subtitle: __(
      'Hides whatever it wraps until the member qualifies.',
      'gameengine'
    ),
    description: __(
      'Wraps content, so it needs a closing tag. Anyone who does not qualify sees your message instead.',
      'gameengine'
    ),
    requires: __('Content Restriction add-on', 'gameengine'),
    attributes: [
      {
        name: 'type',
        default: 'points',
        desc: __('What to check: points, achievement or level.', 'gameengine'),
      },
      {
        name: 'value',
        default: '0',
        desc: __('The points needed, or the ID of the achievement or level.', 'gameengine'),
      },
      {
        name: 'message',
        default: __('none', 'gameengine'),
        desc: __('Shown to members who do not qualify yet.', 'gameengine'),
      },
    ],
    example:
      '[gameengine_restrict type="points" value="50" message="Earn 50 points to read this."]\n    Your members-only content\n[/gameengine_restrict]',
    url: 'https://gameengine.pro/docs/',
  },
  {
    title: __('Rewards Store', 'gameengine'),
    shortCode: '[gameengine_rewards]',
    subtitle: __(
      'Catalog of rewards members can redeem with their points.',
      'gameengine'
    ),
    description: __(
      "Shows each reward's cost, stock and a Redeem button. Takes no attributes — the catalog is managed under Rewards Store.",
      'gameengine'
    ),
    attributes: [],
    example: '[gameengine_rewards]',
    requires: __('Rewards Store add-on', 'gameengine'),
    url: 'https://gameengine.pro/docs/',
  },];

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
