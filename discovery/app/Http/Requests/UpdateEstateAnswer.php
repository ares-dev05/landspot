<?php

namespace App\Http\Requests;

use App\Models\EstateFaq;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEstateAnswer extends FormRequest
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
            '*.answer' => 'string|nullable|max:1000',
            '*.question_name' => ['required' , 'string', Rule::in(array_keys(EstateFaq::QUESTIONS))],
        ];
    }
}
