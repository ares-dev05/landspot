<?php

namespace App\Http\Requests\Brief;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Class VerifySMSCodeRequest
 *
 * @property $phone
 * @property $code
 */
class VerifySMSCodeRequest extends FormRequest
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
            'code'   =>  'required',
            'phone'   =>  'required',
        ];
    }
}
