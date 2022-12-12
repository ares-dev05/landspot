<?php

namespace App\Http\Requests;

use App\Models\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserRequest extends FormRequest
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
        if($this->isMethod('post')) {
            return [
                'columnValues' => 'required|array',
                'columnValues.*' => 'required_with:email,display_name',
                'columnValues.email' => 'unique:uf_users,email|email|max:150|required',
                'columnValues.display_name' => 'required|string|max:50',
                'columnValues.phone' => 'nullable|min:6|max:20|unique_phone',
                'columnValues.state_id' => 'exists:house_states,id',
                'columnValues.role'     => [
                    'present',
                    'nullable',
                    Rule::in(array_values(UserRole::USER_ROLES))
                ],
                'columnValues.password' => [
                    'nullable',
                    'min:8',
                    'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/'
                ],
                'filters' => 'array',
                'filters.company_id' => 'exists:companies,id',
            ];
        } else {
            $user_id = $this->route('user');

            return [
                'columnValues' => 'required|array',
                'columnValues.*' => 'required_with:email,display_name',
                'columnValues.display_name' => 'required|string|max:50',
                'columnValues.email' => 'unique:uf_users,email,'.$user_id.'|email|required',
                'columnValues.phone' => 'nullable|min:6|max:20|unique_phone:' . $user_id,
                'columnValues.state_id' => 'exists:house_states,id',
                'columnValues.role'     => [
                    'present',
                    'nullable',
                    Rule::in(array_values(UserRole::USER_ROLES))
                ],
                'columnValues.password' => [
                    'nullable',
                    'min:8',
                    'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/'
                ],
                'filters' => 'array',
                'filters.company_id' => 'exists:companies,id',
            ];
        }
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array
     */
    public function messages()
    {
        return [
            'columnValues.email.unique' => 'The email has already been taken.',
            'columnValues.phone.unique_phone' => 'The phone number has already been taken.',
            'columnValues.phone.min' => 'The phone number is too short.',
            'columnValues.phone.max' => 'The phone number is too long.',
            'columnValues.password.regex' => 'Password must contain minimum eight characters, at least one number character and both uppercase and lowercase letters.',
        ];
    }
}
