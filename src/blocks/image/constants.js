import { applyFilters } from '@wordpress/hooks';

export const MIN_SIZE = applyFilters('kadence.constants.blocks.image.minSize', 20);
export const LINK_DESTINATION_NONE = applyFilters('kadence.constants.blocks.image.linkDestinationNone', 'none');
export const LINK_DESTINATION_MEDIA = applyFilters('kadence.constants.blocks.image.linkDestinationMedia', 'media');
export const LINK_DESTINATION_ATTACHMENT = applyFilters(
	'kadence.constants.blocks.image.linkDestinationAttachment',
	'attachment'
);
export const LINK_DESTINATION_CUSTOM = applyFilters('kadence.constants.blocks.image.linkDestinationCustom', 'custom');
export const NEW_TAB_REL = applyFilters('kadence.constants.blocks.image.newTabRel', ['noreferrer', 'noopener']);
export const ALLOWED_MEDIA_TYPES = applyFilters('kadence.constants.blocks.image.allowedMediaTypes', ['image']);
export const MEDIA_ID_NO_FEATURED_IMAGE_SET = applyFilters(
	'kadence.constants.blocks.image.mediaIdNoFeaturedImageSet',
	0
);
