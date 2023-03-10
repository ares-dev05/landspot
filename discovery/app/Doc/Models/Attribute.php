<?php


namespace App\Doc\Models;

/**
 * @OA\Schema(
 *     title="Attribute",
 *     description="House attribute model",
 *     @OA\Xml(
 *         name="Attribute"
 *     )
 * )
 */
class Attribute
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
     *      title="Beds",
     *      description="House beds",
     *      example="2"
     * )
     *
     * @var integer
     */
    private $beds;

    /**
     * @OA\Property(
     *      title="bathrooms",
     *      description="House bathrooms",
     *      example="2"
     * )
     *
     * @var integer
     */
    private $bathrooms;

    /**
     * @OA\Property(
     *      title="price",
     *      description="House price",
     *      example="300000"
     * )
     *
     * @var integer
     */
    private $price;

    /**
     * @OA\Property(
     *      title="width",
     *      description="House width",
     *      example="100"
     * )
     *
     * @var integer
     */
    private $width;

    /**
     * @OA\Property(
     *      title="depth",
     *      description="House depth",
     *      example="150"
     * )
     *
     * @var integer
     */
    private $depth;

    /**
     * @OA\Property(
     *      title="size",
     *      description="House size",
     *      example="400"
     * )
     *
     * @var integer
     */
    private $size;

    /**
     * @OA\Property(
     *      title="size_units",
     *      description="House size units",
     *      example="m2"
     * )
     *
     * @var string
     */
    private $size_units;

    /**
     * @OA\Property(
     *      title="story",
     *      description="House single or double storey",
     *      example="1"
     * )
     *
     * @var integer
     */
    private $story;

    /**
     * @OA\Property(
     *      title="cars",
     *      description="Number of cars in the house",
     *      example="2"
     * )
     *
     * @var integer
     */
    private $cars;

    /**
     * @OA\Property(
     *      title="description",
     *      description="House description",
     *      example="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus ornare ante odio, quis tristique dui posuere sed. Vestibulum non nibh in arcu dapibus laoreet vitae eget nisl."
     * )
     *
     * @var integer
     */
    private $description;
}