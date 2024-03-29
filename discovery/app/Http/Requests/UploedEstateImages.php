<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UploedEstateImages extends FormRequest
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
            'files' => ['required', 'array', 'min:1', 'max:4'],
            'files.*' => ['required', 'mimes:jpeg,jpg,png,gif', 'max:10000']
        ];
    }
}
