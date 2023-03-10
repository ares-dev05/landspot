<?php


namespace App\Doc\Models;

/**
 * @OA\Schema(
 *     title="Lot",
 *     description="House lot model",
 *     @OA\Xml(
 *         name="House"
 *     )
 * )
 */
class Lot
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
     *      title="lot_number",
     *      description="House lot number",
     *      example="5*"
     * )
     *
     * @var string
     */
    private $lot_number;

    /**
     * @OA\Property(
     *      title="geo_coords",
     *      description="House lot geo coords",
     *      example="-33.8688197,151.2092955"
     * )
     *
     * @var string
     */
    private $geo_coords;

    /**
     * @OA\Property(
     *      title="frontage",
     *      description="House lot frontage",
     *      example="13.00"
     * )
     *
     * @var string
     */
    private $frontage;

    /**
     * @OA\Property(
     *      title="depth",
     *      description="House lot depth",
     *      example="32.00"
     * )
     *
     * @var string
     */
    private $depth;

    /**
     * @OA\Property(
     *      title="area",
     *      description="House lot area",
     *      example=300
     * )
     *
     * @var integer
     */
    private $area;

    /**
     * @OA\Property(
     *      title="status",
     *      description="House lot status",
     *      example="Available"
     * )
     *
     * @var string
     */
    private $status;

    /**
     * @OA\Property(
     *      title="price",
     *      description="House lot price",
     *      example=100000
     * )
     *
     * @var integer
     */
    private $price;

    /**
     * @OA\Property(
     *      title="title_date",
     *      description="House lot title date",
     *      example="Q1 2020"
     * )
     *
     * @var string
     */
    private $title_date;

    /**
     * @OA\Property(
     *      title="Image",
     *      description="Lot image",
     *      example="https://picsum.photos/900/600"
     * )
     *
     * @var string
     */
    private $image;
}