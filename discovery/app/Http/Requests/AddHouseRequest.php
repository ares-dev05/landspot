<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Class AddHouseRequest
 * @property string range_name
 * @property int range_id
 * @property string title
 */
class AddHouseRequest extends FormRequest
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
            'title' => 'required|max:255',
            'range_id' => 'required_without:range_name',
            'range_name' => 'required_without:range_id|max:255',
        ];
    }

    public function messages()
    {
        return [
            'title.required' => 'A house name is required',
            'range_id.required_if'  => 'Please select a range',
            'range_name.required_if'  => 'Please create a range',
        ];
    }
}
