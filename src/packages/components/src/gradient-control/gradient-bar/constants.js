import { applyFilters } from '@wordpress/hooks';

export const GRADIENT_MARKERS_WIDTH = applyFilters(
	'kadence.constants.packages.components.gradient-control.gradient-bar.gradientMarkersWidth',
	16
);
export const INSERT_POINT_WIDTH = applyFilters(
	'kadence.constants.packages.components.gradient-control.gradient-bar.insertPointWidth',
	16
);
export const MINIMUM_DISTANCE_BETWEEN_INSERTER_AND_POINT = applyFilters(
	'kadence.constants.packages.components.gradient-control.gradient-bar.minimumDistanceBetweenInserterAndPoint',
	10
);
export const MINIMUM_DISTANCE_BETWEEN_POINTS = applyFilters(
	'kadence.constants.packages.components.gradient-control.gradient-bar.minimumDistanceBetweenPoints',
	0
);
export const MINIMUM_SIGNIFICANT_MOVE = applyFilters(
	'kadence.constants.packages.components.gradient-control.gradient-bar.minimumSignificantMove',
	5
);

export const KEYBOARD_CONTROL_POINT_VARIATION = applyFilters(
	'kadence.constants.packages.components.gradient-control.gradient-bar.keyboardControlPointVariation',
	MINIMUM_DISTANCE_BETWEEN_INSERTER_AND_POINT
);
export const MINIMUM_DISTANCE_BETWEEN_INSERTER_AND_MARKER = applyFilters(
	'kadence.constants.packages.components.gradient-control.gradient-bar.minimumDistanceBetweenInserterAndMarker',
	(INSERT_POINT_WIDTH + GRADIENT_MARKERS_WIDTH) / 2
);
