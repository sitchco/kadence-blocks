import { applyFilters } from '@wordpress/hooks';

export const DESKTOP_SECTION_NAMES = applyFilters(
	'kadence.constants.blocks.header.components.visual-builder.desktopSectionNames',
	['left', 'center-left', 'center', 'center-right', 'right']
);

export const DESKTOP_BLOCK_POSITIONS = applyFilters(
	'kadence.constants.blocks.header.components.visual-builder.desktopBlockPositions',
	[
		['innerBlocks', 0, 'innerBlocks', 0, 'innerBlocks'],
		['innerBlocks', 0, 'innerBlocks', 1, 'innerBlocks'],
		['innerBlocks', 1, 'innerBlocks'],
		['innerBlocks', 2, 'innerBlocks', 0, 'innerBlocks'],
		['innerBlocks', 2, 'innerBlocks', 1, 'innerBlocks'],
	]
);

export const DESKTOP_CLIENT_ID_POSITIONS = applyFilters(
	'kadence.constants.blocks.header.components.visual-builder.desktopClientIdPositions',
	[
		['innerBlocks', 0, 'innerBlocks', 0, 'clientId'],
		['innerBlocks', 0, 'innerBlocks', 1, 'clientId'],
		['innerBlocks', 1, 'clientId'],
		['innerBlocks', 2, 'innerBlocks', 0, 'clientId'],
		['innerBlocks', 2, 'innerBlocks', 1, 'clientId'],
	]
);

export const ROW_TO_KEY = applyFilters('kadence.constants.blocks.header.components.visual-builder.rowToKey', {
	top: 0,
	middle: 1,
	bottom: 2,
});
