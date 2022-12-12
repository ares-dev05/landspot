<?php

namespace App\Http\Requests;

use App\Models\InvitedUserDocument;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMyClientDetails extends FormRequest
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
            'removedShortLists' => 'array|present',
            'removedShortLists.*.id' => 'sometimes|required|integer|exists:floorplan_short_lists,id',

            'createdShortLists' => 'array|present',
            'createdShortLists.*.invited_user_id' => 'sometimes|required|integer|exists:invited_users,id',
            'createdShortLists.*.facade_id' => 'sometimes|required|integer|exists:facades,id',
            'createdShortLists.*.house_id' => 'sometimes|required|integer|exists:houses,id',

            'removedDocuments' => 'array|present',
            'removedDocuments.*' => 'required_with:remove|integer|exists:invited_user_documents,id',
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
            'removedDocuments.*.exists' => 'This document does not exist',
            'createdDocument.user_id.exists' => 'This user does not exist',
            'createdDocument.estate_id.exists' => 'This estate does not exist',
        ];
    }
}
