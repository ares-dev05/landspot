<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

/**
 * Class UpdateShortList
 * @package App\Http\Requests
 * @property array remove
 * @property array create
 */
class UpdateShortList extends FormRequest
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
            'remove' => 'array|present',
            'remove.*.estate_short_list_id' => 'sometimes|required|exists:estate_short_lists,id',
            'remove.*.id' => 'sometimes|required|integer|exists:short_lists,id',

            'create' => 'array|present',
            'create.*.invited_user_id' => 'sometimes|required|integer|exists:invited_users,id',
            'create.*.stage_id' => 'sometimes|required|integer|exists:stages,id',
            'create.*.estate_id' => 'sometimes|required|integer|exists:estates,id',
            'create.*.lot_id' => ['sometimes', 'required', 'integer', Rule::exists('lots', 'id')->where(function ($q) {
                $q->where('lotmix_visibility', 1);
            })]
        ];
    }
}
