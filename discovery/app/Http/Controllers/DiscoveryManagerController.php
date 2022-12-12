<?php

namespace App\Http\Controllers;

use App\Models\{Facade,
    File,
    Floorplan,
    Gallery,
    HouseXMLImport,
    ImageWithThumbnails,
    Option,
    Range,
    House,
    HouseAttributes,
    User};
use App\Http\Requests\{
    AddHouseRequest, AddHouseAttributes, Manager, UploadedBuilderXMLRequest
};
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpKernel\Exception\{BadRequestHttpException, HttpException};
use Illuminate\Support\Arr;

class DiscoveryManagerController extends Controller
{
    public function __construct()
    {
        $this->middleware('can:discovery-manager');
    }

    function index()
    {
        return view('user.spa', ['rootID' => 'discovery-manager']);
    }

    public function getHouses(Manager $request)
    {
        $sortable = null;
        if ($request->sort && $request->order) {
            $sortable['sort'] = ($request->sort === 'title') ? 'title' : null;
            $sortable['order'] = ($request->order === 'asc') ? 'asc' : 'desc';
        }

        /** @var User $user */
        $user = auth()->user();
        $userRanges = $user->getUserRanges();
        $houses = House::getCollection(50, $request->range, $request->order);
        $company = $user->isBuilderAdmin() || $user->isDiscoveryManager()
            ? $user->company->only([
                    'description',
                    'email',
                    'phone',
                    'website',
                    'main_image_path',
                    'video_link',
                    'main_address'
                ])
            : null;

        if ($request->expectsJson()) {
            return compact('houses', 'sortable', 'userRanges', 'company');
        }
    }

    /**
     * @param House $house
     * @return array
     * @throws \Illuminate\Auth\Access\AuthorizationException
     * @throws \Exception
     */
    public function updateDiscoveryHouse(House $house)
    {
        $this->authorize('update', $house);

        $fields['discovery'] = $house->discovery > 0 ? 0 : 1;
        $emptyAttributes = $house->listIncompletedAttributes();

        if ($fields['discovery'] == 1 && $emptyAttributes) {
            throw new HttpException(400, 'Please fill ' . implode(', ', $emptyAttributes));
        } else {
            $house->update($fields);
        }

        $houses = House::getCollection(50, \request()->range, \request()->order);
        $ajax_success = 'Discovery mode updated';
        return compact('houses', 'ajax_success');
    }

    /**
     * @param Range $deletedRange
     * @return array
     * @throws \Exception
     */
    function deleteRange(Range $deletedRange)
    {
        $this->authorize('update', $deletedRange);
        $deletedRange->delete();

        $ajax_success = 'Range successfully deleted';
        $userRanges = auth()->user()->getUserRanges();
        $houses = House::getCollection(50, \request()->range, \request()->order);

        return compact('houses', 'ajax_success', 'userRanges');
    }

    /**
     * @param House $house
     * @return array
     * @throws \Exception
     */
    function deleteHouse(House $house)
    {
        $this->authorize('delete', $house);
        $house->delete();

        $ajax_success = 'House was successfully deleted';
        $houses = House::getCollection(50, \request()->range, \request()->order);

        return compact('houses', 'ajax_success');
    }

