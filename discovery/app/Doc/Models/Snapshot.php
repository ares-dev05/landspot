<?php


namespace App\Doc\Models;

/**
 * @OA\Schema(
 *     title="Snapshot",
 *     description="Estate Snapshot model",
 *     @OA\Xml(
 *         name="Snapshot"
 *     )
 * )
 */
class Snapshot
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
     *     title="estate_id",
     *     description="Estate id",
     *     format="int64",
     *     example=1
     * )
     *
     * @var integer
     */
    private $estate_id;

    /**
     * @OA\Property(
     *      title="name",
     *      description="Estate snapshot name",
     *      example="CS, 2021"
     * )
     *
     * @var string
     */
    private $name;

    /**
     * @OA\Property(
     *      title="distance",
     *      description="Snapshot distance",
     *      example=10
     * )
     *
     * @var integer
     */
    private $distance;

    /**
     * @OA\Property(
     *      title="type",
     *      description="Snapshot type",
     *      example=0
     * )
     *
     * @var integer
     */
    private $type;

    /**
     * @OA\Property(
     *      title="lat",
     *      description="Snapshot latitude coordinate",
     *      example=10.22222
     * )
     *
     * @var double
     */
    private $lat;

    /**
     * @OA\Property(
     *      title="long",
     *      description="Snapshot longitude coordinate",
     *      example=10.22222
     * )
     *
     * @var double
     */
    private $long;

    /**
     * @OA\Property(
     *      title="type_name",
     *      description="House estate type name",
     *      example="Closest School"
     * )
     *
     * @var string
     */
    private $type_name;
}