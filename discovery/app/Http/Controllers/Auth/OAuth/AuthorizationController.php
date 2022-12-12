<?php

namespace App\Http\Controllers\Auth\OAuth;

use App\Http\Controllers\Auth\TwoFactorAuthorizationTrait;
use App\Http\Controllers\Auth\UserGuardTrait;
use App\Models\Company;
use App\Models\LotmixStateSettings;
use App\Models\User;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Auth\AuthenticatesUsers;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;
use Laravel\Passport\TokenRepository;
use Laravel\Passport\ClientRepository;
use Psr\Http\Message\ServerRequestInterface;
use Laravel\Passport\Http\Controllers\AuthorizationController as OauthAuthorizationController;

class AuthorizationController extends OauthAuthorizationController
{
    use BrandThemeTrait, AuthenticatesUsers, ValidatesRequests, TwoFactorAuthorizationTrait, UserGuardTrait;

    function getAuthorize(ServerRequestInterface $psrRequest,
                          Request $request,
                          ClientRepository $clients,
                          TokenRepository $tokens)
    {
        if (!auth()->user()) {
            $brand = object_get($request, 'brand', 'sitings');
            $theme = $this->getBrandColors($brand);
            $navUrl = $this->getBrandBasePath($brand);
            $formActionUrl = $request->getRequestUri();
            session([
                'intendedUrl' => $formActionUrl,
                'brand' => $brand
            ]);

            return view('auth.oauth.login-sso-2fa', compact('brand', 'theme', 'navUrl', 'formActionUrl'));
        }

        return $this->_sendResponse($psrRequest, $request, $clients, $tokens);
    }

    /**
     * Authorize a client to access the user's account.
     *
     * @param \Psr\Http\Message\ServerRequestInterface $psrRequest
     * @param \Illuminate\Http\Request $request
     * @param \Laravel\Passport\ClientRepository $clients
     * @param \Laravel\Passport\TokenRepository $tokens
     * @return \Illuminate\Http\Response|array
     * @throws \Illuminate\Validation\ValidationException|\Exception
     */
    public function postAuthorize(ServerRequestInterface $psrRequest,
                                  Request $request,
                                  ClientRepository $clients,
                                  TokenRepository $tokens)
    {
        $result = $this->validate2FALogin($request, true);
        if ($result) {
            return $result;
        }
        $brand = session()->get('brand', 'sitings');

        if ($brand != 'landspot' && $brand != 'sitings') {
            try {
                $user = User::findByEmail($request->get($this->username()));
                $company = Company
                    ::where(function ($b) use ($brand) {
                        $b->byBuilderId($brand);
                    })
                    ->orWhere(function ($b) use ($brand) {
                        $b->byDomainLike($brand);
                    })
                    ->limit(1)
                    ->first();

                if ($company && $user->company_id != $company->id) {
                    throw ValidationException::withMessages([
                        $this->username() => ['User not found in this company'],
                    ]);
                }

            } catch (ModelNotFoundException $e) {

            }
        }

        return $this->_sendResponse($psrRequest, $request, $clients, $tokens);
    }

    protected function _sendResponse($psrRequest, $request, $clients, $tokens)
    {
        return $this->withErrorHandling(function () use ($psrRequest, $request, $clients, $tokens) {
            $authRequest = $this->server->validateAuthorizationRequest($psrRequest);

            $scopes = $this->parseScopes($authRequest);

            $user = auth()->user();

            $token = $tokens->findValidToken(
                $user,
                $client = $clients->find($authRequest->getClient()->getIdentifier())
            );

            $trusted_client = (boolean)$client->trusted;

            if (($token && $token->scopes === collect($scopes)->pluck('id')->all()) || $trusted_client) {
                $response = $this->approveRequest($authRequest, $user);

                return $this->sendLoginResponse($response);
            }

            $log_info = [
                'trusted_client' => $trusted_client,
                'client' => $client,
            ];

            logger()->info('Oauth Authorize client login ...', $log_info);

            $request->session()->put('authRequest', $authRequest);

            return $this->response->view('passport::authorize', [
                'client' => $client,
                'user' => $user,
                'scopes' => $scopes,
                'request' => $request,
            ]);
        });
    }

    protected function sendLoginResponse(Response $response)
    {
        if (!request()->expectsJson()) {
            return $response;
        }

        $location = '';
        if ($response->isRedirection()) {
            $location = $response->headers->get('Location');
        }

        if (!$location) return $response;
        $this->clearLoginAttempts(\request());

        $brand = session()->get('brand', 'sitings');
        $landconnectHost = parse_url(config('app.FOOTPRINTS_URL'), PHP_URL_HOST);
        $locationHost = parse_url($location, PHP_URL_HOST);
        /** @var User $user */
        $user = auth()->user();

        //  && $landconnectHost == $locationHost
        if ($brand != 'sitings') {
            // Estates access is enabled company-wide. It might still be disabled on a state level.
            if ($user->can('estates-access-company')) {

                // If estates is disabled for the current state, redirect to sitings
                if ($user->state->getEstatesDisabled($user->company) === LotmixStateSettings::ESTATES_ACCESS_ENABLED) {
                    $location = config('app.url') . auth()->user()->getBaseRoute();
                }   elseif ($user->state->getSitingAccess($user->company) == 1) {
                    $location = config('app.SITINGS_URL') . route('reference-plan', [], false);
                }   else {
                    $location = config('app.FOOTPRINTS_URL');
                }
            }
        }

        return [
            'REDIRECT_URL' => $location
        ];
    }
}
