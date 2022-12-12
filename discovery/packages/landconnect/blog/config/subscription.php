<?php

return [

    'default' => env('SUBSCRIPTION_PROVIDER', 'mailchimp'),

    'providers' => [
        'mailchimp' => [
            /*
             * The API key of a MailChimp account. You can find yours at
             */
            'apiKey' => env('MAILCHIMP_API_KEY'),

            'ssl' => true,
        ],
    ],

];
