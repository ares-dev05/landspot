<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AddHouseAttributes extends FormRequest
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
                'house_title' =>  'required|max:255',
                'house_range_id' =>  ['required', 'integer', 'exists_in_user_range'],
                'depth' =>  'required|nullable|numeric|max:9999',
                'price' =>  'nullable|integer|min:0|max:10000000',
                'beds' => 'required|nullable|integer|min:0|max:100',
                'size' =>  'required|nullable|numeric|min:0|max:9999',
                'bathrooms' =>  'required|nullable|numeric|min:0|max:100',
                'width' =>  'required|nullable|numeric|min:0|max:9999',
                'cars' =>  'required|nullable|integer|min:0|max:100',
                'story' =>  'required|nullable|integer|min:0|max:100',
                'size_units' => 'required|string|in:m2,sq',
                'house_volume' =>  'nullable|url|max:255',
        ];
    }
}
