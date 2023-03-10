<?php


namespace App\Doc\Http\Controllers;


class AuthorizationController
{
    /**
     *
     * @OA\Post(
     * path="/api/v1/auth/token",
     * summary="Sign in",
     * description="Login by email and password to get token",
     * operationId="authToken",
     * tags={"Auth"},
     * @OA\RequestBody(
     *    required=true,
     *    description="Pass user credentials",
     *    @OA\JsonContent(
     *       required={"email","password"},
     *       @OA\Property(property="email", type="string", format="email", example="user@gmail.com"),
     *       @OA\Property(property="password", type="string", format="password", example="PassWord12345")
     *    ),
     * ),
     * @OA\Response(
     *    response=422,
     *    description="Wrong credentials response",
     *    @OA\JsonContent(
     *       @OA\Property(property="message", type="string", example="Sorry, wrong email address or password. Please try again")
     *        )
     *     )
     * )
     */
    private $accessToken;
}