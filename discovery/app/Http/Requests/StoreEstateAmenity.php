<?php

namespace App\Http\Requests;

use App\Models\EstateAmenity;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEstateAmenity extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'type' => ['required', Rule::in(array_keys(EstateAmenity::TYPES))],
            'lat' => ['required', 'numeric'],
            'long' => ['required', 'numeric'],
            'name' => ['required', 'string', 'max:100']
        ];
    }
}
