<?php

namespace App\Http\Requests;

use App\Models\Estate;
use App\Models\Lot;
use App\Models\Stage;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Class ExportLotsRequest
 * @property Estate estate
 * @property int estate_id
 * @property int export_id
 * @property int stage_id
 * @property string unsold_lots
 */
class ExportLotsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        /** @var Estate $estate */
        $estate = Estate::find($this->estate_id);

        if ($this->export_id < 0 && !in_array($this->export_id, Lot::exportVisibility)) {
            return false;
        }

        if ($this->export_id > 0) {
            $companies = auth()->user()->getBuilderCompanies();
            if (!isset($companies[$this->export_id])) return false;
        }
        $this->merge(['estate' => $estate]);

        return !!$estate;
    }

    function rules()
    {
        return [];
    }
}
