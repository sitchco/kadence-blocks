import { applyFilters } from '@wordpress/hooks';

export const DEFAULT_BLOCK = applyFilters('kadence.constants.blocks.navigation.defaultBlock', {
	name: 'kadence/navigation-link',
});

export const ALLOWED_BLOCKS = applyFilters('kadence.constants.blocks.navigation.allowedBlocks', [
	'kadence/navigation-link',
	'core/navigation-link',
	'core/search',
	'core/social-links',
	'core/page-list',
	'core/spacer',
	'core/home-link',
	'core/site-title',
	'core/site-logo',
	'core/navigation-submenu',
	'core/loginout',
	'core/buttons',
]);

export const PRIORITIZED_INSERTER_BLOCKS = applyFilters('kadence.constants.blocks.navigation.prioritizedInserterBlocks', [
	'kadence/navigation-link',
	// 'core/navigation-link/page',
	// 'core/navigation-link',
]);

// These parameters must be kept aligned with those in
// lib/compat/wordpress-6.3/navigation-block-preloading.php
// and
// edit-site/src/components/sidebar-navigation-screen-navigation-menus/constants.js
export const PRELOADED_NAVIGATION_MENUS_QUERY = applyFilters(
	'kadence.constants.blocks.navigation.preloadedNavigationMenusQuery',
	{
		per_page: 100,
		status: ['publish', 'draft'],
		order: 'desc',
		orderby: 'date',
	}
);

export const SELECT_NAVIGATION_MENUS_ARGS = applyFilters(
	'kadence.constants.blocks.navigation.selectNavigationMenusArgs',
	['postType', 'kadence_navigation', PRELOADED_NAVIGATION_MENUS_QUERY]
);
