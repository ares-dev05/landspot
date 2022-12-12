<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UploadImageRequest extends FormRequest
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
        $dimensionRule = null;
        $image         = $this->file('image');
        if (!$image || (
                $image->getMimeType() !== 'image/svg+xml' &&
                $image->getMimeType() !== 'image/svg'
            )) {
            $dimensionRule = '|dimensions:max_width=8192,max_height=8192';
        }

        return [
            'image'     => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:20480' . $dimensionRule,
            'tolerance' => 'nullable|integer|min:0|max:100'
        ];
    }

    public function messages()
    {
        return [
            'image.dimensions' => 'The image max allowed dimensions are 8192x8192.'
        ];
    }
}
