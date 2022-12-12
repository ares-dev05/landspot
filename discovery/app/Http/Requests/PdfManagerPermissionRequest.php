<?php

namespace App\Http\Requests;

use App\Models\{
    User
};
use Illuminate\Foundation\Http\FormRequest;

/**
 * Class PdfManagerPermissionRequest
 * @property array selectedManagers
 * @property array deletedManagers
 * @property array filters
 * @property int estateId
 * @property int companyId
 * @property int user
 */
class PdfManagerPermissionRequest extends FormRequest
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
        if($this->isMethod('post')) {
            return [
                'deletedManagers'     => 'present|array',
                'deletedManagers.id'  => 'exists:uf_users,id',
                'selectedManagers'    => 'present|array',
                'selectedManagers.id' => 'exists:uf_users,id',
                'estateId'            => 'required|exists:estates,id',
                'companyId'           => 'required|exists:companies,id',
            ];
        } else {
            return [
                'userId'   => 'required|exists:uf_users,id',
                'filters'  => 'present|array',
                'estateId' => 'required|exists:estates,id',
            ];
        }
    }
}
