/**
 * BLOCK: Kadence Section
 */

/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';

function Save({ attributes }) {
	const {
		id,
		uniqueID,
		vsdesk,
		vstablet,
		vsmobile,
		link,
		linkNoFollow,
		linkSponsored,
		sticky,
		linkTarget,
		linkTitle,
		htmlTag,
		overlay,
		overlayImg,
		overlayHover,
		overlayImgHover,
		align,
		direction,
		overlayGradient,
		overlayGradientHover,
		rowGap,
	} = attributes;
	const deskDirection = direction && '' !== direction[0] ? direction[0] : false;
	const tabDirection = direction && '' !== direction[1] ? direction[1] : false;
	const mobileDirection = direction && '' !== direction[2] ? direction[2] : false;
	const deskHasRowGap = ![undefined, null, ''].includes(rowGap?.[0]);
	const tabHasRowGap = ![undefined, null, ''].includes(rowGap?.[1]);
	const mobileHasRowGap = ![undefined, null, ''].includes(rowGap?.[2]);
	const hasOverlay =
		overlay ||
		overlayGradient ||
		overlayGradientHover ||
		(overlayImg && overlayImg[0] && overlayImg[0].bgImg) ||
		overlayHover ||
		(overlayImgHover && overlayImgHover[0] && overlayImgHover[0].bgImg)
			? true
			: false;
	const classes = classnames({
		[`kadence-column${uniqueID}`]: uniqueID,
		'kvs-lg-false': vsdesk !== undefined && vsdesk,
		'kvs-md-false': vstablet !== undefined && vstablet,
		'kvs-sm-false': vsmobile !== undefined && vsmobile,
		'kb-section-has-link': undefined !== link && '' !== link,
		'kb-section-is-sticky': undefined !== sticky && sticky,
		'kb-section-has-overlay': undefined !== hasOverlay && hasOverlay,
		[`align${align}`]: align === 'full' || align === 'wide',
		[`kb-section-dir-${deskDirection}`]: deskDirection,
		[`kb-section-md-dir-${tabDirection}`]: tabDirection,
		[`kb-section-sm-dir-${mobileDirection}`]: mobileDirection,
		'kb-has-row-gap-lg': deskHasRowGap,
		'kb-has-row-gap-md': tabHasRowGap,
		'kb-has-row-gap-sm': mobileHasRowGap,
	});
	let relAttr;
	if (linkTarget) {
		relAttr = 'noopener noreferrer';
	}
	if (undefined !== linkNoFollow && true === linkNoFollow) {
		relAttr = relAttr ? relAttr.concat(' nofollow') : 'nofollow';
	}
	if (undefined !== linkSponsored && true === linkSponsored) {
		relAttr = relAttr ? relAttr.concat(' sponsored') : 'sponsored';
	}
	const HtmlTagOut = !htmlTag ? 'div' : htmlTag;
	return (
		<HtmlTagOut {...useBlockProps.save({ className: classes })}>
			<div className={'kt-inside-inner-col'}>
				<InnerBlocks.Content />
			</div>
			{link && (
				// eslint-disable-next-line jsx-a11y/anchor-has-content
				<a
					href={link}
					className={`kb-section-link-overlay`}
					target={linkTarget ? '_blank' : undefined}
					rel={relAttr ? relAttr : undefined}
					aria-label={linkTitle ? linkTitle : undefined}
				></a>
			)}
		</HtmlTagOut>
	);
}
export default Save;
