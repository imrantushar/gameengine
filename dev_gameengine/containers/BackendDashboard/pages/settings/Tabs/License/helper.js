export const buildPurchaseUrl = ( base, SeSdk ) => {
	try {
		const url = new URL( base );
		url.searchParams.set( 'utm_source', 'gameengine-sdk' );
		url.searchParams.set( 'utm_medium', 'license-form' );
		url.searchParams.set( 'utm_campaign', 'license-activation-upsell' );
		url.searchParams.set( 'utm_content', 'purchase-link' );
		url.searchParams.set( 'utm_term', 'gameengine-pro' );
		url.searchParams.set( 'locale', SeSdk?.locale );
		url.searchParams.set( 'wordpress', SeSdk?.wordpress );
		url.searchParams.set( 'sdk_version', SeSdk?.version );
		url.searchParams.set( 'instance', SeSdk?.device_id );
		return url.toString();
	} catch {
		return base;
	}
};