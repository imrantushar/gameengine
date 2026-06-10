import React, { Fragment, useCallback, useEffect, useState } from 'react';
import moment from 'moment';
import { __, sprintf } from '@wordpress/i18n';
import { plugin_root_url } from '@GFUtils/helper';
import Button from '@GFComponents/Button';
import { Spinner } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { useDispatch } from 'react-redux';
import { showNotification } from '@GFRedux/Slices/notificationSlice/notificationSlice';
import HireUs from './HireUs';
import { buildPurchaseUrl, getData, request, SeSdk } from './helper';

import './styles.scss';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function compareVersions(a, b) {
	const pa = String(a)
		.split('.')
		.map((n) => parseInt(n, 10) || 0);
	const pb = String(b)
		.split('.')
		.map((n) => parseInt(n, 10) || 0);
	const len = Math.max(pa.length, pb.length);
	for (let i = 0; i < len; i++) {
		const ai = pa[i] || 0;
		const bi = pb[i] || 0;
		if (ai !== bi) return ai < bi ? -1 : 1;
	}
	return 0;
}

function timeAgo(unix) {
	if (!unix) return __('never', 'gameengine');
	const seconds = Math.max(0, Math.floor(Date.now() / 1000 - unix));
	if (seconds < 60) return __('just now', 'gameengine');
	if (seconds < 3600)
		/* translators: %d: minutes */
		return sprintf(__('%d min ago', 'gameengine'), Math.floor(seconds / 60));
	if (seconds < 86400)
		/* translators: %d: hours */
		return sprintf(__('%d hr ago', 'gameengine'), Math.floor(seconds / 3600));
	/* translators: %d: days */
	return sprintf(__('%d days ago', 'gameengine'), Math.floor(seconds / 86400));
}

// ---------------------------------------------------------------------------
// Main License component
// ---------------------------------------------------------------------------

