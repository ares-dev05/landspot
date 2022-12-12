<?php

namespace App\Models;
use Illuminate\Support\{Arr, Str};

class HouseXMLImport
{
    static function loadXML(array $objects)
    {
        ignore_user_abort(true);
        $objects = Arr::get($objects, 'land.0');
        if (!$objects) return;


        $objects = Arr::get($objects, 'range');
        if (!$objects) return;

        $updated = 0;
        $new     = 0;
        $removed = 0;

        foreach ($objects as $parsedRange) {
            $rangeName = Arr::get($parsedRange, '@attributes.name');
            if ($rangeName == '') continue;
            $range       = auth()->user()->company->range()->byName($rangeName)->get()->first();
            if (!$range) {
                $range = auth()->user()->company->range()->create([
                    'state_id' => auth()->user()->state_id,
                    'name' => $rangeName
                ]);
            }
            $parsedHouses = Arr::get($parsedRange, 'house');

            if (!$parsedHouses) continue;

            $parsedHouseNames = [];
            foreach ($parsedHouses as $parsedHouse) {
                $parsedHouseName = Arr::get($parsedHouse, 'name.0.@text');
                if ($parsedHouseName == '' || !is_string($parsedHouseName)) continue;

                $existingHouse = $range->house()->byName($parsedHouseName)->get()->first();
                if ($existingHouse) {
                    self::updateHouse($existingHouse, $parsedHouse);
                    ++$updated;
                } else {
                    self::addNewHouse($range, $parsedHouse);
                    ++$new;
                }

                $parsedHouseNames[] = $parsedHouseName;
            }

            $removed = $range
                ->house()
                ->whereNotIn('title', $parsedHouseNames)
                ->update(['discovery' => 0]);
        }

        return [
            'new'     => $new,
            'removed' => $removed,
            'updated' => $updated
        ];
    }

    protected static function updateHouse(House $house, array $data)
    {
        $houseData = self::prepareHouseData($data);
        \DB::beginTransaction();

        try {
            $house->attributes()->updateOrCreate([], $houseData['attributes']);
            $house->discovery = 1;
            $house->save();
            $house->deleteChildItems();

            $itemData = Arr::get($houseData, 'facades');
            if ($itemData) {
                foreach ($itemData as $data) {
                    $object = $house->facades()->create([
                        'title' => $data['text']
                    ]);
                    $object->generateThumbnails($data['file']['name'])->save();
                }
            }

            $itemData = Arr::get($houseData, 'floorplan.0');
            if ($itemData) {
                $opts = [];
                if(isset($itemData['size'])) {
                    $opts['size'] = $itemData['size'];
                }
                $object = $house->floorplans()->create($opts);
                $object->generateThumbnails($itemData['file']['name'])->save();
            }

            $itemData = Arr::get($houseData, 'gallery');
            if ($itemData) {
                foreach ($itemData as $data) {
                    $object = $house->gallery()->create([]);
                    $object->generateThumbnails($data['file']['name'])->save();
                }
            }

            $itemData = Arr::get($houseData, 'options');
            if ($itemData) {
                foreach ($itemData as $data) {
                    $object = $house->options()->create([
                        'title' => $data['text']
                    ]);
                    $object->generateThumbnails($data['file']['name'])->save();
                }
            }

            $itemData = Arr::get($houseData, 'model3DUrl');
            if ($itemData) {
                $house->volume()->create(['path' => $itemData]);
            }


            \DB::commit();
        } catch (\Exception $e) {
            \DB::rollBack();
            throw $e;
        }
    }

    protected static function prepareHouseData($data)
    {
        $houseData['attributes'] = self::parseAtrributes($data);

        $facades = Arr::get($data, 'facades.0.facade');
        if (is_array($facades) && $facades) {
            $houseData['facades'] = self::downloadItemImages($facades);
        }

        $floorplan = Arr::get($data, 'floorplan');
        if (is_array($floorplan)) {
            $houseData['floorplan'] = self::downloadItemImages($floorplan);
        }

        $options = Arr::get($data, 'options.0.option');
        if (is_array($options) && $options) {
            $houseData['options'] = self::downloadItemImages($options);
        }

        $gallery = Arr::get($data, 'galleryImages.0.gallery');

        if (is_array($gallery) && $gallery) {
            $houseData['gallery'] = self::downloadItemImages($gallery);
        }

        $model3dUrl = Arr::get($data, 'Overview3Dmodel.0.@attributes.url');
        if (filter_var($model3dUrl, FILTER_VALIDATE_URL)) {
            $houseData['model3DUrl'] = $model3dUrl;
        }

        return $houseData;
    }

