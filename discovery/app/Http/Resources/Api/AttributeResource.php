<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Resources\Json\JsonResource;

class AttributeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'beds' => $this->beds,
            'bathrooms' => $this->bathrooms,
            'price' => $this->price,
            'width' => $this->width,
            'depth' => $this->depth,
            'size' => $this->size,
            'size_units' => $this->size_units,
            'story' => $this->story,
            'cars' => $this->cars,
            'description' => $this->description
        ];
    }
}
