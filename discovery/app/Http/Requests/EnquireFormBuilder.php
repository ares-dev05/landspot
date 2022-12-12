<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Class EnquireFormBuilder

 * @property $phone
 * @property $buyerTypeId
 * @property $regionId
 */
class EnquireFormBuilder extends FormRequest
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
            'phone'   =>  'required|regex:/^[\d ()+-]+$/',
            'buyerTypeId' => 'required|integer',
            'regionId' => 'required|integer',
        ];
    }
}
