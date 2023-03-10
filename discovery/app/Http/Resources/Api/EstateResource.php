<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Resources\Json\JsonResource;

class EstateResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param \Illuminate\Http\Request $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'suburb' => $this->suburb,
            'logo' => $this->logo,
            'small_image' => $this->smallImage,
            'geo_coords' => $this->geo_coords,
            'snapshots' => $this->estate_snapshots,
            'lots_count' => $this->lots_count,
            'lots'=> LotResource::collection($this->lots),
        ];
    }
}
