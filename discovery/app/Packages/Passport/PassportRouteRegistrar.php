<?php
namespace App\Packages\Passport;

class PassportRouteRegistrar extends \Laravel\Passport\RouteRegistrar
{
    public function all()
    {
//        $this->forAuthorization();
        $this->forAccessTokens();
//        $this->forTransientTokens();
//        $this->forClients();
//        $this->forPersonalAccessTokens();
    }
}