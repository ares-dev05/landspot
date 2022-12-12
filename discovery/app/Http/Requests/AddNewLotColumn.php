<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Class AddNewLotColumn
 * @property string display_name
 * @property int estate_id
 */
class AddNewLotColumn extends FormRequest
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
            'estate_id' => 'required|integer',
            'display_name' => 'required|max:255',
            'filters' => 'present|array',
        ];
    }
}
