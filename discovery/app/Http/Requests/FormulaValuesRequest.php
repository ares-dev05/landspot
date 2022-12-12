<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;


/**
 * @property array selectedFormulas
 * @property int id
 * @property int formula_id
 */
class FormulaValuesRequest extends FormRequest
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
        $rules = [];
         if($this->isMethod('put')){
             $rules = [
                 'selectedFormulas' => 'required|array',
                 'selectedFormulas.*.formula.id' => 'required|exists:kaspa_formulas,id',
                 'selectedFormulas.*.values' => 'required|array',
                 'selectedFormulas.*.values.*' => 'integer',
             ];
         }
         if($this->isMethod('delete')){
             $rules = ['formula_id' => 'required|numeric'];
         }
        return $rules;
    }
}
