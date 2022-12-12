<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Class NewEstateRequest
 * @property int state_id
 * @property string logoFileName
 */
class NewEstateRequest extends FormRequest
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
            'address' => 'required|string|max:255',
            'contacts' => 'required|string|max:255',
            'lat' => 'required|numeric|min:-180|max:180',
            'long' => 'required|numeric|min:-180|max:180',
            'name' => 'required|string|max:255|unique:estates',
            'suburb' => 'required|string|max:255|not_regex:/[-]+/i',
            'website' => 'required|string|max:255',
            'state_id' => 'required|numeric|exists:house_states,id',
            'logoFileName' => 'nullable|string',
        ];
    }

    function messages()
    {
        return [
            'suburb.regex' => 'Suburbs must not contain dashes'
        ];
    }
}
