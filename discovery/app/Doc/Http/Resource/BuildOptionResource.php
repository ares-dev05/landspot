<?php


namespace App\Doc\Http\Resource;

use App\Doc\Models\BuildOption;

/**
 * @OA\Schema(
 *     title="BuilderOptionResource",
 *     description="Build Option resource",
 *     @OA\Xml(
 *         name="BuildOptionResource"
 *     )
 * )
 */
class BuildOptionResource
{
    /**
     * @OA\Property(
     *     title="data",
     *     description="Data wrapper"
     * )
     *
     * @var BuildOption
     */
    protected $data;
}