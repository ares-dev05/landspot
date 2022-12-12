<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Session\TokenMismatchException;
use Illuminate\Auth\AuthenticationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Illuminate\Validation\ValidationException;

class Handler extends ExceptionHandler
{
    /**
     * A list of the exception types that are not reported.
     *
     * @var array
     */
    protected $dontReport = [
        //
    ];

    /**
     * A list of the inputs that are never flashed for validation exceptions.
     *
     * @var array
     */
    protected $dontFlash = [
        'password',
        'password_confirmation',
    ];

    /**
     * Report or log an exception.
     *
     * This is a great spot to send exceptions to Sentry, Bugsnag, etc.
     *
     * @param  \Exception $exception
     * @return void
     * @throws Exception
     */
    public function report(Exception $exception)
    {
        parent::report($exception);
    }

    /**
     * Render an exception into an HTTP response.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  \Exception $exception
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function render($request, Exception $exception)
    {
        if ($exception instanceof ModelNotFoundException && ($request->ajax() || $request->expectsJson())) {
            $modelName = $exception->getModel();
            $modelName = last(explode('\\', $modelName));

            return response()->json([

                'errors' => [
                    'model' => [
                        $modelName . ' not found'
                    ]
                ]
            ], 404);
        }

        if ($exception instanceof NotFoundHttpException && ($request->ajax() || $request->expectsJson())) {
            return response()->json([
                'errors' => [
                    'route' => [
                        'Route not found'
                    ]
                ]
            ], 404);
        }

        if ($exception instanceof TokenMismatchException && !$request->isXmlHttpRequest()) {
            return redirect()
                ->to(session()->previousUrl() ?? '/')
                ->with('Invalid token');
        }

        $e = $this->prepareException($exception);

        if (
            !$this->isHttpException($e) &&
            !$e instanceof ValidationException &&
            !$e instanceof AuthenticationException
        ) {
            \ExceptionHelper::processException($exception);
        }

        return parent::render($request, $exception);
    }


    /**
     * Convert an authentication exception into a response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Illuminate\Auth\AuthenticationException  $exception
     * @return \Illuminate\Http\Response
     */
    protected function unauthenticated($request, AuthenticationException $exception)
    {
        $route = route('login', [], false);
        logger()->error('login unauthenticated');

        $oauthHost = parse_url(config('app.OAUTH_PROVIDER_URL'), PHP_URL_HOST);
        if (request()->getHost() == $oauthHost) {
            if ($request->expectsJson()) {
                return response()->json(['message' => $exception->getMessage()], 401);
            }
            $brand = object_get($request, 'brand', 'sitings');
            $route = route('brand.login', compact('brand'), false);
        }

        return $request->expectsJson()
            ? response()->json(['message' => $exception->getMessage()], 401)
            : redirect()->guest($route, 302, [], true);
    }
}
