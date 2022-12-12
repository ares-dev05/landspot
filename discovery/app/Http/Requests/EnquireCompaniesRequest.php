<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Class EnquireCompaniesRequest
 * @package App\Http\Requests
 *
 * @property string phone
 * @property array companies
 * @property array budgets
 * @property array finance
 * @property string land
 * @property array selectedSuburbs
 * @property array landForm
 * @property array houseRequirements
 * @property int region
 * @property array stories
 */
class EnquireCompaniesRequest extends FormRequest
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
            'phone' => 'required|regex:/^[\d ()+-]+$/',
            'companies' => 'required|array',
            'companies.*' => 'required|integer',
            'finance' => 'required|array',
            'finance.preApproval' => 'required|boolean',
            'finance.buyerTypeId' => 'required|integer',
            'land' => 'required|string|in:need_land,have_land',
            'landForm.estateName' => 'sometimes|nullable|string',
            'landForm.lotNumber' => 'sometimes|nullable|integer',
            'landForm.selectedSuburbs' => 'sometimes|nullable|array',
            'landForm.selectedSuburbs.*' => 'sometimes|nullable|integer|exists:estates,id',
            'landForm.streetName' => 'sometimes|nullable|string',
            'houseRequirements' => 'required|array',
            'houseRequirements.bedrooms' => 'required|integer',
            'houseRequirements.bathrooms' => 'required|integer',
            'region' => 'required|integer|exists:regions,id',
            'stories' => 'required|array',
            'stories.double_story' => 'required|boolean',
            'stories.single_story' => 'required|boolean',
        ];
    }
}