const License = () => {
	const dispatch = useDispatch();
	const [licenseKey, setLicenseKey] = useState('');
	const [licenseData, setLicenseData] = useState(SeSdk?.license);
	const [optInData, setOptInData] = useState(SeSdk?.optin);
	const [isActivating, setIsActivating] = useState(false);
	const [isDeactivating, setIsDeactivating] = useState(false);
	const [isOptinLoading, setIsOptinLoading] = useState(false);
	const [isCheckingStatus, setIsCheckingStatus] = useState(false);

	// State for the new update/version/rollback sections. All these come from
	// the SDK 1.5+ `/updates/*` and `/settings/*` endpoints exposed via
	// `init_restapi: true` on the SDK init.
	const [updateState, setUpdateState] = useState(null);
	const [versions, setVersions] = useState(null);
	const [versionsLoading, setVersionsLoading] = useState(false);
	const [versionsError, setVersionsError] = useState(null);
	const [isChecking, setIsChecking] = useState(false);
	const [isInstalling, setIsInstalling] = useState(false);
	const [installLog, setInstallLog] = useState([]);
	const [confirmingBreaking, setConfirmingBreaking] = useState(null);
	const [savingBeta, setSavingBeta] = useState(false);

	const isActive = licenseData?.status === 'active';
	const supportsNewEndpoints = !!SeSdk?.rest_url;

	// -----------------------------------------------------------------------
	// API helpers (existing license flow)
	// -----------------------------------------------------------------------

	const fetchStatus = useCallback(async () => {
		setIsCheckingStatus(true);
		try {
			const { data } = await getData('license/status', { force: true });
			setLicenseData(data);
		} catch (error) {
			const message =
				error?.response?.data?.message ||
				__('Failed to fetch license status.', 'gameengine');
			dispatch(
				showNotification({ message, isShow: true, type: 'error' })
			);
		} finally {
			setIsCheckingStatus(false);
		}
	}, [dispatch]);

	const handleActivate = async () => {
		if (!licenseKey.trim()) {
			dispatch(
				showNotification({
					message: __('Please enter a license key.', 'gameengine'),
					isShow: true,
					type: 'error',
				})
			);
			return;
		}
		setIsActivating(true);
		try {
			const {
				data: { license },
			} = await request('license/activate', {
				license: licenseKey.trim(),
			});
			setLicenseData(license);
			setLicenseKey('');
			window.dispatchEvent(
				new CustomEvent('gameengine:license:changed', {
					detail: { status: license?.status },
				})
			);
			dispatch(
				showNotification({
					message: __('License activated successfully.', 'gameengine'),
					isShow: true,
					type: 'success',
				})
			);
			// Status + versions now make sense to load.
			refreshUpdateData();
		} catch (error) {
			const message =
				error?.response?.data?.message ||
				__('Failed to activate license.', 'gameengine');
			dispatch(
				showNotification({ message, isShow: true, type: 'error' })
			);
		} finally {
			setIsActivating(false);
		}
	};

	const handleDeactivate = async () => {
		setIsDeactivating(true);
		try {
			const {
				data: { license },
			} = await request('license/deactivate', {});
			setLicenseData(license);
			window.dispatchEvent(
				new CustomEvent('gameengine:license:changed', {
					detail: { status: license?.status },
				})
			);
			dispatch(
				showNotification({
					message: __('License deactivated successfully.', 'gameengine'),
					isShow: true,
					type: 'success',
				})
			);
		} catch (error) {
			const message =
				error?.response?.data?.message ||
				__('Failed to deactivate license.', 'gameengine');
			dispatch(
				showNotification({ message, isShow: true, type: 'error' })
			);
		} finally {
			setIsDeactivating(false);
		}
	};

	const handleOptin = async (optin) => {
		setIsOptinLoading(true);
		try {
			const { data } = await request('insights/optin', {
				opt_in: optin,
			});
			setOptInData(data);
		} catch (error) {
			const message =
				error?.response?.data?.message ||
				__('Failed to update opt-in setting.', 'gameengine');
			dispatch(
				showNotification({ message, isShow: true, type: 'error' })
			);
		} finally {
			setIsOptinLoading(false);
		}
	};

	// -----------------------------------------------------------------------
	// New update / version / settings handlers (SDK 1.5+)
	// -----------------------------------------------------------------------

	const refreshUpdateState = useCallback(async () => {
		if (!supportsNewEndpoints) return;
		try {
			const { data } = await getData('updates/status');
			setUpdateState(data);
		} catch (error) {
			// silent — old SDK or transient failure; UI degrades gracefully
		}
	}, [supportsNewEndpoints]);

	const refreshVersions = useCallback(async () => {
		if (!supportsNewEndpoints) return;
		setVersionsLoading(true);
		setVersionsError(null);
		try {
			const { data } = await getData('updates/versions');
			setVersions(data?.versions || []);
		} catch (error) {
			setVersions([]);
			setVersionsError({
				code: error?.response?.data?.code,
				message:
					error?.response?.data?.message ||
					__('Failed to load version history.', 'gameengine'),
			});
		} finally {
			setVersionsLoading(false);
		}
	}, [supportsNewEndpoints]);

	const refreshUpdateData = useCallback(() => {
		refreshUpdateState();
		refreshVersions();
	}, [refreshUpdateState, refreshVersions]);

	useEffect(() => {
		if (isActive && supportsNewEndpoints) {
			refreshUpdateData();
		}
	}, [isActive, supportsNewEndpoints, refreshUpdateData]);

	const handleCheckNow = async () => {
		setIsChecking(true);
		try {
			const { data } = await request('updates/check-now', {});
			setUpdateState(data);
			dispatch(
				showNotification({
					message: data?.update_available
						? sprintf(
								/* translators: %s: latest version number */
								__('Update available: v%s', 'gameengine'),
								data.latest_version
							)
						: __("You're up to date.", 'gameengine'),
					isShow: true,
					type: 'success',
				})
			);
		} catch (error) {
			const message =
				error?.response?.data?.message ||
				__('Could not check for updates.', 'gameengine');
			dispatch(
				showNotification({ message, isShow: true, type: 'error' })
			);
		} finally {
			setIsChecking(false);
		}
	};

	const handleInstall = async (version) => {
		setIsInstalling(true);
		setInstallLog([
			{
				level: 'info',
				message: __('Starting…', 'gameengine'),
				time: Date.now() / 1000,
			},
		]);
		try {
			const { data } = await request(
				'updates/install',
				version ? { version } : {}
			);
			setInstallLog(data?.log || []);
			dispatch(
				showNotification({
					message: data?.is_rollback
						? sprintf(
								/* translators: %s: target version number */
								__('Rolled back to v%s', 'gameengine'),
								data.target_version
							)
						: sprintf(
								/* translators: %s: target version number */
								__('Installed v%s', 'gameengine'),
								data.target_version
							),
					isShow: true,
					type: 'success',
				})
			);
			// Plugin code on disk just changed; reload to pick up new code path.
			setTimeout(() => window.location.reload(), 1500);
		} catch (error) {
			const log = error?.response?.data?.data?.log;
			if (log) setInstallLog(log);
			const message =
				error?.response?.data?.message ||
				__('Install failed.', 'gameengine');
			dispatch(
				showNotification({ message, isShow: true, type: 'error' })
			);
			refreshUpdateState();
		} finally {
			setIsInstalling(false);
		}
	};

	const handleBeta = async (enabled) => {
		setSavingBeta(true);
		try {
			await request('settings/beta-channel', { enabled });
			setUpdateState((s) => ({ ...(s || {}), beta_enabled: enabled }));
			refreshUpdateState();
		} catch (error) {
			const message =
				error?.response?.data?.message ||
				__('Could not save beta setting.', 'gameengine');
			dispatch(
				showNotification({ message, isShow: true, type: 'error' })
			);
		} finally {
			setSavingBeta(false);
		}
	};

	// -----------------------------------------------------------------------
	// Render
	// -----------------------------------------------------------------------

	const updateAvailable = !!updateState?.update_available;
	const previousVersion = updateState?.previous_version;
	const autoUpdateOn = !!updateState?.auto_update_enabled;

	return (
		<>
			{isActive && supportsNewEndpoints && (
				<div className="gameengine-content-section--license-hero">
					<div className="gameengine-license-hero">
						<div className="gameengine-license-hero__versions">
							<div className="gameengine-license-hero__block">
								<span className="gameengine-license-hero__label">
									{__('Installed', 'gameengine')}
								</span>
								<span className="gameengine-license-hero__value">
									{updateState?.current_version || '—'}
								</span>
							</div>
							{updateAvailable && (
								<>
									<span
										className="gameengine-license-hero__arrow"
										aria-hidden="true"
									>
										→
									</span>
									<div className="gameengine-license-hero__block">
										<span className="gameengine-license-hero__label">
											{__('Latest', 'gameengine')}
										</span>
										<span className="gameengine-license-hero__value gameengine-license-hero__value--latest">
											{updateState?.latest_version || '—'}
										</span>
									</div>
								</>
							)}
						</div>
						<div className="gameengine-license-hero__actions">
							<span className="gameengine-license-hero__checked">
								{sprintf(
									/* translators: %s: human time diff (e.g. "5 min ago") */
									__('Checked %s', 'gameengine'),
									timeAgo(updateState?.last_checked_at)
								)}
							</span>
							<Button
								label={
									isChecking
										? __('Checking…', 'gameengine')
										: __('Check for updates', 'gameengine')
								}
								preset="purple"
								border="border"
								onClick={handleCheckNow}
								isDisabled={isChecking}
								size="sm"
							/>
						</div>
					</div>

					{updateAvailable && (
						<div className="gameengine-license-banner gameengine-license-banner--update">
							<div className="gameengine-license-banner__message">
								<div className="gameengine-license-banner__title">
									{sprintf(
										/* translators: %s: latest version number */
										__(
											'Version %s is available',
											'gameengine'
										),
										updateState?.latest_version
									)}
								</div>
								<p className="gameengine-license-banner__sub">
									{updateState?.changelog ||
										__(
											'Click update to install the latest release. Your settings and data stay intact.',
											'gameengine'
										)}
								</p>
							</div>
							<div className="gameengine-license-banner__actions">
								<Button
									label={
										isInstalling
											? __('Installing…', 'gameengine')
											: sprintf(
													/* translators: %s: target version number */
													__(
														'Update to %s',
														'gameengine'
													),
													updateState?.latest_version
												)
									}
									preset="purple"
									onClick={() => handleInstall(null)}
									isDisabled={isInstalling}
									size="sm"
								/>
							</div>
							{isInstalling && installLog.length > 0 && (
								<div className="gameengine-license-progress">
									<div className="gameengine-license-progress__bar">
										<div className="gameengine-license-progress__fill" />
									</div>
									<InstallLog messages={installLog} />
								</div>
							)}
						</div>
					)}

					{previousVersion && (
						<div className="gameengine-license-banner gameengine-license-banner--rollback">
							<div className="gameengine-license-banner__message">
								<div className="gameengine-license-banner__title">
									{sprintf(
										/* translators: %s: previously installed version number */
										__('Quick rollback to v%s', 'gameengine'),
										previousVersion
									)}
								</div>
								<p className="gameengine-license-banner__sub">
									{__(
										"If the latest update isn't working out, you can return to your previously installed version with one click.",
										'gameengine'
									)}
								</p>
							</div>
							<div className="gameengine-license-banner__actions">
								<Button
									label={sprintf(
										/* translators: %s: previously installed version number */
										__('Roll back to v%s', 'gameengine'),
										previousVersion
									)}
									preset="purple"
									border="border"
									onClick={() =>
										handleInstall(previousVersion)
									}
									isDisabled={isInstalling}
									size="sm"
								/>
							</div>
						</div>
					)}
				</div>
			)}

			<div className="gameengine-content-section--license">
				{isActive ? (
					<>
						<h2 className="gameengine-content-section--license__heading">
							{__('GameEngine Pro — License Active', 'gameengine')}
						</h2>

						<p className="gameengine-content-section--license__sub-title">
							{__(
								'You have access to automatic updates, priority support, and all pro tools.',
								'gameengine'
							)}
						</p>

						<div className="gameengine-mid-section-logo">
							<img
								src={plugin_root_url + '/assets/images/logo.svg'}
								alt="gameengine logo"
							/>
							<img
								src={
									plugin_root_url +
									'/assets/images/link-bind.svg'
								}
								alt="Link icon"
							/>
							<img
								src={
									plugin_root_url +
									'/assets/images/key-outlined.svg'
								}
								alt="Key icon"
							/>
						</div>

						<div className="gameengine-license-field">
							<input
								type="text"
								className="gameengine-input"
								value={licenseData?.license ?? ''}
								readOnly
							/>
							<Button
								label={__('Deactivate License', 'gameengine')}
								preset="red"
								onClick={handleDeactivate}
								isLoading={isDeactivating}
								loadingLabel={__('Deactivating…', 'gameengine')}
								size="sm"
							/>
							<Button
								label={__('Manage License', 'gameengine')}
								type="link"
								link="https://store.kodezen.com/dashboard/license-keys/"
								target="_blank"
								rel="noopener noreferrer"
								size="sm"
							/>
						</div>

						{/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
						<label className="gameengine-optin-checkbox">
							<input
								type="checkbox"
								checked={optInData?.allowed ?? false}
								onChange={(e) => handleOptin(e.target.checked)}
								disabled={isOptinLoading}
							/>
							<span>
								{__(
									'Allow usage tracking to help improve GameEngine Pro.',
									'gameengine'
								)}
							</span>
						</label>

						{supportsNewEndpoints && (
							/* eslint-disable-next-line jsx-a11y/label-has-associated-control */
							<label className="gameengine-optin-checkbox">
								<input
									type="checkbox"
									checked={!!updateState?.beta_enabled}
									onChange={(e) =>
										handleBeta(e.target.checked)
									}
									disabled={savingBeta}
								/>
								<span>
									{__(
										'Receive beta updates (includes pre-release versions).',
										'gameengine'
									)}
								</span>
							</label>
						)}

						<span className="gameengine-content-section--license__separator" />

						<div className="gameengine-license-meta">
							<div className="gameengine-license-meta__item">
								<span className="gameengine-license-meta__label">
									{__('Status:', 'gameengine')}
								</span>
								<span
									className={`gameengine-license-meta__value gameengine-license-meta__value--${licenseData?.status}`}
								>
									{isActive
										? __('Active', 'gameengine')
										: licenseData?.status}
								</span>
							</div>
							<div className="gameengine-license-meta__item">
								<span className="gameengine-license-meta__label">
									{__('Last Checked:', 'gameengine')}
								</span>
								<span className="gameengine-license-meta__value">
									{licenseData?.updated_at
										? moment
												.utc(licenseData.updated_at)
												.local()
												.format('YYYY-MM-DD HH:mm:ss')
										: __('Never', 'gameengine')}
									<button
										type="button"
										className="gameengine-license-refresh"
										onClick={fetchStatus}
										aria-label={__(
											'Refresh status',
											'gameengine'
										)}
									>
										{isCheckingStatus ? (
											<Spinner style={{ margin: 0 }} />
										) : (
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="14"
												height="14"
												viewBox="0 0 32 32"
												fill="currentColor"
												aria-hidden="true"
											>
												<path d="M16.031 6.825c5.532 0.002 10.016 4.487 10.016 10.020 0 5.534-4.486 10.020-10.020 10.020s-10.020-4.486-10.020-10.020c0-1.516 0.337-2.954 0.939-4.242l-0.026 0.062c0.048-0.113 0.075-0.244 0.075-0.381 0-0.553-0.449-1.002-1.002-1.002-0.387 0-0.723 0.22-0.89 0.542l-0.003 0.006c-0.692 1.472-1.096 3.197-1.096 5.016 0 6.64 5.383 12.023 12.023 12.023s12.023-5.383 12.023-12.023c0-6.64-5.382-12.022-12.021-12.023h-0v2.004zM16.031 9.763v-7.879c-0-0.277-0.224-0.501-0.501-0.501-0.122 0-0.234 0.044-0.321 0.117l0.001-0.001-4.729 3.94c-0.11 0.093-0.18 0.231-0.18 0.385s0.070 0.292 0.179 0.384l0.001 0.001 4.729 3.94c0.086 0.072 0.198 0.116 0.321 0.116 0.277 0 0.501-0.224 0.501-0.501v0z" />
											</svg>
										)}
									</button>
								</span>
							</div>
							<div className="gameengine-license-meta__item">
								<span className="gameengine-license-meta__label">
									{__('Expires:', 'gameengine')}
								</span>
								<span className="gameengine-license-meta__value">
									{licenseData?.expires
										? moment
												.utc(licenseData.expires)
												.local()
												.format('YYYY-MM-DD HH:mm')
										: __('N/A', 'gameengine')}
								</span>
							</div>
							<div className="gameengine-license-meta__item">
								<span className="gameengine-license-meta__label">
									{__('Activation Remaining:', 'gameengine')}
								</span>
								<span className="gameengine-license-meta__value">
									{licenseData?.unlimited
										? __('Unlimited', 'gameengine')
										: sprintf(
												/* translators: 1: remaining activations, 2: total limit */
												__(
													'%1$d out of %2$s',
													'gameengine'
												),
												licenseData?.remaining,
												licenseData?.limit
											)}
								</span>
							</div>
							<div className="gameengine-license-meta__item">
								<span className="gameengine-license-meta__label">
									{__('WP Auto-update:', 'gameengine')}
								</span>
								<span
									className={`gameengine-license-meta__value gameengine-license-meta__value--${autoUpdateOn ? 'active' : 'muted'}`}
									title={
										autoUpdateOn
											? __(
													'WordPress will auto-install updates for this plugin (toggled on the Plugins screen).',
													'gameengine'
												)
											: __(
													'Toggle auto-update from WordPress → Plugins.',
													'gameengine'
												)
									}
								>
									{autoUpdateOn
										? __('Enabled', 'gameengine')
										: __('Disabled', 'gameengine')}
								</span>
							</div>
						</div>
					</>
				) : (
					<>
						<h2 className="gameengine-content-section--license__heading">
							{__(
								'Activate GameEngine Pro for updates & support.',
								'gameengine'
							)}
						</h2>

						<h2 className="gameengine-content-section--license__sub-title">
							{__(
								'Activate GameEngine Pro to unlock automatic updates, priority support, and all tools to optimize your WordPress site.',
								'gameengine'
							)}
						</h2>

						<div className="gameengine-mid-section-logo">
							<img
								src={plugin_root_url + '/assets/images/logo.svg'}
								alt="gameengine logo"
							/>
							<img
								src={
									plugin_root_url +
									'/assets/images/link-bind.svg'
								}
								alt="Link icon"
							/>
							<img
								src={
									plugin_root_url +
									'/assets/images/key-outlined.svg'
								}
								alt="Key icon"
							/>
						</div>

						<div className="gameengine-license-field">
							<input
								type="text"
								className="gameengine-input"
								placeholder={__(
									'Enter your license key',
									'gameengine'
								)}
								value={licenseKey}
								onChange={(e) => setLicenseKey(e.target.value)}
							/>
							<Button
								label={__('Activate Licence', 'gameengine')}
								onClick={handleActivate}
								isLoading={isActivating}
								loadingLabel={__('Activating…', 'gameengine')}
								size="sm"
							/>
						</div>

						<p className="gameengine-content-section--license__purchase">
							{createInterpolateElement(
								__(
									"Don\'t have license key? <PurchaseButton/>",
									'gameengine'
								),
								{
									PurchaseButton: (
										<a
											href={buildPurchaseUrl(
												'https://gameengine.pro/'
											)}
											target="_blank"
											rel="noopener noreferrer"
										>
											{__('Purchase one here', 'gameengine')}
										</a>
									),
								}
							)}
						</p>
					</>
				)}
			</div>

			{isActive && supportsNewEndpoints && (
				<VersionsCard
					versions={versions}
					loading={versionsLoading}
					error={versionsError}
					installing={isInstalling}
					current={updateState?.current_version}
					onRefresh={refreshVersions}
					onInstall={handleInstall}
					confirming={confirmingBreaking}
					setConfirming={setConfirmingBreaking}
				/>
			)}

			<HireUs />
		</>
	);
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const InstallLog = ({ messages }) => {
	if (!messages || messages.length === 0) return null;
	return (
		<details className="gameengine-license-log">
			<summary>
				{sprintf(
					/* translators: %d: number of log entries */
					__('Install log (%d entries)', 'gameengine'),
					messages.length
				)}
			</summary>
			<ul>
				{messages.map((m, i) => (
					<li key={i} className={`gameengine-license-log--${m.level}`}>
						<span className="gameengine-license-log__level">
							{m.level}
						</span>
						<span>{m.message}</span>
					</li>
				))}
			</ul>
		</details>
	);
};

const VersionsCard = ({
	versions,
	loading,
	error,
	installing,
	current,
	onRefresh,
	onInstall,
	confirming,
	setConfirming,
}) => {
	const header = (
		<div className="gameengine-license-versions__header">
			<div>
				<h3 className="gameengine-license-versions__title">
					{__('Version history', 'gameengine')}
				</h3>
				<p className="gameengine-license-versions__subtitle">
					{__(
						'Install or roll back to any released version of this plugin.',
						'gameengine'
					)}
				</p>
			</div>
			<Button
				label={
					loading
						? __('Refreshing…', 'gameengine')
						: __('Refresh', 'gameengine')
				}
				preset="purple"
				border="border"
				onClick={onRefresh}
				isDisabled={loading || installing}
				size="sm"
			/>
		</div>
	);

	const wrap = (inner) => (
		<div className="gameengine-license-versions">
			{header}
			<div className="gameengine-license-versions__body">{inner}</div>
		</div>
	);

	if (loading && (!versions || versions.length === 0)) {
		return wrap(
			<p className="gameengine-license-versions__empty">
				{__('Loading version history…', 'gameengine')}
			</p>
		);
	}

	if (!versions || versions.length === 0) {
		if (error?.code === 'sdk-server-version-list-unsupported') {
			return wrap(
				<div className="gameengine-license-versions__empty gameengine-license-versions__empty--soft">
					<p>
						<strong>
							{__(
								"The license server doesn't support version history yet.",
								'gameengine'
							)}
						</strong>
					</p>
					<p>{error.message}</p>
				</div>
			);
		}
		if (error) {
			return wrap(
				<div className="gameengine-license-versions__empty gameengine-license-versions__empty--soft">
					<p>
						<strong>
							{__('Could not load version history.', 'gameengine')}
						</strong>
					</p>
					<p>{error.message}</p>
				</div>
			);
		}
		return wrap(
			<div className="gameengine-license-versions__empty">
				<p>
					<strong>
						{__(
							'No versions are available to install or roll back to yet.',
							'gameengine'
						)}
					</strong>
				</p>
				<p>
					{__(
						"Once the vendor publishes additional released versions, they'll appear here with Install and Roll back buttons.",
						'gameengine'
					)}
				</p>
			</div>
		);
	}

	const onlyCurrent = versions.length === 1 && versions[0].is_current;

	return (
		<div className="gameengine-license-versions">
			{header}
			{onlyCurrent && (
				<div className="gameengine-license-versions__body">
					<div className="gameengine-license-versions__empty gameengine-license-versions__empty--soft">
						<p>
							{__(
								"You're on the only released version. Roll back will become available once an earlier release is published.",
								'gameengine'
							)}
						</p>
					</div>
				</div>
			)}
			<table className="gameengine-license-versions__table">
				<thead>
					<tr>
						<th>{__('Version', 'gameengine')}</th>
						<th>{__('Status', 'gameengine')}</th>
						<th>{__('Released', 'gameengine')}</th>
						<th className="gameengine-license-versions__col-actions"></th>
					</tr>
				</thead>
				<tbody>
					{versions.map((v) => (
						<Fragment key={v.id}>
							<tr>
								<td>
									<code>{v.version}</code>
									{v.is_current && (
										<span className="gameengine-license-pill gameengine-license-pill--current">
											{__('current', 'gameengine')}
										</span>
									)}
								</td>
								<td>
									<span
										className={`gameengine-license-pill gameengine-license-pill--${v.status}`}
									>
										{v.status}
									</span>
								</td>
								<td>{v.deployed_at || '—'}</td>
								<td className="gameengine-license-versions__col-actions">
									<VersionAction
										version={v}
										current={current}
										installing={installing}
										onInstall={onInstall}
										setConfirming={setConfirming}
									/>
								</td>
							</tr>
							{confirming && confirming.id === v.id && (
								<tr className="gameengine-license-versions__confirm-row">
									<td colSpan={4}>
										<div className="gameengine-license-versions__confirm">
											<strong>
												{__(
													'⚠ Breaking changes',
													'gameengine'
												)}
											</strong>
											<p>{confirming.breaking_changes}</p>
											<div className="gameengine-license-versions__confirm-actions">
												<Button
													label={__(
														'I understand, continue',
														'gameengine'
													)}
													preset="purple"
													size="sm"
													onClick={() => {
														const version =
															confirming.version;
														setConfirming(null);
														onInstall(version);
													}}
												/>
												<Button
													label={__(
														'Cancel',
														'gameengine'
													)}
													preset="purple"
													border="border"
													size="sm"
													onClick={() =>
														setConfirming(null)
													}
												/>
											</div>
										</div>
									</td>
								</tr>
							)}
						</Fragment>
					))}
				</tbody>
			</table>
		</div>
	);
};

const VersionAction = ({
	version,
	current,
	installing,
	onInstall,
	setConfirming,
}) => {
	if (version.is_current) {
		return (
			<span className="gameengine-license-versions__hint">
				{__('Installed', 'gameengine')}
			</span>
		);
	}

	const isDowngrade =
		current && compareVersions(version.version, current) < 0;

	if (!version.allow_rollback && isDowngrade) {
		return (
			<span
				className="gameengine-license-versions__hint gameengine-license-versions__hint--warn"
				title={__(
					'Vendor disabled rollback to this version.',
					'gameengine'
				)}
			>
				{__('Rollback blocked', 'gameengine')}
			</span>
		);
	}

	return (
		<Button
			label={
				isDowngrade
					? __('Roll back', 'gameengine')
					: __('Install', 'gameengine')
			}
			preset="purple"
			border="border"
			size="sm"
			onClick={() => {
				if (version.breaking_changes) {
					setConfirming(version);
				} else {
					onInstall(version.version);
				}
			}}
			isDisabled={installing}
		/>
	);
};

export default License;