    protected static function addNewHouse(Range $range, array $data)
    {
        $houseData = self::prepareHouseData($data);
        $houseName = Arr::get($data, 'name.0.@text');

        $house = null;
        \DB::beginTransaction();
        try {
            /** @var House $house */

            $house = $range->house()->create([
                    'title'     => $houseName,
                    'discovery' => 1
                ]
            );

            $house->attributes()->create($houseData['attributes']);

            $itemData = Arr::get($houseData, 'facades');
            if ($itemData) {
                foreach ($itemData as $data) {
                    $object = $house->facades()->create([
                        'title' => $data['text']
                    ]);
                    $object->generateThumbnails($data['file']['name'])->save();
                }
            }

            $itemData = Arr::get($houseData, 'floorplan.0');
            if ($itemData) {
                $object = $house->floorplans()->create([]);
                $object->generateThumbnails($itemData['file']['name'])->save();
            }

            $itemData = Arr::get($houseData, 'gallery');
            if ($itemData) {
                foreach ($itemData as $data) {
                    $object = $house->gallery()->create([]);
                    $object->generateThumbnails($data['file']['name'])->save();
                }
            }

            $itemData = Arr::get($houseData, 'options');
            if ($itemData) {
                foreach ($itemData as $data) {
                    $object = $house->options()->create([
                        'title' => $data['text']
                    ]);
                    $object->generateThumbnails($data['file']['name'])->save();
                }
            }

            $itemData = Arr::get($houseData, 'model3DUrl');
            if ($itemData) {
                $house->volume()->create(['path' => $itemData]);
            }

            \DB::commit();
        } catch (\Exception $e) {
            if($house) {
                $house->delete();
            }
            \DB::rollBack();
            throw $e;
        }
    }

    protected static function parseAtrributes($data)
    {
        $houseAttributes = [
            'bathrooms' => 'bathrooms',
            'bedrooms'  => 'beds',
            'cars'      => 'cars'
        ];

        $width       = max(0, (int)Arr::get($data, 'frontage.0.@text'));
        $depth       = max(0, (int)Arr::get($data, 'depth.0.@text'));
        $size        = max(0, (int)Arr::get($data, 'areaSize.0.@text'));
        $price       = max(0, (int)Arr::get($data, 'price.0.@text'));
        $description = (string)Arr::get($data, 'description.0.@text');
        $story       = (int)Arr::get($data, 'story.0.@text');
        if ($story != 1 && $story != 2) $story = 1;

        $attributes = compact('width', 'depth', 'size', 'story', 'description', 'price');
        $features   = Arr::get($data, 'features.0', []);
        foreach ($houseAttributes as $key => $v) {
            $attributes[$v] = $features[$key][0]['@text'] ?? 0;
            $attributes[$v] = max(0, (int)$attributes[$v]);
        }

        return $attributes;
    }

    protected static function downloadItemImages(array $items)
    {
        $objects = [];
        $i       = 0;
        foreach ($items as $item) {
            $url = Arr::get($item, '@attributes.image');
            $size = (float)Arr::get($item, '@attributes.size', 0);
            if (filter_var($url, FILTER_VALIDATE_URL)) {
                $fileData = self::fetchImageToFile($url);
                if ($fileData) {
                    $objects[] = [
                        'text' => trim(Arr::get($item, '@text')),
                        'file' => $fileData,
                        'size' => $size > 0 ? $size : null
                    ];
                }
                if (++$i > 20) break;
            }
        }

        return $objects;
    }

    protected static function fetchImageToFile($url)
    {
        $tempFilename = File::generateOSTempfilename();
        $fileHandle   = @fopen($tempFilename, 'w+b');
        if (!$fileHandle) return false;

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_URL               => $url,
            CURLOPT_SSL_VERIFYHOST    => 0,
            CURLOPT_SSL_VERIFYPEER    => 0,
            CURLOPT_CONNECTTIMEOUT    => 10,
            CURLOPT_TIMEOUT           => 60,
            CURLOPT_HEADER            => 0,
            CURLOPT_CONNECTTIMEOUT_MS => 10000,
            CURLOPT_FOLLOWLOCATION    => true,
            CURLOPT_MAXREDIRS         => 5,
            CURLOPT_NOPROGRESS        => false,
            CURLOPT_WRITEFUNCTION     => function ($ch, $data) use ($fileHandle) {
                return fwrite($fileHandle, $data);
            },
            CURLOPT_PROGRESSFUNCTION  => function ($downloadSize, $downloaded, $uploadSize, $uploaded) {
                return $downloaded > (4 * 1048576) ? 1 : 0;
            }
        ]);

        $code = null;
        $contentType = null;
        curl_exec($ch);
        if (curl_errno($ch) === 0) {
            $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
        }

        curl_close($ch);

        try {
            if ($code !== 200) {
                return false;
            }

            if (strpos($contentType, 'image/') === false && $contentType !== 'application/octet-stream') {
                return false;
            }

            rewind($fileHandle);
            fflush($fileHandle);

            $imagick = new \Imagick();
            if ($imagick->pingImageFile($fileHandle)) {
                $type = $imagick->getImageFormat();
                if (!in_array($type, ['JPEG', 'GIF', 'PNG', 'SVG'])) {
                    throw new ImageImportExcepion('Invalid image');
                }

                return [
                    'type'   => $type,
                    'name'   => File::storeToTempFolderFromPath($tempFilename, Str::random(40))
                ];
            } else {
                throw new ImageImportExcepion('Error accessing image');
            }
        } catch (\ImagickException | ImageImportExcepion $e) {

        } catch (\Exception $e) {
            throw $e;
        } finally {
            if($fileHandle) fclose($fileHandle);
            unlink($tempFilename);
        }
    }
}

class ImageImportExcepion extends \Exception
{

}