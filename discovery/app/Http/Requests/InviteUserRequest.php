<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Class InviteUserRequest
 * @package App\Http\Requests
 * @property string first_name
 * @property string last_name
 * @property string phone
 * @property string email
 * @property integer tos
 * @property integer estate
 */
class InviteUserRequest extends FormRequest
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
            'first_name' => 'bail|string|max:50|required',
            'last_name'  => 'bail|string|max:50|required',
//            'phone'      => 'bail|digits_between:6,20|required',
            'email'      => 'bail|email|max:150|required',
            'tos'        => 'accepted',
            'siting_id'  => 'sometimes|required|exists:sitings,id',
            'estate'     => !auth()->user()->company->isBuilder() ? 'bail|exists:estates,id|required' : ''
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
            'estate.exists' => 'This estate is not exist.',
        ];
    }
}
