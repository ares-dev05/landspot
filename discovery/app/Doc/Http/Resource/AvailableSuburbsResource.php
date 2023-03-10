<?php


namespace App\Doc\Http\Resource;


/**
 * @OA\Schema(
 *     title="AvailableSuburbsResource",
 *     description="Available Suburbs resource",
 *     @OA\Xml(
 *         name="AvailableSuburbsResource"
 *     )
 * )
 */
class AvailableSuburbsResource
{
    /**
     * @OA\Property(
     *     title="data",
     *     description="Data wrapper",
     * )
     * @var string[]
     */
    protected $data;
}