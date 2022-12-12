<?php

namespace App\Models\Sitings;

use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;

/**
 * Trait CustomFiltersTrait
 *
 *
 * @method customFilters(...$args)
 */
trait CustomFiltersTrait
{
    /**
     * @param EloquentBuilder $b
     * @param array $filters
     */
    function scopeCustomFilters(EloquentBuilder $b, array $filters)
    {
        if (isset($filters['order']) && isset($filters['sort_by'])) {
            $column = $filters['sort_by'];
            $order  = $filters['order'];
            if ($order === 'asc' || $order === 'desc') {
                if (in_array($column, $this->fillable) || $column == 'updated_at') {
                    $b->orderBy($b->qualifyColumn($column), $order);
                } elseif (in_array($column, self::$filteredRelations)) {
                    list($modelName, $columnName) = explode('.', $column);
                    /** @var BelongsTo|HasOneThrough $relation */
                    $relation = $this->{$modelName}();
                    $model    = $relation->getRelated();

                    if ($relation instanceof HasOneThrough) {
                        $b->join(
                            $relation->getParent()->getTable(),
                            $relation->getQualifiedFirstKeyName(),
                            '=',
                            $relation->getQualifiedLocalKeyName()
                        )->join(
                            $model->getTable(),
                            $relation->getQualifiedForeignKeyName(),
                            '=',
                            $relation->getQualifiedParentKeyName()
                        );
                    } else {
                        $b->join(
                            $model->getTable(),
                            $relation->getQualifiedForeignKeyName(),
                            '=',
                            $relation->getQualifiedOwnerKeyName()
                        );
                    }
                    $b->orderBy($model->qualifyColumn($columnName), $order);
                }
            }
        }

        $v = $filters['filter'] ?? '';
        if ($v != '') {
            $b->byClient($v);
        }
    }
}