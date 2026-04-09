import React, { useEffect, useState } from 'react';
import Notice from '@GFComponents/Notice';
import { __ } from '@wordpress/i18n';
import { admin_url, is_pro } from '@GFUtils/helper';


const LicenseNotice = () => {
  const SeSdk = window.GameEngineGlobal?.SeSdk;
  const [licenseInactive, setLicenseInactive] = useState( true );
	// is_pro && SeSdk?.license?.status === 'inactive'

  useEffect( () => {
    const handleLicenseChange = ( e ) => {
      setLicenseInactive( is_pro && e.detail?.status === 'inactive' );
    };
    window.addEventListener( 'gameengine:license:changed', handleLicenseChange );
    return () => window.removeEventListener( 'gameengine:license:changed', handleLicenseChange );
  }, [] );

	if ( ! licenseInactive ) {
		return null;
	}

	const notice = {
		type: 'warning',
		message: __(
			'Activate your license to unlock updates, new features, and full GameEngine Pro access.',
			'gameengine'
		),
		has_buttons: true,
		button_text: __( 'Manage License', 'gameengine' ),
		button_action: admin_url + 'admin.php?page=gameengine-settings&settings=1&tab=license',
		dismissible: false,
		key: 'license-inactive',
	};

	return (
		<Notice
			notice={ notice }
			onDismiss={ () => setLicenseInactive( false ) }
		/>
	);
};

export default LicenseNotice;
