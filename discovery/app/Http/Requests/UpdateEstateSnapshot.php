<?php

namespace App\Http\Requests;

use App\Models\EstateSnapshot;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEstateSnapshot extends FormRequest
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
            '*.name' => 'string|nullable|max:128',
            '*.type_name' => ['required' , 'string', Rule::in(array_keys(EstateSnapshot::TYPES))],
            '*.distance'    => 'required|int',
            '*.lat' => 'sometimes|numeric|nullable',
            '*.long' => 'sometimes|numeric|nullable',
        ];
    }
}
