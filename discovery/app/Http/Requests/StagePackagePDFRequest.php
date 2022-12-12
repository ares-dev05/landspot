<?php

namespace App\Http\Requests;

use App\Models\StageDoc;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Class StagePackagePDFRequest
 * @property int package
 * @property StageDoc stageDoc
 */
class StagePackagePDFRequest extends FormRequest
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
            'package' => 'required|integer'
        ];
    }
}
