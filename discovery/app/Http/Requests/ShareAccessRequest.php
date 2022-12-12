<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ShareAccessRequest extends FormRequest
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
            'deletedManagers' => 'present|array',
            'deletedManagers.id' => 'exists:uf_users,id',
            'selectedManagers' => 'present|array',
            'selectedManagers.id' => 'exists:uf_users,id',
        ];
    }
}
