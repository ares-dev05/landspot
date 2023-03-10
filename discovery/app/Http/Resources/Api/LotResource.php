<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Resources\Json\JsonResource;

class LotResource extends JsonResource
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
            'lot_number' => $this->lot_number,
            'geo_coords' => $this->geo_coords,
            'frontage' => $this->frontage,
            'depth' => $this->depth,
            'area' => $this->area,
            'status' => $this->status,
            'price' => $this->price,
            'title_date' => $this->title_date,
            'image'=> $this->lot_image
        ];
    }
}
