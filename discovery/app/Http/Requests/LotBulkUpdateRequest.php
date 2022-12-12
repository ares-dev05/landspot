<?php

namespace App\Http\Requests;

use App\Models\Estate;
use App\Models\Stage;
use Illuminate\Foundation\Http\FormRequest;

/**
 * @property array lotIds
 * @property int stageId
 * @property string columnName
 * @property mixed value
 * @property Estate estate
 * @property array filters
 */
class LotBulkUpdateRequest extends FormRequest
{

    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize() {
        $estate = Stage::findOrFail(request()->stageId)->estate;

        if (request()->columnName === 'price' && !auth()->user()->can('updatePrice', $estate)) {
            return false;
        }

        $this->merge(compact('estate'));

        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        $rules = [
            'lotIds' => 'required|array',
            'columnName' => 'required|string|min:1|max:128|in:price,title_date',
            'stageId' => 'required|integer|min:1',
            'value' => 'required'
        ];

        switch (request()->columnName){
            case 'price':
                $rules['value'] = $rules['value'] . '|' . 'numeric';
                break;
            case 'title_date':
                $rules['value'] = $rules['value'] . '|' . 'string';
                break;
        }

        return $rules;
    }

    public function messages()
    {
        return [
            'lotIds.required' => 'No lots for update'
        ];
    }
}
