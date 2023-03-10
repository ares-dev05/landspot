<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class BuildOptionRequest extends FormRequest
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


    public function prepareForValidation()
    {
        isset($this->suburbs) ? $this->replace(['suburbs' => explode(',', $this->suburbs)]) : null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'per_page' => 'integer|min:1|max:100',
            'beds' => 'integer|gt:0|max:1024',
            'bathrooms' => 'numeric|gt:0|max:1024',
            'storey' => 'string|max:512|in:single,double',
            'suburbs' => 'array',
            'suburbs.*' => 'string|max:512|exists:estates,suburb'
        ];
    }
}
