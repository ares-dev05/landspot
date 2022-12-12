<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Class UpdateEstateRequest
 * @property int state_id
 * @property string logoFileName
 */
class UpdateEstateRequest extends FormRequest
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

    function rules()
    {
        return [
            'address'      => 'nullable|string|max:255',
            'contacts'     => 'nullable|string|max:255',
            'lat'          => 'nullable|numeric|min:-180|max:180',
            'long'         => 'nullable|numeric|min:-180|max:180',
            'name'         => 'nullable|string|max:255',
            'suburb'       => 'nullable|string|max:255|not_regex:/[-]+/i',
            'website'      => 'nullable|string|max:255',
            'state_id'     => 'nullable|numeric|exists:house_states,id',
            'logoFileName' => 'nullable|string',
        ];
    }

    function messages()
    {
        return [
            'suburb.not_regex' => 'Suburbs must not contain dashes'
        ];
    }
}
