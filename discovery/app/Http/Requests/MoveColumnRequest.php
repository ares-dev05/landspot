<?php

namespace App\Http\Requests;

use App\Models\Estate;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Arr;
/**
 * Class MoveColumnRequest
 * @property array filters
 * @property array sortedColumns
 * @property Estate estate
 */
class MoveColumnRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        $estateId = Arr::get($this->filters, 'estate_id');
        if ($estateId) {
            /** @var Estate $estate */
            $estate = Estate::find($estateId);
            if ($estate) {
                $this->merge(['estate' => $estate]);
                $columns             = $estate->lotAttributes()->get(['id'])->pluck('id');
                $this->sortedColumns = array_filter(
                    $this->sortedColumns,
                    function ($value) use ($columns) {
                        return $columns->contains($value['id']) && $value['order'] >= 0;
                    });
                return true;
            }
        }

        return false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'filters'       => 'required|array',
            'sortedColumns' => 'required|array',
        ];
    }
}
