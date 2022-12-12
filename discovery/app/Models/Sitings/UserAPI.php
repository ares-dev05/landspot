<?php
namespace App\Models\Sitings;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\{ClientException, RequestException};
use GuzzleHttp\Psr7\Response;
use Illuminate\Support\Facades\App;

/**
 * Class UserAPI
 * @method static get($endpoint, $options = [])
 * @method static post($endpoint, $options = [])
 * @method static put($endpoint, $options = [])
 * @method static patch($endpoint, $options = [])
 * @method static delete($endpoint, $options = [])
 */
class UserAPI
{
    protected static $token;

    /**
     * @param $method
     * @param $endpoint
     * @param $options
     * @return array
     * @throws \Exception
     */
    protected static function call($method, $endpoint, array $options = [])
    {
        $http = new Client([
            'timeout'         => 10,
            'connect_timeout' => 10
        ]);

        $token = static::$token;

        if (strpos($endpoint, 'lcapi-call') !== false) {
            $endpointURL = config('app.SITINGS_URL') . '/lcapi/call.php?' . $options['query'];
            unset($options['query']);
        } else {
            $options['headers'] = [
                'Authorization' => "Bearer $token",
                'Accept'        => 'application/json'
            ];
            $endpointURL = config('app.OAUTH_PROVIDER_URL') . '/api/' . $endpoint;
        }

        try {
            if (App::environment() === 'local') $options['verify'] = false;
            /** @var Response $response */
            $response = $http->{$method}($endpointURL, $options);
            $code        = $response->getStatusCode();
            $contentType = $response->getHeader('Content-Type');
            if ($contentType) $contentType = $contentType[0];

            if ($code !== 200 || !$contentType || strpos($contentType, 'application/octet-stream') === 0) {
                $data = $response->getBody();
                $xml  = $data->read($data->getSize());
                $xml  = base64_decode($xml);
                $xml  = gzuncompress($xml);

                return $xml;
            }

            if (strpos($contentType, 'application/xml') === 0) {
                return $response->getBody();
            }

            if (strpos($contentType, 'text/html') === 0) {
                return $response->getBody();
            }

            if ($code !== 200 || !$contentType || strpos($contentType, 'application/json') !== 0) {
                logger()->error(sprintf('Invalid response: HTTP_CODE=%s %s', $code, $contentType));
                throw new \Exception('Invalid response. Please try again later.');
            }

            $data = json_decode($response->getBody(), true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                logger()->error('Invalid response: ' . $response->getBody()->getContents());
                throw new \Exception('Invalid response. Please try again later.');
            }

            return $data;
        } catch (ClientException $e) {
            info("ClientException > $endpoint");
            logger()->error($e->getMessage());
            throw $e;
        } catch (RequestException $e) {
            info("RequestException > $endpoint");
            logger()->error($e->getMessage());
            throw $e;
        } catch (\Exception $e) {
            logger()->error($e->getMessage());
            throw $e;
        }
    }

    static function __callStatic($name, $args)
    {
        if (!static::$token) {
            if (auth()->user()) {
                static::$token = auth()->user()->access_token;
            } else {
                throw new \Exception('User required');
            }
        }

        if (!in_array($name, ['get', 'post', 'put', 'patch', 'delete'])) {
            throw new \Exception("Invalid method $name");
        }

        array_unshift($args, $name);

        return static::call(...$args);
    }

    static function setAccessToken($token)
    {
        static::$token = $token;
    }
}