<?php

namespace App\Http\Requests;

use App\Models\InvitedUserDocument;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Class UploadMyClientsFile
 * @package App\Http\Requests
 * @property array remove
 * @property array create
 */
class UploadMyClientsFile extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'user_id' => 'required_with:create|integer|exists:invited_users,id',
            'estate_id' => !auth()->user()->company->isBuilder() ? 'required_with:create|integer|exists:estates,id' : '',
            'type' => ['required_with:create', 'integer', Rule::in(array_values(InvitedUserDocument::TYPES))],
            'path' => 'required_with:create|string|max:255'
        ];
    }
    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array
     */
    public function messages()
    {
        return [
            'user_id.exists' => 'This user does not exist',
            'estate_id.exists' => 'This estate does not exist',
        ];
    }
}
