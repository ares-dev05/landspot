<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CompanyRequest extends FormRequest
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
        if ($this->type == 'builder') {
            return [
                'name'              => 'required|string|max:255|unique:companies',
                'type'              => 'required|string|in:builder,developer',
                'domain'            => 'required|string|max:255|unique:companies',
                'builder_id'        => 'required|string|max:255',
                'chas_discovery'    => 'string|nullable',
                'chas_footprints'   => 'string|nullable',
                'description'       => 'nullable|string|max:1000',
                'email'             => 'nullable|email:rfc,dns|max:160',
                'website'           => 'nullable|string|max:160',
                'phone'             => 'nullable|string|min:6|max:20'
            ];
        } else {
            return [
                'name'              => 'required|string|max:255',
                'type'              => 'required|string|in:builder,developer',
            ];
        }
    }
}
