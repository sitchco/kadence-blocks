import { applyFilters } from '@wordpress/hooks';

export const EDITABLE_BLOCK_ATTRIBUTES = applyFilters(
	'kadence.constants.blocks.navigation.components.menu-editor.editableBlockAttributes',
	[
		{
			name: 'core/paragraph',
			attributes: [
				{
					name: 'content',
					type: 'string',
				},
			],
		},
		{
			name: 'kadence/navigation-link',
			attributes: [
				{
					name: 'label',
					type: 'string',
				},
				{
					name: 'url',
					type: 'string',
				},
			],
		},
		{
			name: 'kadence/advancedheading',
			attributes: [
				{
					name: 'content',
					type: 'string',
				},
			],
		},
	]
);

export const PREVENT_BLOCK_DELETE = applyFilters(
	'kadence.constants.blocks.navigation.components.menu-editor.preventBlockDelete',
	['kadence/column', 'kadence/rowlayout']
);
