<?php

namespace App\Http\Requests;

use App\Models\StageDoc;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Class LotRequest
 * @property \Illuminate\Http\UploadedFile file
 * @property int estateId
 * @property int stage_id
 * @property array docs
 */
class EstatePackageRequest extends FormRequest
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
        if ($this->isMethod('get')) return [
            'estateId'        => 'required|integer',
        ];

        if ($this->isMethod('post')) {
            $mimes = $this->get('type') == StageDoc::types['other'] ? 'pdf,jpeg,png,jpg,gif' : 'pdf';

            return [
                'file'     => "required|mimes:{$mimes}|max:100000",
                'type'     => ['required', Rule::in(StageDoc::types)],
                'stage_id' => 'required|numeric'
            ];
        }

        if ($this->isMethod('put')) return [
            'docs' => 'required:array',
            'docs.*.name' => 'required|string|max:255',
            'docs.*.fileName' => 'required|string|max:255',
        ];

        return [];
    }
}
