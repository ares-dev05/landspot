<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Class Manager
 * @property int|null page
 * @property int|null range
 * @property string|null order
 * @property string|null sort
 */
class Manager extends FormRequest
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
            'page' =>  'nullable|integer',
            'range' =>  'nullable|integer',
            'sort' =>  ['nullable',
                Rule::in(['title'])],
            'order' =>  ['nullable',
                Rule::in(['asc', 'desc'])]
        ];
    }
}
