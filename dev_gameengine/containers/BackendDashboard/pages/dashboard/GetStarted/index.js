import React, { useEffect, useState } from 'react';
import { __, sprintf } from '@wordpress/i18n';
import { useDispatch } from 'react-redux';
import { FiCheck, FiX } from 'react-icons/fi';
import Button from '@GFComponents/Button';
import { API, namespace, admin_url } from '@GFUtils/helper';
import { getOnboardingSteps } from '@GFUtils/extend';
import { showNotification } from '@GFRedux/Slices/notificationSlice/notificationSlice';

const linkClass = 'text-sm font-medium text-[var(--gameengine-primary)] no-underline hover:underline';
const textClass = 'm-0 text-sm leading-6 text-[var(--gameengine-font-color)]';
const noteClass = 'm-0 text-xs leading-5 text-[var(--gameengine-warn-muted)]';

/**
 * "Get started" checklist at the top of the Dashboard.
 *
 * The server works out whether each step is done from the site's own data and
 * every action returns the fresh status, so nothing is tracked here. The card
 * stays until every step is done or the admin hides it; Tools → How it works
 * keeps the explanation available afterwards.
 */
const GetStarted = () => {
  const dispatch = useDispatch();
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState('');
  // Incomplete when the page loaded: finishing the last step then shows a
  // finished card instead of making it vanish mid-click.
  const [startedIncomplete, setStartedIncomplete] = useState(false);

  useEffect(() => {
    API.get(namespace + 'onboarding')
      .then((response) => {
        setStatus(response.data);
        setStartedIncomplete(!response.data?.complete);
      })
      // The card is extra; the Dashboard works without it.
      .catch(() => setStatus(null));
  }, []);

  const run = async (key, request, fallback) => {
    setBusy(key);
    try {
      const response = await request();
      setStatus(response.data?.status || response.data);
    } catch (error) {
      dispatch(showNotification({ type: 'error', isShow: true, message: error?.response?.data?.message || fallback }));
    } finally {
      setBusy('');
    }
  };

  if (!status || status.dismissed || (status.complete && !startedIncomplete)) {
    return null;
  }

  const byKey = Object.fromEntries((status.steps || []).map((step) => [step.key, step]));
  const rule = byKey.points_rule?.rule;
  const pointType = byKey.points_rule?.point_type;
  const result = byKey.see_it_work?.result;
  const page = byKey.members_page?.page;

  const steps = getOnboardingSteps([
    {
      key: 'points_rule',
      title: __('Set up points and a rule', 'gameengine'),
      done: !!byKey.points_rule?.done,
      render: () => {
        if (rule) {
          return (
            <p className={textClass}>
              {rule.points
                ? sprintf(
                  /* translators: 1: number of points, 2: point type name, 3: the trigger, e.g. "Publish Post" */
                  __('Members earn %1$s %2$s when this happens: %3$s.', 'gameengine'),
                  rule.points,
                  rule.point_type,
                  rule.trigger
                )
                : sprintf(
                  /* translators: 1: point type name, 2: the trigger, e.g. "Publish Post" */
                  __('Members earn %1$s when this happens: %2$s.', 'gameengine'),
                  rule.point_type,
                  rule.trigger
                )}
            </p>
          );
        }

        return (
          <>
            <p className={textClass}>
              {pointType
                ? sprintf(
                  /* translators: %s: point type name */
                  __('You have %s, but no rule awards it yet. Open it and add a hook under Automatic Point Awards.', 'gameengine'),
                  pointType.name
                )
                : __('Create a point type and a rule that awards it, or let the setup wizard create a starter set.', 'gameengine')}
            </p>
            <div className="flex flex-wrap gap-4">
              <a className={linkClass} href={admin_url + 'admin.php?page=gameengine-points'}>
                {__('Open Points System', 'gameengine')}
              </a>
              {!pointType && (
                <a className={linkClass} href={admin_url + 'admin.php?page=gameengine-setup'}>
                  {__('Run the setup wizard', 'gameengine')}
                </a>
              )}
            </div>
          </>
        );
      },
    },
    {
      key: 'see_it_work',
      title: __('See it work', 'gameengine'),
      done: !!byKey.see_it_work?.done,
      render: () => {
        if (result) {
          return (
            <>
              <p className={textClass}>
                {sprintf(
                  /* translators: 1: number of points, 2: point type name, 3: the new balance */
                  __('You got %1$s %2$s. Your balance is now %3$s.', 'gameengine'),
                  result.points,
                  result.point_type,
                  result.balance
                )}
              </p>
              {result.achievements?.length > 0 && (
                <p className={textClass}>
                  {sprintf(
                    /* translators: %s: achievement names, comma separated */
                    __('Unlocked: %s', 'gameengine'),
                    result.achievements.join(', ')
                  )}
                </p>
              )}
              {result.levels?.length > 0 && (
                <p className={textClass}>
                  {sprintf(
                    /* translators: %s: level names, comma separated */
                    __('Reached: %s', 'gameengine'),
                    result.levels.join(', ')
                  )}
                </p>
              )}
              {!result.achievements?.length && !result.levels?.length && (
                <p className={noteClass}>
                  {__('Nothing unlocked at this balance. Achievements and levels unlock once a member has enough points.', 'gameengine')}
                </p>
              )}
              <p className={noteClass}>
                {__('The award is in Logs like any other. Undo removes it and anything it unlocked.', 'gameengine')}
              </p>
              <div>
                <button
                  type="button"
                  className={`${linkClass} bg-transparent border-0 p-0 cursor-pointer`}
                  disabled={!!busy}
                  onClick={() => run('undo', () => API.delete(namespace + 'onboarding/test-points'), __('The test points could not be removed.', 'gameengine'))}
                >
                  {busy === 'undo' ? __('Removing…', 'gameengine') : __('Undo test points', 'gameengine')}
                </button>
              </div>
            </>
          );
        }

        return (
          <>
            <p className={textClass}>
              {__('Give yourself 10 test points. They take the same path as a real award, so you see exactly what a member would get.', 'gameengine')}
            </p>
            <p className={noteClass}>
              {pointType
                ? __('No emails are sent for the test, and you can undo it.', 'gameengine')
                : __('Create a point type first.', 'gameengine')}
            </p>
            <div>
              <Button
                label={__('Give me 10 test points', 'gameengine')}
                isLoading={busy === 'test'}
                isDisabled={!pointType || !!busy}
                onClick={() => run('test', () => API.post(namespace + 'onboarding/test-points'), __('The test points could not be added.', 'gameengine'))}
              />
            </div>
          </>
        );
      },
    },
    {
      key: 'members_page',
      title: __('Show it to your members', 'gameengine'),
      done: !!byKey.members_page?.done,
      render: () => {
        if (page && page.status === 'publish') {
          return (
            <>
              <p className={textClass}>
                {sprintf(
                  /* translators: %s: page title */
                  __('Members can follow their progress on “%s”.', 'gameengine'),
                  page.title
                )}
              </p>
              <div>
                <a className={linkClass} href={page.view_link} target="_blank" rel="noreferrer">
                  {__('View page', 'gameengine')}
                </a>
              </div>
            </>
          );
        }

        if (page) {
          return (
            <>
              <p className={textClass}>
                {sprintf(
                  /* translators: %s: page title */
                  __('Your draft “%s” is ready. Publish it when you are happy with it.', 'gameengine'),
                  page.title
                )}
              </p>
              <div className="flex flex-wrap gap-4">
                <a className={linkClass} href={page.edit_link}>
                  {__('Review and publish', 'gameengine')}
                </a>
                <a className={linkClass} href={page.view_link} target="_blank" rel="noreferrer">
                  {__('Preview', 'gameengine')}
                </a>
              </div>
            </>
          );
        }

        return (
          <>
            <p className={textClass}>
              {__('Nothing shows on your site until a page includes GameEngine. Create a draft “My Rewards” page with each member’s profile and a leaderboard.', 'gameengine')}
            </p>
            <p className={noteClass}>
              {__('It stays a draft until you publish it. Once published, the leaderboard shows members’ names to visitors.', 'gameengine')}
            </p>
            <div>
              <Button
                label={__('Create a Rewards page', 'gameengine')}
                isLoading={busy === 'page'}
                isDisabled={!!busy}
                onClick={() => run('page', () => API.post(namespace + 'onboarding/rewards-page'), __('The page could not be created.', 'gameengine'))}
              />
            </div>
          </>
        );
      },
    },
  ]);

  const doneCount = steps.filter((step) => step.done).length;
  const percent = steps.length ? Math.round((doneCount / steps.length) * 100) : 0;

  return (
    <section className="gameengine-surface p-6 flex flex-col gap-5" aria-labelledby="gameengine-get-started-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 id="gameengine-get-started-title" className="m-0 text-lg font-semibold text-[var(--gameengine-heading-color)]">
            {status.complete ? __('You’re all set', 'gameengine') : __('Get started with GameEngine', 'gameengine')}
          </h2>
          <p className={textClass}>
            {status.complete
              ? __('Points, a first award and a page for your members are all in place.', 'gameengine')
              : __('Three steps to see how GameEngine works on your own site.', 'gameengine')}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <a className={linkClass} href={admin_url + 'admin.php?page=gameengine-tools&path=how-it-works'}>
            {__('How GameEngine works', 'gameengine')}
          </a>
          <button
            type="button"
            className="flex items-center gap-1 bg-transparent border-0 p-0 cursor-pointer text-sm text-[var(--gameengine-warn-muted)] hover:text-[var(--gameengine-font-color)]"
            disabled={!!busy}
            onClick={() => run('hide', () => API.post(namespace + 'onboarding/dismiss', { dismissed: true }), __('The card could not be hidden.', 'gameengine'))}
          >
            <FiX aria-hidden="true" />
            {__('Hide', 'gameengine')}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div
          className="flex-1 h-2 rounded-full bg-[var(--gameengine-secondary-color)] overflow-hidden"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={steps.length}
          aria-valuenow={doneCount}
          aria-label={__('Get started progress', 'gameengine')}
        >
          <div className="h-full rounded-full bg-[var(--gameengine-primary)] transition-[width] duration-300" style={{ width: `${percent}%` }} />
        </div>
        <span className="text-xs text-[var(--gameengine-warn-muted)] whitespace-nowrap">
          {sprintf(
            /* translators: 1: steps done, 2: total steps */
            __('%1$d of %2$d done', 'gameengine'),
            doneCount,
            steps.length
          )}
        </span>
      </div>

      <ol className="list-none m-0 p-0 flex flex-col gap-3">
        {steps.map((step, index) => (
          <li key={step.key} className="flex gap-3 items-start m-0 p-4 rounded border border-solid border-[var(--gameengine-border-color)]">
            <span
              aria-hidden="true"
              className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold ${step.done ? 'bg-[var(--gameengine-success)] text-white' : 'bg-[var(--gameengine-secondary-color)] text-[var(--gameengine-font-color)]'}`}
            >
              {step.done ? <FiCheck /> : index + 1}
            </span>
            <div className="flex flex-col gap-2 min-w-0">
              <h3 className="m-0 text-[15px] font-semibold text-[var(--gameengine-heading-color)]">
                {step.title}
                <span className="screen-reader-text">
                  {step.done ? __('(done)', 'gameengine') : __('(not done yet)', 'gameengine')}
                </span>
              </h3>
              {typeof step.render === 'function' && step.render()}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
};

export default GetStarted;
