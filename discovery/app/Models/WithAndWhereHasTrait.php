<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
/**
 * Trait WithAndWhereHasTrait (add scope with and whereHas)
 */

trait WithAndWhereHasTrait
{
    /**
     * Scope a query to only include popular users.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $relation
     * @param callable $constraint
     * @return EloquentBuilder
     */
    public function scopeWithAndWhereHas($query, $relation, $constraint)
    {
        return $query->whereHas($relation, $constraint)
            ->with([$relation => $constraint]);
    }
}
