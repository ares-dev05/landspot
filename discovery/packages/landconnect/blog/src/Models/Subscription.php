<?php

namespace Landconnect\Blog\Models;

use InvalidArgumentException;
use Landconnect\Blog\Models\Subscription\MailChimpProvider;
use Landconnect\Blog\Models\Subscription\SubscriptionInterface;
use Illuminate\Support\Arr;

/**
 * Class Subscription
 */
class Subscription
{

    /** @var Subscription */
    protected static $i;

    /** @var SubscriptionInterface */
    protected $provider;

    /**
     * Subscription constructor.
     * @throws \Exception
     */
    function __construct()
    {
        $domain   = Connection::i()->getDomain();
        $provider = $this->createProvider($domain);
        $this->setProvider($provider);
    }

    /**
     * @return Subscription
     */
    static function i()
    {
        if (!static::$i) {
            static::$i = new static();
        }

        return static::$i;
    }

    /**
     * @param string $domain
     * @return SubscriptionInterface
     */
    function createProvider($domain)
    {
        $defaultProvider = config('subscription.default');
        $providers       = config('subscription.providers');

        if (is_null($config = Arr::get($providers, $defaultProvider))) {
            throw new InvalidArgumentException("Subscription provider [$defaultProvider] not configured.");
        }

        switch ($defaultProvider) {
            case 'mailchimp':
                return new MailChimpProvider($domain, $config);
        }

        throw new InvalidArgumentException("Unsupported provider [{$defaultProvider}]");
    }

    /**
     * @param SubscriptionInterface $provider
     */
    function setProvider($provider)
    {
        $this->provider = $provider;
    }

    /**
     * @return SubscriptionInterface
     */
    function getProvider()
    {
        return $this->provider;
    }
}
