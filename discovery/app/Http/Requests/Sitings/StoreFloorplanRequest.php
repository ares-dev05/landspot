<?php

namespace App\Http\Requests\Sitings;

use Illuminate\Foundation\Http\FormRequest;

class StoreFloorplanRequest extends FormRequest
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
        if ($this->isMethod('POST')) {
            return [
                'live_date'                      => 'nullable|date',
                'range'                          => 'nullable|string|max:100',
                'state_id'                       => 'required|integer|exists:house_states,id',
                'floorplans'                     => 'required|array',
                'floorplans.*.name'              => 'required|string|max:100',
                'floorplans.*.file_dwg.fileName' => 'required|string|max:100',
                'floorplans.*.file_dwg.name'     => 'required|string|max:100',
            ];
        }

        if ($this->isMethod('PUT')) {
            return [
                'update_note'         => 'nullable|string|max:1024',
                'file_dwg'            => 'nullable|array',
                'file_dwg.*.fileName' => 'required|string|max:100',
                'file_dwg.*.name'     => 'required|string|max:100',
            ];
        }
    }
}
