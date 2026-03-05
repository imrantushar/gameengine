import GameEngineURLSearchParams from '@GFUtils/GameEngineURLSearchParams';
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Location Search Params hook.
 * @return {GameEngineURLSearchParams}
 */
export function useLocationQuery() {
	const { search } = useLocation();

	return useMemo(
		() => new GameEngineURLSearchParams( search ),
		[ search ]
	);
}