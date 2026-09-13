import React from 'react';
import { __, sprintf } from '@wordpress/i18n';
import { FiZap, FiSliders, FiStar, FiAward, FiUsers } from 'react-icons/fi';
import { admin_url } from '@GFUtils/helper';

const screen = (query) => `${admin_url}admin.php?page=${query}`;

const steps = () => [
  {
    key: 'trigger',
    icon: FiZap,
    title: __('Something happens', 'gameengine'),
    text: __('A member publishes a post, leaves a comment, buys something or finishes a course.', 'gameengine'),
    links: [{ label: __('Available Hooks', 'gameengine'), href: screen('gameengine-tools&path=available-hooks') }],
  },
  {
    key: 'rule',
    icon: FiSliders,
    title: __('A rule reacts', 'gameengine'),
    text: __('Each point type has rules, called hooks, that decide which activity earns points and how many.', 'gameengine'),
    links: [{ label: __('Points System', 'gameengine'), href: screen('gameengine-points') }],
  },
  {
    key: 'points',
    icon: FiStar,
    title: __('Points add up', 'gameengine'),
    text: __('Every award is logged, so each member keeps a running balance for each point type.', 'gameengine'),
    links: [{ label: __('Logs', 'gameengine'), href: screen('gameengine-logs') }],
  },
  {
    key: 'rewards',
    icon: FiAward,
    title: __('Achievements and levels unlock', 'gameengine'),
    text: __('A member who reaches enough points, or meets an achievement’s own rules, unlocks it automatically.', 'gameengine'),
    links: [
      { label: __('Achievements', 'gameengine'), href: screen('gameengine-achievements') },
      { label: __('Levels', 'gameengine'), href: screen('gameengine-levels') },
    ],
  },
  {
    key: 'members',
    icon: FiUsers,
    title: __('Members see it', 'gameengine'),
    text: __('A page with a profile, leaderboard or rewards shortcode lets members follow their progress.', 'gameengine'),
    links: [{ label: __('Shortcodes', 'gameengine'), href: screen('gameengine-tools&path=shortcodes') }],
  },
];

/**
 * The chain every GameEngine setup follows, in order.
 *
 * Plain markup and bundled icons; nothing is loaded from elsewhere. `compact`
 * is the setup wizard's one-row version. The full version explains each step
 * and links to the screen that controls it.
 *
 * @param {Object}  props         Component props.
 * @param {boolean} props.compact Show the one-row version.
 */
const HowItWorks = ({ compact = false }) => {
  const items = steps();

  if (compact) {
    return (
      <ol className="list-none m-0 p-0 flex flex-wrap items-start justify-center gap-y-3" aria-label={__('How GameEngine works', 'gameengine')}>
        {items.map((item, index) => (
          <li key={item.key} className="flex items-start m-0">
            <span className="flex flex-col items-center gap-1.5 w-[92px] text-center">
              <span className="flex items-center justify-center w-9 h-9 rounded-full bg-[var(--gameengine-secondary-color)] text-[var(--gameengine-primary)]">
                <item.icon size={18} aria-hidden="true" />
              </span>
              <span className="text-xs leading-4 text-[var(--gameengine-font-color)]">{item.title}</span>
            </span>
            {index < items.length - 1 && (
              <span aria-hidden="true" className="mt-2 text-[var(--gameengine-warn-muted)]">→</span>
            )}
          </li>
        ))}
      </ol>
    );
  }

  return (
    <ol className="list-none m-0 p-0 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
      {items.map((item, index) => (
        <li key={item.key} className="flex flex-col gap-2 m-0 p-4 rounded border border-solid border-[var(--gameengine-border-color)]">
          <span className="flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--gameengine-secondary-color)] text-[var(--gameengine-primary)]">
              <item.icon size={16} aria-hidden="true" />
            </span>
            <span className="text-xs font-semibold text-[var(--gameengine-warn-muted)]">
              {sprintf(
                /* translators: %d: step number */
                __('Step %d', 'gameengine'),
                index + 1
              )}
            </span>
          </span>
          <h3 className="m-0 text-[15px] font-semibold text-[var(--gameengine-heading-color)]">{item.title}</h3>
          <p className="m-0 text-sm leading-6 text-[var(--gameengine-font-color)]">{item.text}</p>
          <span className="flex flex-wrap gap-3 mt-auto pt-1">
            {item.links.map((link) => (
              <a key={link.href} className="text-sm font-medium text-[var(--gameengine-primary)] no-underline hover:underline" href={link.href}>
                {link.label}
              </a>
            ))}
          </span>
        </li>
      ))}
    </ol>
  );
};

export default HowItWorks;
