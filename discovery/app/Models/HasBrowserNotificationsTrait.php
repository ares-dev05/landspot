<?php

namespace App\Models;

/**
 * Trait HasBrowserNotificationsTrait
 */
trait HasBrowserNotificationsTrait
{
    /**
     * @param string $prefix
     * @return string
     */
    function getBrowserNotificationChannel($prefix = '')
    {
        $appKey = config('app.key');
        return $prefix . strtolower(class_basename($this)) . '-' . md5($appKey . ':' . $this->id);
    }
}