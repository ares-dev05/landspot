<?php

namespace Landconnect\Blog\Models\Subscription;

interface SubscriptionInterface
{
    /**
     * Check if user is in list.
     *
     * @param  string $email
     * @return boolean
     */
    public function hasMember(string $email);

    /**
     * Add user to the list.
     *
     * @param  string $email
     * @return array
     */
    public function subscribe(string $email);
}
