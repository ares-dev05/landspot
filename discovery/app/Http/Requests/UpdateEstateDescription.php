<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Class UpdateEstateDescription
 * @package App\Http\Requests
 *
 * @property string description
 * @property string description_secondary
 * @property string description_suburb
 */
class UpdateEstateDescription extends FormRequest
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
            'description' => 'nullable|string|max:1000',
            'description_secondary' => 'nullable|string|max:1000',
            'description_suburb' => 'nullable|string|max:1000',
        ];
    }
}
