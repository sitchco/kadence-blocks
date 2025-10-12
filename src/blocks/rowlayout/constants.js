/**
 * Internal block libraries
 */
import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';

export const BLEND_OPTIONS = applyFilters('kadence.constants.blocks.rowlayout.blendOptions', [
	{ value: 'normal', label: __('Normal', 'kadence-blocks') },
	{ value: 'multiply', label: __('Multiply', 'kadence-blocks') },
	{ value: 'screen', label: __('Screen', 'kadence-blocks') },
	{ value: 'overlay', label: __('Overlay', 'kadence-blocks') },
	{ value: 'darken', label: __('Darken', 'kadence-blocks') },
	{ value: 'lighten', label: __('Lighten', 'kadence-blocks') },
	{ value: 'color-dodge', label: __('Color Dodge', 'kadence-blocks') },
	{ value: 'color-burn', label: __('Color Burn', 'kadence-blocks') },
	{ value: 'difference', label: __('Difference', 'kadence-blocks') },
	{ value: 'exclusion', label: __('Exclusion', 'kadence-blocks') },
	{ value: 'hue', label: __('Hue', 'kadence-blocks') },
	{ value: 'saturation', label: __('Saturation', 'kadence-blocks') },
	{ value: 'color', label: __('Color', 'kadence-blocks') },
	{ value: 'luminosity', label: __('Luminosity', 'kadence-blocks') },
]);
export const SPACING_SIZES_MAP = applyFilters('kadence.constants.blocks.rowlayout.spacingSizesMap', [
	{
		value: '0',
		label: __('None', 'kadence-blocks'),
		size: 0,
		name: __('None', 'kadence-blocks'),
	},
	{
		value: 'xxs',
		output: 'var(--global-kb-spacing-xxs, 0.5rem)',
		size: 8,
		label: __('XXS', 'kadence-blocks'),
		name: __('2X Small', 'kadence-blocks'),
	},
	{
		value: 'xs',
		output: 'var(--global-kb-spacing-xs, 1rem)',
		size: 16,
		label: __('XS', 'kadence-blocks'),
		name: __('X Small', 'kadence-blocks'),
	},
	{
		value: 'sm',
		output: 'var(--global-kb-spacing-sm, 1.5rem)',
		size: 24,
		label: __('SM', 'kadence-blocks'),
		name: __('Small', 'kadence-blocks'),
	},
	{
		value: 'md',
		output: 'var(--global-kb-spacing-md, 2rem)',
		size: 32,
		label: __('MD', 'kadence-blocks'),
		name: __('Medium', 'kadence-blocks'),
	},
	{
		value: 'lg',
		output: 'var(--global-kb-spacing-lg, 3rem)',
		size: 48,
		label: __('LG', 'kadence-blocks'),
		name: __('Large', 'kadence-blocks'),
	},
	{
		value: 'xl',
		output: 'var(--global-kb-spacing-xl, 4rem)',
		size: 64,
		label: __('XL', 'kadence-blocks'),
		name: __('X Large', 'kadence-blocks'),
	},
	{
		value: 'xxl',
		output: 'var(--global-kb-spacing-xxl, 5rem)',
		size: 80,
		label: __('XXL', 'kadence-blocks'),
		name: __('2X Large', 'kadence-blocks'),
	},
	{
		value: '3xl',
		output: 'var(--global-kb-spacing-3xl, 6.5rem)',
		size: 104,
		label: __('3XL', 'kadence-blocks'),
		name: __('3X Large', 'kadence-blocks'),
	},
	{
		value: '4xl',
		output: 'var(--global-kb-spacing-4xl, 8rem)',
		size: 128,
		label: __('4XL', 'kadence-blocks'),
		name: __('4X Large', 'kadence-blocks'),
	},
	{
		value: '5xl',
		output: 'var(--global-kb-spacing-5xl, 10rem)',
		size: 160,
		label: __('5XL', 'kadence-blocks'),
		name: __('5X Large', 'kadence-blocks'),
	},
]);

//Mapping of column amounts and their colLayout values to what each column width should be.
export const COLUMN_WIDTH_MAP = applyFilters('kadence.constants.blocks.rowlayout.columnWidthMap', {
	1: {
		equal: [100],
	},
	2: {
		'left-golden': [66.67, 33.33],
		'right-golden': [33.33, 66.67],
		equal: [50, 50],
	},
	3: {
		'first-row': [100, 50, 50],
		'left-half': [50, 25, 25],
		'right-half': [25, 25, 50],
		'center-half': [25, 50, 25],
		'center-wide': [20, 60, 20],
		'center-exwide': [15, 70, 15],
		equal: [33.33, 33.33, 33.33],
	},
	4: {
		'left-forty': [40, 20, 20, 20],
		'right-forty': [20, 20, 20, 40],
		equal: [25, 25, 25, 25],
	},
	5: {
		equal: [20, 20, 20, 20, 20],
	},
	6: {
		equal: [16.66, 16.66, 16.66, 16.66, 16.66, 16.66],
	},
});

export const PADDING_RESIZE_MAP = applyFilters(
	'kadence.constants.blocks.rowlayout.paddingResizeMap',
	[0, 8, 16, 24, 32, 48, 64, 80, 104, 128, 160]
);
