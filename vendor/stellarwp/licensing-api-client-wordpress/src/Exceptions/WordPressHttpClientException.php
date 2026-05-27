<?php declare(strict_types=1);

namespace LiquidWeb\LicensingApiClientWordPress\Exceptions;

use Psr\Http\Client\ClientExceptionInterface;
use RuntimeException;

/**
 * Represents a transport failure reported by WordPress HTTP APIs.
 */
final class WordPressHttpClientException extends RuntimeException implements ClientExceptionInterface
{
}