    /**
     * @param House $house
     * @return array
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function getDetails(House $house)
    {
        $this->authorize('update', $house);
        $house->attributes()->firstOrCreate(['house_id' => $house->id]);
        $house->attributes->append('area_size');
        $details = $house->attributes->toArray();
        $details['house_title'] = $house->title;
        $details['house_volume'] = $house->volume()->exists() ? $house->volume->path : '';
        $details['house_range_id'] = $house->range_id;

        return compact('details');
    }

    /**
     * @param AddHouseAttributes $request
     * @param HouseAttributes $houseAttributes
     * @return array
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function editHouseDetails(AddHouseAttributes $request, HouseAttributes $houseAttributes)
    {
        $house = $houseAttributes->house;
        $this->authorize('update', $houseAttributes->house);

        $house->update([
            'title' => $request->get('house_title'),
            'range_id' => $request->get('house_range_id'),
        ]);

        if ($request->get('house_volume')) {
            $house->volume()->updateOrCreate(
                [
                    'path' => $request->get('house_volume')
                ]
            );
        } else {
            $house->volume()->delete();
        }
        $attributes = $request->all();

        $houseAttributes->update(
            $attributes
        );

        $ajax_success = 'House details are updated.';
        return compact('ajax_success');
    }

    /**
     * @param $rangeName
     * @return Range
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function addRange($rangeName)
    {
        $this->authorize('create', Range::class);

        $rangeName = (mb_stripos($rangeName, ' Range') === false) ? ucwords(trim($rangeName) . ' Range') : $rangeName;

        $range = auth()->user()->company->range()->byName($rangeName)->get()->first();
        if (!$range) {
            $range = auth()->user()->company->range()->firstOrCreate([
                'state_id' => auth()->user()->state_id,
                'name' => $rangeName]);
        }

        return $range;
    }

    /**
     * @param AddHouseRequest $request
     * @return array
     * @throws \Exception
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function addHouse(AddHouseRequest $request)
    {
        if (!empty($request->range_name)) {
            $range = $this->addRange($request->range_name);
        } elseif (!empty($request->range_id)) {
            $range = Range::findOrFail($request->range_id);
        } else {
            throw new BadRequestHttpException('Invalid request');
        }

        $this->authorize('createHouse', $range);

        $title = ucwords(trim($request->title));

        $house = House::firstOrCreate([
            'range_id' => $range->id,
            'title' => $title],
            [
                'discovery' => 0
            ]);

        $name = $house->range->name;

        $ajax_success = 'Added new house "' . $house->title . '" to "' . $name . '"';
        return compact('ajax_success');
    }

    /**
     * @param Request $request
     * @return array
     * @throws \Illuminate\Validation\ValidationException
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function setCompanyData(Request $request)
    {
        /** @var User $user */
        $user = auth()->user();
        $company = $user->company;
        $this->authorize('update', $company);

        $rules = [
            'description' => 'nullable|string|max:1000',
            'website' => 'nullable|string|max:160',
            'phone' => 'nullable|string|min:6|max:20',
            'main_image_path' => 'nullable|string|max:255',
            'video_link' => 'nullable|string|min:6|max:255',
            'main_address' => 'nullable|string|min:3|max:255',
        ];

        $validatedData = $this->validate($request, $rules);

        if (File::tempFileExists($request->main_image_path)) {
            $filePath = File::moveTemporaryFileToStorage(basename($request->main_image_path), 'company_main_image');
            $validatedData['main_image_path'] = $filePath;
            $company->update($validatedData);
        } else {
            $validatedData = collect($validatedData)->except(['main_image_path']);
            $company->update($validatedData->toArray());
        }

        $ajax_success = 'Lotmix company profile are updated';

