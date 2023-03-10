<?php


namespace App\Doc\Models;

/**
 * @OA\Schema(
 *     title="Estate",
 *     description="House Estate model",
 *     @OA\Xml(
 *         name="Estate"
 *     )
 * )
 */
class Estate
{
    /**
     * @OA\Property(
     *     title="ID",
     *     description="ID",
     *     format="int64",
     *     example=1
     * )
     *
     * @var integer
     */
    private $id;

    /**
     * @OA\Property(
     *      title="name",
     *      description="House estate name",
     *      example="Company estate name"
     * )
     *
     * @var string
     */
    private $name;

    /**
     * @OA\Property(
     *      title="suburb",
     *      description="House estate suburb",
     *      example="Melbourne"
     * )
     *
     * @var string
     */
    private $suburb;

    /**
     * @OA\Property(
     *      title="logo",
     *      description="House estate logo",
     *      example="https://picsum.photos/300/300"
     * )
     *
     * @var string
     */
    private $logo;

    /**
     * @OA\Property(
     *      title="small_image",
     *      description="House estate small_image",
     *      example="https://picsum.photos/600/600"
     * )
     *
     * @var string
     */
    private $small_image;

    /**
     * @OA\Property(
     *     property="geo_coords",
     *     type="array",
     *     collectionFormat="multi",
     *     @OA\Items(
     *         type="double",
     *         example=-37.833378
     *     )
     * )
     *
     * @var array
     */
    private $geo_coords;

    /**
     * @OA\Property(
     *     property="snapshots",
     *     type="array",
     *     @OA\Items(
     *         type="object",
     *         ref="#/components/schemas/Snapshot",
     *     )
     * )
     *
     * @var Snapshot
     */
    private $snapshots;

     /**
      * @OA\Property(
      *      title="lots_count",
      *      description="House lots count",
      *      example="1"
      * )
      *
      * @var integer
      */
    private $lots_count;

    /**
     * @OA\Property(
     *     property="lots",
     *     type="array",
     *     @OA\Items(
     *         type="object",
     *         ref="#/components/schemas/Lot",
     *     )
     * )
     *
     * @var Lot
     */
    private $lots;
}