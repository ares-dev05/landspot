<?php


namespace App\Doc\Http\Controllers;

/**
 * @OA\Info(
 *      version="1.0.0",
 *      title="Landspot Api Documentation",
 *      description="Here are the endpoints you can interact with",
 *      @OA\Contact(
 *          email=LOTMIX_FROM_ADDRESS
 *      ),
 *      @OA\License(
 *          name="Nginx",
 *          url="http://nginx.org/LICENSE"
 *      )
 * )
 *
 * @OA\Server(
 *      url=LOTMIX_URL,
 *      description="Lotmix API server"
 * )
 *
 * @OA\SecurityScheme(
 *     type="http",
 *     description="Login with email and password to get the authentication token",
 *     name="Token based baerer",
 *     in="header",
 *     scheme="bearer",
 *     bearerFormat="Laravel Passport",
 *     securityScheme="bearer_token",
 * )
 */
class Controller
{

}