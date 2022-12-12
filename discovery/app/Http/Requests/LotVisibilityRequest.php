<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Class LotRequest
 * @property bool allChecked
 * @property bool allUnchecked
 * @property bool customOptionsChecked
 * @property array filters
 * @property array selectedOptions
 */
class LotVisibilityRequest extends FormRequest
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

    function rules()
    {
        return [
            'allChecked'           => 'required|boolean',
            'allUnchecked'         => 'required|boolean',
            'customOptionsChecked' => 'required|boolean',
            'filters'              => 'present|array',
            'selectedOptions'      => 'present|array|max:3',
        ];
    }
}
