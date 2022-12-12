<?php

namespace App\Http\Requests;

use App\Models\Lot;
use App\Models\Stage;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Collection;

/**
 * Class LotRequest
 * @property Lot lot
 * @property Stage stage
 * @property array columnValues
 * @property Collection staticColumns
 */
class LotRequest extends FormRequest
{
    public $isPost = false;
    public $isPut = false;

    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        if ($this->isMethod('post')) {
            $stage = Stage::find($this->stage);
            if (!$stage) return false;
            $this->merge(['stage' => $stage]);
        } else {
            if (!$this->lot->exists()) return false;
        }

        return true;
    }

    /**
     * @return array|string[]
     */
    function rules()
    {
        $this->isPost = $this->isMethod('post');
        $this->isPut = $this->isMethod('put');

        $staticColumns = [];

        if ($this->isPost) {
            $staticColumns = request()->stage->estate->lotAttributes()->staticColumns()->pluck('id', 'attr_name');
        }
        if ($this->isPut) {
            $staticColumns = $this->lot->stage->estate->lotAttributes()->staticColumns()->pluck('id', 'attr_name');
        }
        if ($this->isPost || $this->isPut) {

            $rules = [
                'columnValues' => 'required|array'
            ];

            $this->merge(compact('staticColumns'));

            $columnValuesLotNumber = $this->getColumnValuesKey('lot_number');
            if ($columnValuesLotNumber) {
                $rules[$columnValuesLotNumber] = 'regex:/^[0-9*#+]+$/'; //check lot number format only numbers and special chars
            }

            return $rules;
        }
        return [];
    }

    /**
     * @return string[]
     */
    function messages()
    {
        if ($this->isPost || $this->isPut) {
            $columnValuesLotNumber = $this->getColumnValuesKey('lot_number');
            return [
                $columnValuesLotNumber . '.regex' => 'Format must be only numbers and spec chars'
            ];
        }
        return [];
    }

    /**
     * Get validation array key by column name
     *
     * @param $name
     * @return string|null
     */
    function getColumnValuesKey($name)
    {
        foreach (request()->staticColumns as $attr_name => $attr_id) {
            if (isset(request()->columnValues[$attr_id]) && $name === $attr_name) {//
                return 'columnValues.' . $attr_id;
            }
        }
        return null;
    }
}
