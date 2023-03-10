<?php


namespace App\Doc\Models;

/**
 * @OA\Schema(
 *     title="BuildOption",
 *     description="BuildOption model",
 *     @OA\Xml(
 *         name="BuildOption"
 *     )
 * )
 */
class BuildOption
{
    /**
     * @OA\Property(
     *     title="ID",
     *     description="ID",
     *     format="string",
     *     example="700_200"
     * )
     *
     * @var integer
     */
    private $id;

    /**
     * @OA\Property(
     *      title="House title",
     *      description="House title",
     *      example="Best House"
     * )
     *
     * @var string
     */
    private $title;

    /**
     * @OA\Property(
     *      title="Image",
     *      description="House image",
     *      example="https://picsum.photos/900/600"
     * )
     *
     * @var string
     */
    private $image;

    /**
     * @OA\Property(
     *     property="attrubutes",
     *     type="object",
     *     ref="#/components/schemas/Attribute"
     * )
     *
     * @var Attribute
     */
    private $attributes;

    /**
     * @OA\Property(
     *     property="estate",
     *     type="array",
     *     @OA\Items(
     *         type="object",
     *         ref="#/components/schemas/Estate",
     *     )
     * )
     *
     * @var Estate
     */
    private $estate;

    /**
     * @OA\Property(
     *     property="facades",
     *     type="array",
     *     @OA\Items(
     *         type="object",
     *         ref="#/components/schemas/Facade",
     *     )
     * )
     *
     * @var Facade
     */
    private $facades;
}