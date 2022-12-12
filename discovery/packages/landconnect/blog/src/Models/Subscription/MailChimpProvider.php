<?php

namespace Landconnect\Blog\Models\Subscription;

use DrewM\MailChimp\MailChimp;
use InvalidArgumentException;
use Illuminate\Support\Arr;

/**
 * Class Subscription
 */
class MailChimpProvider extends MailChimp implements SubscriptionInterface
{
    /** @var string $listId */
    protected $listId;

    /** @var string $subscribeUrl */
    protected $subscribeUrl;

    /**
     * Subscription constructor.
     * @param string $domain
     * @param array $config
     * @throws \Exception
     */
    function __construct($domain, $config)
    {
        parent::__construct($config['apiKey']);
        $this->verify_ssl = $config['ssl'];

        $this->setListId($domain);
    }

    /**
     * @param string $domain
     * @return MailChimpProvider
     * @throws \Exception
     */
    protected function setListId(string $domain)
    {
        $response = $this->get("lists");

        if ($response) {
            foreach ($response['lists'] as $list) {
                if ($list['name'] == $domain || $domain == str_replace("www." , '', $list['name'])) {
                    $this->listId = $list['id'];
                    $this->subscribeUrl = $list['subscribe_url_long'];
                    return $this;
                }
            }
        }

        /**
         * If it is necessary to create lists programmatically, comment out the Exception and uncomment the createList method
         */
        throw new InvalidArgumentException("Subscriber client not configured for this domain.");
//        $this->createList($domain);
    }

    /**
     * @param string $domain
     * @return $this
     */
    function createList($domain)
    {
        $resource = $this->getApiRootResource();

        $options = [
            'name'    => $domain,
            'contact' => $resource['contact'],
            "permission_reminder" => "You are receiving this e-mail because you signed up to our newsletter at {$domain}",
            "campaign_defaults"   => [
                "from_name"  => "Support",
                "from_email" => "support@" . str_replace("www." , '', $domain),
                "subject"    => "",
                "language"   => "en"
            ],
            "email_type_option" => true
        ];

        $response = $this->post("lists", $options);

        if (!isset($response['id'])) {
            throw new InvalidArgumentException(Arr::get($response, 'detail', 'You can not subscribe, please try again later.'));
        }

        $this->listId = $response['id'];
        return $this;
    }

    /**
     * @return array|false
     */
    protected function getApiRootResource()
    {
        $response = $this->get("/");

        if (!$this->lastActionSucceeded()) {
            throw new InvalidArgumentException(Arr::get($response, 'detail'));
        }

        return $response;
    }

    /**
     * @param string $email
     * @param array $mergeFields
     * @param array $options
     * @return array
     * @throws \Exception
     */
    function subscribe(string $email, array $mergeFields = [], array $options = [])
    {
        $options  = $this->getSubscriptionOptions($email, $mergeFields, $options);
        $response = $this->post("lists/{$this->listId}/members", $options);

        if (!$this->lastActionSucceeded()) {
            switch ($response['title']) {
                case 'Forgotten Email Not Subscribed':
                    return $this->reSubscribe($email);
            }

            throw new InvalidArgumentException(Arr::get($response, 'detail', 'You can not subscribe, please try again later.'));
        }

        return $response;
    }

    /**
     * @param string $email
     * @return array|null
     * @throws \Exception
     */
    function reSubscribe(string $email)
    {
        $ch           = curl_init();
        $subscribeUrl = str_replace('/subscribe', '/subscribe/post-json', $this->subscribeUrl);
        $query        = [
            'EMAIL'     => $email,
            'subscribe' => '',
        ];
        $subscribeUrl .= '&' . http_build_query($query);

        curl_setopt_array($ch, [
            CURLOPT_CONNECTTIMEOUT    => 10,
            CURLOPT_TIMEOUT           => 10,
            CURLOPT_HEADER            => 0,
            CURLOPT_CONNECTTIMEOUT_MS => 10000,
            CURLOPT_FOLLOWLOCATION    => true,
            CURLOPT_MAXREDIRS         => 3,
            CURLOPT_URL            => $subscribeUrl,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER     => ['Content-Type: application/json']
        ]);

        $responseContent = $this->callAPI($ch);
        curl_close($ch);

        if ($responseContent['error']) {
            throw new \Exception($responseContent['error_message'] ?? 'Could not sign user. Please try again later');
        }

        return $responseContent['result'];
    }

    /**
     * @param $ch
     * @return array
     */
    protected function callAPI($ch)
    {
        $encoded_response = curl_exec($ch);
        $errorCode        = curl_errno($ch);
        $result           = null;
        $error            = false;
        $error_message    = null;
        $error_code       = null;

        if ($errorCode == 0) {
            $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

            if ($httpcode != 200) {
                $error = true;
            }

            $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
            $isJson      = strpos($contentType, 'application/json') === 0;

            if ($isJson) {
                $result = json_decode($encoded_response, true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    $error         = true;
                    $error_message = 'Response error ' . $errorCode;
                    $error_code    = json_last_error();
                }
            } else {
                $error         = true;
                $error_message = 'Invalid response';
                $error_code    = -1;
            }
        } else {
            $error         = true;
            $error_message = 'Communication error ' . $errorCode . '(' . curl_error($ch) . ')';
            $error_code    = $errorCode;
        }

        return compact('result', 'error', 'error_code', 'error_message');
    }

    /**
     * @param string $email
     * @return bool
     */
    function hasMember(string $email)
    {
        $response = $this->get("lists/{$this->listId}/members/{$this->getSubscriberHash($email)}");

        if (!isset($response['email_address'])) {
            return false;
        }

        if (strtolower($response['email_address']) != strtolower($email)) {
            return false;
        }

        return true;
    }

    /**
     * @param string $email
     * @return array|bool|false
     */
    function unsubscribe(string $email)
    {
        $options = [
            'status' => 'unsubscribed',
        ];
        $response = $this->patch(
            "lists/{$this->listId}/members/{$this->getSubscriberHash($email)}",
            $options
        );

        if (!$this->lastActionSucceeded()) {
            return false;
        }

        return $response;
    }

    /**
     * @param string $email
     * @return array|false
     */
    function deleteSubscriber(string $email)
    {
        $response = $this->delete("lists/{$this->listId}/members/{$this->getSubscriberHash($email)}");
        return $response;
    }

    /**
     * @return bool
     */
    function lastActionSucceeded()
    {
        return $this->success();
    }

    /**
     * @param string $email
     * @return string
     */
    protected function getSubscriberHash(string $email)
    {
        return $this->subscriberHash($email);
    }

    /**
     * @param string $email
     * @param array $mergeFields
     * @param array $options
     * @return array
     */
    protected function getSubscriptionOptions(string $email, array $mergeFields, array $options)
    {
        $defaultOptions = [
            'email_address' => $email,
            'status'        => 'subscribed',
            'email_type'    => 'html',
        ];

        if (count($mergeFields)) {
            $defaultOptions['merge_fields'] = $mergeFields;
        }

        $options = array_merge($defaultOptions, $options);

        return $options;
    }
}
