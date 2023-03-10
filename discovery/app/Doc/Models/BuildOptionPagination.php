<?php


namespace App\Doc\Models;

/**
 * @OA\Schema(
 *     title="Meta",
 *     description="Meta model",
 *     @OA\Xml(
 *         name="Meta"
 *     )
 * )
 */
class BuildOptionPagination
{
    /**
     * @OA\Property(
     *     title="current_page",
     *     description="Builder option current page",
     *     example=4
     * )
     *
     * @var integer
     */
    private $current_page;

    /**
     * @OA\Property(
     *     title="per_page",
     *     description="Builder option per page",
     *     example=60
     * )
     *
     * @var integer
     */
    private $per_page;

    /**
     * @OA\Property(
     *     title="total",
     *     description="Builder option total",
     *     example=20
     * )
     *
     * @var integer
     */
    private $total;

    /**
     * @OA\Property(
     *     title="total_pages",
     *     description="Builder option total pages",
     *     example=20
     * )
     *
     * @var integer
     */
    private $total_pages;
}