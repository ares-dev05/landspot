<?php


namespace App\Doc\Models;

/**
 * @OA\Schema(
 *     title="Facade",
 *     description="House facade model",
 *     @OA\Xml(
 *         name="Facade"
 *     )
 * )
 */
class Facade
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
     *      title="title",
     *      description="House facade title",
     *      example="Facade 1"
     * )
     *
     * @var string
     */
    private $title;

    /**
     * @OA\Property(
     *      title="medium_image",
     *      description="House facade medium image",
     *      example="https://picsum.photos/900/600"
     * )
     *
     * @var string
     */
    private $medium_image;

    /**
     * @OA\Property(
     *      title="large_image",
     *      description="House facade large image",
     *      example="https://picsum.photos/1200/750"
     * )
     *
     * @var string
     */
    private $large_image;

    /**
     * @OA\Property(
     *      title="thumb_image",
     *      description="House facade thumb image",
     *      example="https://picsum.photos/320/200"
     * )
     *
     * @var string
     */
    private $thumb_image;
}