        $company->setVisible([
            'description',
            'email',
            'phone',
            'website',
            'main_image_path',
            'video_link',
            'main_address'
        ]);
        return compact('ajax_success', 'company');
    }

    /**
     * @param Request $request
     */
    public function uploadImage(Request $request)
    {
        if (!$request->file) {
            abort(404, 'Image not found');
        }
        return File::storeToTempFolder($request->file);
    }

    /**
     * @param House $house
     * @return array
     * @throws \Illuminate\Auth\Access\AuthorizationException
     * @throws \Exception
     */
    public function getHouseMedia(House $house)
    {
        $this->validate(
            \request(),
            [
                'mediaType' => 'required|string|in:gallery,facades,floorplans',
            ],
            [
                'mediaType.in' => 'Invalid media type',
            ]
        );

        $this->authorize('update', $house);
        $mediaType = \request()->mediaType;
        $media = $house->$mediaType;

        switch ($mediaType) {
            case 'floorplans':
                $hasGroundFirstFloor = $media->contains(function (Floorplan $f) {
                    return !!$f->floor;
                });

                if (!$media->count()) {
                    $media = $media->concat([
                        $house->floorplans()->make(),
                        $house->floorplans()->make(['floor' => 1])
                    ]);
                } elseif ($media->count() == 1 && $hasGroundFirstFloor && $media->first()->floor) {
                    $media->prepend($house->floorplans()->make());
                } elseif ($media->count() == 1) {
                    $media->push($house->floorplans()->make(['floor' => 1]));
                }

                return compact('media', 'hasGroundFirstFloor');

            default:
                $itemsCount = $media->count();
                $hasTitle = $mediaType === 'facades';

                $remainingMediaCount = 3 - $itemsCount;
                while ($remainingMediaCount-- > 0) {
                    $media->add($house->$mediaType()->make());
                }

                return compact('itemsCount', 'media', 'hasTitle');
        }
    }

    /**
     * @param House $house
     * @return array
     * @throws \Illuminate\Auth\Access\AuthorizationException
     * @throws \Exception
     */
    function updateHouseMedia(House $house)
    {
        Validator::extend('validate_facades', function ($attribute, $value, $parameters, $validator) {
            $mediaType = Arr::get($validator->getData(), $parameters[0]);
            if (is_array($value) && $mediaType === 'facades') {
                foreach ($value as $media) {
                    if (!$media || !is_array($media)) continue;
                    if (!array_key_exists('fileData', $media)) return false;
                    $fileData = $media['fileData'];
                    if (empty($fileData['title'])) {
                        return false;
                    }
                }
            }

            return true;
        });

        $rules = [
            'mediaType' => 'required|string|in:gallery,facades,floorplans',
            'mediaFiles' => 'nullable|array|validate_facades:mediaType',
            'mediaBulkFile' => 'nullable|image',
        ];

        if (\request()->has('mediaBulkFile')) {
            $image = \request()->file('mediaBulkFile');
            $dimensionRule = '';
            if ($image && $image instanceof UploadedFile && $image->getMimeType() !== 'image/svg+xml') {
                $dimensionRule = '|dimensions:max_width=8192,max_height=8192';
            }
            $rules['mediaBulkFile'] = 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:20480' . $dimensionRule;
        }


        $this->validate(
            \request(),
            $rules,
            [
                'mediaType.in' => 'Invalid media type',
                'mediaFiles.validate_facades' => 'Facade title is required',
            ]
        );

        $this->authorize('update', $house);
        $mediaType = \request()->mediaType;

        switch ($mediaType) {
            case 'gallery':
            case 'facades':
                return $this->saveHouseMediaFiles($house);
            case 'floorplans':
                return $this->saveFloorplan($house);

            default:
                throw new \Exception('Invalid media type');
        }
    }

    /**
     * @param House $house
     * @return array
     * @throws \Exception
     */
    protected function saveHouseMediaFiles(House $house)
    {
        $items = \request()->mediaFiles;
        $mediaType = \request()->mediaType;
        if ($items) {
            foreach ($items as $item) {
                if (!$item) continue;

                $fileData = $item['fileData'] ?? null;
                $uploadedFile = $item['uploadedFile'] ?? null;
                $id = $fileData['id'] ?? null;

                /** @var Gallery|Facade $object */
                $object = $id ? $house->$mediaType()->findOrFail($id) : $house->$mediaType()->make();

                if (!empty($uploadedFile)) {
                    if (!empty($uploadedFile['name'])) {
                        $object->generateThumbnails(basename($uploadedFile['name']));
                    }
                }

                if (!empty($fileData['title'])) {
                    $object->title = mb_substr($fileData['title'], 0, 255);
                }

                if ($object->isDirty(['path', 'title'])) {
                    $object->save();
                }
            }
        }
        $file = \request()->mediaBulkFile;
        if ($file) {
            $tempFile = ImageWithThumbnails::storeToTempFolder($file, null, false, 0);
            $object = $house->$mediaType()->make();
            $object->generateThumbnails($tempFile['name']);
            $object->fill(['title' => $file->getClientOriginalName()])->save();
        }

        $response = \request()->has('skipResults') ? [] : $this->getHouseMedia($house);

        $response['ajax_success'] = 'Changes are saved';
        return $response;
    }

    /**
     * @param House $house
     * @return array
     * @throws \Exception
     */
    protected function saveFloorplan(House $house)
    {
        $items = \request()->mediaFiles;
        foreach ($items as $item) {
            $fileData = $item['fileData'];
            $uploadedFile = $item['uploadedFile'];
            $floor = $fileData['floor'] ?? null;
            $id = $fileData['id'] ?? null;

            /** @var Floorplan $floorplan */
            $floorplan = $id ? $house->floorplans()->findOrFail($id) : $house->floorplans()->make();

            if (!empty($uploadedFile['name'])) {
                $tolerance = 5;
                $floorplan->generateThumbnails(basename($uploadedFile['name']), $tolerance);
            } else {
                if (!$id) continue;
            }

            $size = $fileData['size'] ?? 0;

            if ($size > 0 && $size < 1e6) {
                $floorplan->size = (float)$size;
            }

            $floorplan->floor = $floor;

            if ($floorplan->isDirty([Floorplan::$fullSizeField, 'size', 'floor'])) {
                $floorplan->save();
            }
        }

        $response = $this->getHouseMedia($house);
        $response['ajax_success'] = 'Changes are saved';
        return $response;
    }

    /**
     * @param string $name
     * @param integer $id
     * @return array
     * @throws \Exception
     * @throws \Throwable
     */
    function deleteEntity($name, $id)
    {
        $object = null;
        switch ($name) {
            case 'options';
                $object = new Option();
                break;

            case 'floorplans';
                $object = new Floorplan();
                break;

            case 'facades';
                $object = new Facade();
                break;

            case 'gallery';
                $object = new Gallery();
                break;

            default:
                throw new \Exception('Invalid entity');
        }

        /* @var Option|Floorplan|Facade|Gallery $object */
        $object = $object::findOrFail($id);
        $house = $object->house;

        $this->authorize('delete', $house);
        $object->delete();

        \request()->merge(['mediaType' => $name]);
        $response = $this->getHouseMedia($house);
        $response['ajax_success'] = ucfirst($name) . " item successfully deleted";
        return $response;
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     * @throws \Illuminate\Auth\Access\AuthorizationException
     * @throws \Exception
     */
    function saveRangeInclusions()
    {
        $this->validate(
            \request(),
            [
                'rangeInclusions' => 'required|array',
                'rangeInclusions.*.id' => 'required|exists:house_ranges,id',
            ]
        );

        /** @var array $rangeInclusions */
        $rangeInclusions = \request()->rangeInclusions;
        foreach ($rangeInclusions as $item) {
            if (Arr::has($item, ['id', 'inclusions'])) {
                $range = Range::findOrFail($item['id']);
                $this->authorize('update', $range);
                $range->inclusions = trim($item['inclusions']);

                if ($range->isDirty(['inclusions'])) {
                    $range->save();
                }
            };
        }

        $ajax_success = 'Inclusions are updated';
        return compact('ajax_success');
    }

    /**
     * @param UploadedBuilderXMLRequest $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \Illuminate\Auth\Access\AuthorizationException
     * @throws \Exception
     */
    function uploadXML(UploadedBuilderXMLRequest $request)
    {

        $this->authorize('create', House::class);

        $filename = $request->file->getPathname();
        $xml = @simplexml_load_file($filename);
        $data = self::xml2array($xml);
        if ($data) {
            $result = HouseXMLImport::loadXML($data);
        } else {
            throw new \Exception('Error in XML File');
        }

        $ajax_success = sprintf(
            'File successfully imported. Added %u, updated %u and removed %u houses.',
            $result['new'], $result['updated'], $result['removed']
        );
        return compact('ajax_success');
    }

    /**
     * @param $xml
     * @return array
     */
    static function xml2array($xml)
    {
        $arr = [];
        if ($xml->count()) {

            foreach ($xml as $element) {
                $arr[$element->getName()][] = self::xml2array($element);
            }

        } else {
            $arr['@text'] = trim($xml->__toString());
        }

        foreach ($xml->attributes() as $name => $value) {
            $arr['@attributes'][$name] = trim($value);
        }

        return $arr;
    }
}
