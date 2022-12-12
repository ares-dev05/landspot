<?php

namespace App\Http\Requests;

use App\Models\Lot;
use App\Models\LotPackage;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Class LotRequest
 * @property LotPackage lotPackage
 * @property array packages
 * @property Lot lot
 * @property \Illuminate\Http\UploadedFile image
 * @property int id
 */
class LotPackageRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        if ($this->isMethod('get') || $this->isMethod('post') || $this->isMethod('put')) {
            $lot = Lot::find($this->id);
            if (!$lot) return false;
            $this->merge(['lot' => $lot]);
        } elseif ($this->isMethod('delete')) {
            $lotPackage = LotPackage::companyPackage()->find($this->id);
            if (!$lotPackage) return false;
            $this->merge(['lotPackage' => $lotPackage]);
        } else {
            return false;
        }


        return true;
    }

    function rules()
    {
        if($this->isMethod('get')) return [
            'id' => 'required|integer'
        ];

        if ($this->isMethod('post')) return [
            'image' => 'required|mimes:pdf|max:100000',
            'id' => 'required|integer'
        ];

        return [];
    }
}
