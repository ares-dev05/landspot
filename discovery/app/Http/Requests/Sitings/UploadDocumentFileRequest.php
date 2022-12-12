<?php

namespace App\Http\Requests\Sitings;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Class UploadSignatureFileRequest
 * @property \Illuminate\Http\UploadedFile file
 * @property array files
 * @property string file_type
 * @property string document_type
 * @property array sortedFiles
 * @property int floorplanId
 */
class UploadDocumentFileRequest extends FormRequest
{
    const mimes = [
//            'PDF' => 'application/pdf',
        'DWG' => 'image/vnd.dwg',
        'SVG' => 'image/svg+xml',
//            'XLS' => Rule::in(['application/vnd.ms-office', 'application/octet-stream'])
    ];

    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return array_key_exists($this->get('file_type'), static::mimes);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {

        $mime = static::mimes[$this->get('file_type')];

        return [
            'file_type' => Rule::in(array_keys(static::mimes)),
            'file'      => ['nullable', 'max:100000', 'mimetypes:' . $mime],
            'files.*' => ['nullable', 'max:100000', 'mimetypes:' . $mime],

            'orderId' => "nullable|integer",
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array
     */
    public function messages()
    {
        $type = $this->get('file_type');

        return [
            'file.*.uploaded' => 'The file failed to upload.',
            'file.mimetypes'  => "The file must be a file of type: $type",
            'file.max'        => 'The file may not be greater than 100000 kilobytes.',
        ];
    }
}
