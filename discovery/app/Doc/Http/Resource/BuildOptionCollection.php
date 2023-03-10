<?php


namespace App\Doc\Http\Resource;

use App\Doc\Models\BuildOption;
use App\Doc\Models\BuildOptionPagination;

/**
 * @OA\Schema(
 *     title="BuildOptionCollection",
 *     description="Build Option resource",
 *     @OA\Xml(
 *         name="BuildOptionCollection"
 *     )
 * )
 */
class BuildOptionCollection
{
    /**
     * @OA\Property(
     *     property="data",
     *     type="array",
     *     @OA\Items(
     *         type="object",
     *         ref="#/components/schemas/BuildOption",
     *     )
     * )
     *
     * @var BuildOption
     */
    protected $data;

    /**
     * @OA\Property(
     *     property="pagination",
     *     type="object",
     *     ref="#/components/schemas/BuildOptionPagination"
     * )
     *
     * @var BuildOptionPagination
     */
    private $pagination;
}