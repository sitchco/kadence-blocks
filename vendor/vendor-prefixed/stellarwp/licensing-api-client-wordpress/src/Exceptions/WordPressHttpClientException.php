<?php
/**
 * @license GPL-2.0-or-later
 *
 * Modified using {@see https://github.com/BrianHenryIE/strauss}.
 */ declare(strict_types=1);

namespace KadenceWP\KadenceBlocks\LiquidWeb\LicensingApiClientWordPress\Exceptions;

use KadenceWP\KadenceBlocks\Psr\Http\Client\ClientExceptionInterface;
use RuntimeException;

/**
 * Represents a transport failure reported by WordPress HTTP APIs.
 */
final class WordPressHttpClientException extends RuntimeException implements ClientExceptionInterface
{
}
