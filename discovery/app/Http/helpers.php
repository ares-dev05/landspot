<?php

use App\Models\{Builder,
    Company,
    Estate,
    EstateManager,
    File,
    GlobalAdmin,
    GlobalEstateManager,
    ImageFromPDF,
    LandDeveloper,
    Sitings\EngineeringPlan,
    Sitings\ReferencePlan,
    State,
    User
};
use Illuminate\Cache\CacheManager;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Mail;
use Illuminate\Mail\Message;
use Illuminate\Support\Arr;
use Illuminate\Container\Container;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Collection;

class UrlHelper
{
    /**
     * @param string $url
     * @return string URL
     */
    static function absoluteToRelativeUrl(string $url)
    {
        $host = request()->getHost();
        $urlData = parse_url($url);
        if ($urlData) {
            if (isset($urlData['host']) && $urlData['host'] === $host) {
                $url = $urlData['path'] ?? '/';
                if (isset($urlData['query'])) {
                    $url .= '?' . $urlData['query'];
                }
            }
        }
        return $url;
    }

    /**
     * @param string $url
     * @return string Host
     */
    static function getHostNameFromUrl(string $url)
    {
        $host = parse_url($url);

        return $host['host'];
    }

    static function currentRelativeUrl()
    {
        if (null !== $qs = request()->getQueryString()) {
            $qs = '?' . $qs;
        }

        return request()->getPathInfo() . $qs;
    }

    /**
     * @return string Relative previous
     */
    static function previousRelativeUrl()
    {
        $url = session()->previousUrl() ?? '/';
        if ($url) {
            return self::absoluteToRelativeUrl($url);
        }
    }

    /**
     * @param string $route
     * @return string
     */
    static function logoutUrl($route = 'logout')
    {
        $nonce = self::getLogoutNonce();
        return route($route, compact('nonce'), false);
    }

    static function getLogoutNonce()
    {
        return substr(md5(session()->getId() . ':' . config('app.key')), 16);
    }

    static function verifyLogoutNonce($nonce)
    {
        return $nonce === substr(md5(session()->getId() . ':' . config('app.key')), 16);
    }

    /**
     * @return string
     */
    static function absolutePathWithSlash(): string
    {
        return secure_url(request()->path()) . '/';
    }

    /**
     * @param string $path
     * @param array $params
     * @return string
     */
    static function secureRoutePath(string $path, array $params = []): string
    {
        return secure_url(route($path, $params, false)) . '/';
    }

    /**
     * @param string $path
     * @return string
     */
    static function securePath(string $path): string
    {
        return secure_url($path) . '/';
    }

    /**
     * @param int $steps
     * @return string
     */
    static function securePrevPath(int $steps = 1): string
    {
        return secure_url(self::previousRelativePath($steps)) . '/';
    }

    /**
     * @param int $steps
     * @return string
     */
    static function previousRelativePath(int $steps = 1): string
    {
        return implode('/', self::urlSegmentsSlice($steps));
    }

    /**
     * @param int $steps
     * @return array
     */
    static function urlSegmentsSlice(int $steps): array
    {
        return array_slice(request()->segments(), 0, count(request()->segments()) - $steps);
    }
}

class UserGuardHelper
{
    /**
     * Check auth guards
     * @param bool $firstMatch
     * @return Builder|EstateManager|GlobalAdmin|GlobalEstateManager|LandDeveloper|User|Authenticatable|null
     */
    static function checkAuthGuards($firstMatch = false)
    {
        $authGuards = array_keys(config('auth.guards'));
        foreach ($authGuards as $guard) {
            if (auth()->guard($guard)->check()) {
                if ($firstMatch) {
                    return auth()->guard($guard)->user();
                }
                auth()->shouldUse($guard);
            }
        }

        return auth()->user();
    }

}

class ExceptionHelper
{
    /**
     * @param Exception $exception
     * @throws Exception
     */
    static function processException(Exception $exception)
    {
        $line = Arr::get($exception->getTrace(), '0.line', '');
        $exceptionId = md5($exception->getMessage() . $exception->getFile() . $line);
        if (!self::existsLastException($exceptionId)) {
            self::storeNewException($exceptionId);

            UserGuardHelper::checkAuthGuards();
            $trace = Arr::get($exception->getTrace(), 0, []);
            $trace = [
                'file' => $trace['file'] ?? '',
                'line' => $line,
                'function' => $trace['function'] ?? '',
                'class' => $trace['class'] ?? '',
            ];

            $data = [
                'exception' => [
                    'url' => request()->fullUrl(),
                    'userId' => auth()->id(),
                    'message' => $exception->getMessage(),
                    'file' => $exception->getFile(),
                    'previous' => $exception->getPrevious(),
                    'trace' => $trace,
                    'userAgent' => request()->userAgent(),
                ]
            ];

            self::sendExceptionEmail($data);
        }
    }

    /**
     * @param array $exception
     * @throws Exception
     */
    static function processFrontendException(array $exception)
    {
        $line = $exception['line'] ?? '';
        $url = $exception['url'] ?? '';
        $message = $exception['message'] ?? '';
        $userAgent = $exception['userAgent'] ?? '';
        $exceptionId = md5($message . $line);

        if (!self::existsLastException($exceptionId)) {
            self::storeNewException($exceptionId);

            UserGuardHelper::checkAuthGuards();
            $userId = auth()->id();
            $source = $exception['source'] ?? '';
            $error = $exception['error'] ?? [];
            $column = $exception['column'] ?? '';

            $data = [
                'exception' => compact('url', 'userId', 'message', 'source', 'line', 'column', 'error', 'userAgent')
            ];

            self::sendExceptionEmail($data, 'Landspot frontend Exception');
        }
    }

