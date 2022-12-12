<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EnquireFormRequest extends FormRequest
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
            'budgets'                     => 'required|array',
            'budgets.totalBudget'         => 'required|integer|min:150000',
            'budgets.houseBudget'         => 'required|integer',
            'budgets.landBudget'          => 'required|integer',
            'companies'                   => 'required|array',
            'companies.*'                 => 'exists:companies,id',
            'finance'                     => 'required',
            'land'                        => ['required',Rule::in(['need_land','have_land'])],
            'houseRequirements'           => 'required|array',
            'houseRequirements.bathrooms' => 'integer|required',
            'houseRequirements.bedrooms'  => 'integer|required',
            'landForm'                    => 'required',
            'region'                      => 'required|exists:regions,id',
        ];
    }
}
