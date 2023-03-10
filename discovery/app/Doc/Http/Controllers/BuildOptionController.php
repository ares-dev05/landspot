<?php

namespace App\Doc\Http\Controllers;

class BuildOptionController
{
    /**
     * @OA\Get (
     *      path="/api/v1/build-options",
     *      summary="Build Options List",
     *      description="Returns data about the house building options of the company to which the authorized user belongs. Within each house element are the facades and areas corresponding to the parameters of that house.",
     *      operationId="buildOptions",
     *      security={{ "bearer_token": {} }},
     *      tags={"Build Options"},
     *      @OA\Parameter(
     *          name="per_page",
     *          description="Number of entities per query",
     *          required=false,
     *          in="query",
     *          @OA\Schema(
     *              type="integer",
     *              example="1"
     *          )
     *      ),
     *      @OA\Parameter(
     *          name="beds",
     *          description="Number of bedrooms",
     *          required=false,
     *          in="query",
     *          @OA\Schema(
     *              type="integer",
     *              example="1"
     *          )
     *      ),
     *      @OA\Parameter(
     *          name="bathrooms",
     *          description="Number of bathrooms",
     *          required=false,
     *          in="query",
     *          @OA\Schema(
     *              type="number",
     *              example="1"
     *          )
     *      ),
     *      @OA\Parameter(
     *          name="storey",
     *          description="Amount of storey",
     *          required=false,
     *          in="query",
     *          @OA\Schema(
     *              type="string",
     *              enum={"single", "double"},
     *              example="single"
     *          ),
     *      ),
     *      @OA\Parameter(
     *          name="suburbs",
     *          description="An array of comma-separated suburbs  . See /api/v1/available-suburbs",
     *          required=false,
     *          in="query",
     *          @OA\Schema(
     *              type="string",
     *              example="melbourne,sydney"
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Unauthenticated",
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Success",
     *          @OA\JsonContent(ref="#/components/schemas/BuildOptionCollection")
     *      )
     * )
     */
    private $index;

    /**
     * @OA\Get (
     *      path="/api/v1/build-options/{id}",
     *      summary="Build Option",
     *      description="Returns data about the building options of a single house of the company to which the authorized user belongs. Within each house element are the facades and areas corresponding to the parameters of that house.",
     *      operationId="buildOptions",
     *      security={{ "bearer_token": {} }},
     *      tags={"Build Options"},
     *      @OA\Parameter(
     *          name="id",
     *          description="Build Option id",
     *          required=true,
     *          in="path",
     *          @OA\Schema(
     *              type="integer", default=1
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Unauthenticated",
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Success",
     *          @OA\JsonContent(ref="#/components/schemas/BuildOptionResource")
     *      )
     * )
     */
    private $show;

    /**
     * @OA\Get (
     *      path="/api/v1/available-suburbs",
     *      summary="Build Option Available Suburbs",
     *      description="Returns data about available suburbs",
     *      operationId="buildOptions",
     *      security={{ "bearer_token": {} }},
     *      tags={"Build Options"},
     *      @OA\Response(
     *          response=401,
     *          description="Unauthenticated",
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Success",
     *          @OA\JsonContent(ref="#/components/schemas/AvailableSuburbsResource")
     *      )
     * )
     */
    private $getAvailableSuburbs;
}