    /**
     * Sending Exception to Admin
     * @param array $data
     * @param string $subject
     */
    protected static function sendExceptionEmail(array $data, $subject = 'Landspot backend Exception')
    {
        $developers = config('mail.support.developers');

        if ($developers) {
            Mail::send(
                'emails.exception',
                $data,
                function (Message $msg) use ($subject, $developers) {
                    $msg->from(config('mail.from.address'), config('mail.from.name'))
                        ->to(explode(';', $developers))
                        ->subject($subject);
                }
            );
        }
    }

    /**
     * @param string $exceptionId
     * @return CacheManager|mixed
     * @throws Exception
     */
    protected static function existsLastException($exceptionId)
    {
        return cache('exception:' . $exceptionId);
    }

    /**
     * @param string $exceptionId
     * @param int $duration Seconds
     * @throws Exception
     */
    protected static function storeNewException($exceptionId, $duration = 3600)
    {
        cache(['exception:' . $exceptionId => 1], $duration);
    }

    static function dumpException(...$args)
    {
        foreach ($args as $x) {
            (new Symfony\Component\VarDumper\VarDumper)->dump($x);
        }
    }
}

class SitingsOauthHelper
{
    static function createOAuthRedirect()
    {
        $query = http_build_query([
            'client_id' => config('sitings.OAUTH_CLIENT_ID'),
            'redirect_uri' => config('app.SITINGS_URL') . route('sitings-oauth-login-callback', [], false),
            'response_type' => 'code',
            'scope' => '',
            'brand' => 'sitings'
        ]);

        $url = config('app.OAUTH_PROVIDER_URL') . '/oauth/authorize?' . $query;

        return redirect($url);
    }
}

class EmailDisabledCheckHelper
{
    static function checkEmail(string $email): bool
    {
        if (Company::where('email', $email)->exists() || preg_match('/@sharklasers\.com$/i', $email)) {
            return false;
        }
        return true;
    }
}

class Breadcrumbs
{
    /**
     * @param string $segment
     * @param Estate $estate
     * @return string
     */
    static function publicEstateUrl(string $segment, Estate $estate): string
    {
        switch ($segment) {
            case $estate->slug:
                return UrlHelper::absolutePathWithSlash();
            case $estate->suburb_slug:
                return UrlHelper::securePrevPath(2) . $segment . '/';
            default:
                return UrlHelper::securePrevPath(2);
        }
    }

    /**
     * @param string $segment
     * @param Estate $estate
     * @param State $state
     * @return string
     */
    static function publicEstateName(string $segment, Estate $estate, State $state): string
    {
        switch ($segment) {
            case strtolower($estate->slug):
                return $estate->name;
            case strtolower($estate->suburb_slug):
                return $estate->suburb;
            case strtolower($state->abbrev):
                return $state->name;
            default:
                return 'Land Estates';
        }
    }
}

class FileHelper
{
    /**
     * @param string $path
     * @param string $folder
     * @param Model $model
     * @throws Exception
     */
    static function convertFile(string $path, string $folder, Model $model)
    {
        $pages = [];
        try {
            $tempFile = File::cloneFileToTempFolder($path);
            $name = basename($tempFile);
            $pageFiles = ImageFromPDF::storePagesToTempFolder($name, true);


            for ($i = 0; $i < count($pageFiles); $i++) {
                $page = $pageFiles[$i];

                $pages[] = [
                    'page' => $i + 1,
                    'thumb' => File::moveTemporaryFileToStorage(
                        $page['filename'],
                        $folder
                    ),
                    'width' => $page['size']['width'],
                    'height' => $page['size']['height']
                ];
            }

            if ($pages && ($model instanceof ReferencePlan || $model instanceof EngineeringPlan)) {
                $model->pages()->each(function ($page) {
                    $page->delete();
                });

                $model->pages()->createMany($pages);
            }
            File::deleteFile($tempFile);
        } catch (Exception $e) {
            foreach ($pages as $page) {
                File::deleteFile($page['thumb']);
            }
            throw $e;
        }
    }
}

class PaginationHelper
{
    /**
     * @param Collection $results
     * @param $showPerPage
     * @return LengthAwarePaginator
     */
    public static function paginate(Collection $results, $showPerPage): LengthAwarePaginator
    {
        $pageNumber = Paginator::resolveCurrentPage('page');

        $totalPageNumber = $results->count();

        return self::paginator(
            $results->forPage($pageNumber, $showPerPage)->values(),
            $totalPageNumber,
            $showPerPage,
            $pageNumber,
            [
                'path' => Paginator::resolveCurrentPath(),
                'pageName' => 'page',
            ]
        );

    }

    /**
     * Create a new length-aware paginator instance.
     *
     * @param Collection $items
     * @param int $total
     * @param int $perPage
     * @param int $currentPage
     * @param array $options
     * @return LengthAwarePaginator
     */
    protected static function paginator($items, $total, $perPage, $currentPage, $options): LengthAwarePaginator
    {
        return Container::getInstance()->makeWith(LengthAwarePaginator::class, compact(
            'items', 'total', 'perPage', 'currentPage', 'options'
        ));
    }
}

class MathHelper {
    /**
     * @param int $n
     * @param int $increment
     * @return int
     */
    static function roundUpToIncrement(int $n, int $increment = 1000): int
    {
        return (int)($increment * ceil($n / $increment));
    }

    /**
     * @param int $n
     * @param int $increment
     * @return int
     */
    static function roundDownToIncrement(int $n, int $increment = 1000): int
    {
        return (int)($increment * floor($n / $increment));
    }
}