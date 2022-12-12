<?php

namespace App\Repositories\House;


use App\Models\House;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;

/**
 * Class HouseRepository.
 *
 * @package namespace App\Repositories\House\HouseRepository;
 *
 * Facade @see \App\Facades\HouseRepository
 */
class HouseRepository implements HouseInterface
{
    function applyFilterAttributesEB(array $filters, $orderBy = null): EloquentBuilder
    {

        if (!isset($filters['range'])) {
            $ranges = auth()->user()->getUserRanges()->pluck('id')->toArray();
        } else {
            $ranges = (array)$filters['range'];
        }

        $query = [];
        $story = [];
        $width = 0;
        $depth = 0;
        foreach ($filters as $key => $value) {
            if (
                $key == 'range' || $key == 'min' || $key == 'page' ||
                $key == 'max' || $key == 'fit' || $key == 'house' ||
                $key == 'title'
            ) {
                continue;
            } elseif (($key == 'width' || $key == 'depth') && $value) {
                $$key = $value;
            } elseif ($key == 'single' && $value) {
                $story[] = $value;
            } elseif ($key == 'double' && $value) {
                $story[] = $value;
            } elseif ($filters[$key]) {
                $query[$key] = $value;
            }
        }

        $houseId = $filters['house'] ?? null;

        $collection = House::with('attributes')
            ->byRangesIds(collect($ranges))
            ->byDiscovery((string)1);

        if ($houseId) {
            $collection->where('id', $houseId);
        } else {
            $collection->whereHas(
                'attributes',
                function (EloquentBuilder $q) use ($query, $filters, $story, $width, $depth) {
                    $q->where($query);

                    $q->where(function (EloquentBuilder $q) use ($filters) {

                        $minPrice = (int)($filters['min'] ?? 0);
                        $maxPrice = (int)($filters['max'] ?? 0);

                        $q->where(function (EloquentBuilder $q) use ($minPrice, $maxPrice) {
                            if ($minPrice > 0) {
                                $q->where('price', '>=', $minPrice);
                            }

                            if ($maxPrice > 0) {
                                $q->where('price', '<=', $maxPrice);
                            }
                        });

                        if ($minPrice > 0 || $maxPrice > 0) {
                            $q->orWhereNull('price');
                            $q->orWhere('price', 0);
                        }
                    });

                    if (!empty($filters['title'])) {
                        $q->where('title', 'like', str_replace(['%', '_'], ['\%', '\_'], $filters['title']) . '%');
                    }
                    if (!empty($story)) {
                        $q->whereIn('story', $story);
                    }
                    if ($width > 0) {
                        $q->where('width', '<=', $width);
                    }
                    if ($depth > 0) {
                        $q->where('depth', '<=', $depth);
                    }
                    //                    if (isset($filters['fit']) && $filters['fit'] > 0) {
                    //                        $q->where('size', '<', $filters['fit']);
                    //                    }
                }
            );
        }

        if ($orderBy) {
            $collection->orderBy($orderBy);
        }

        return $collection;
    }
}
