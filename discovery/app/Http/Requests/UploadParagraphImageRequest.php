<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UploadParagraphImageRequest extends FormRequest
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
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,svg|dimensions:max_width=8192,max_height=8192|max:500',
            'tolerance' => 'nullable|integer|min:0|max:100'
        ];
    }
}
