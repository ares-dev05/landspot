<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BuildOptionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param Request $request
     * @return array
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id . '_' . $this->estate->id,
            'title' => $this->title,
            'image' => $this->image,
            'attributes' => $this->attributes ? new AttributeResource($this->attributes) : null,
            'estate' => new EstateResource($this->estate),
            'facades' => $this->facades ? FacadeResource::collection($this->facades) : [],
        ];
    }
}
