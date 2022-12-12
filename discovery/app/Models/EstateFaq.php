<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Class EstateSnapshot
 * @property int id
 * @property int estate_id
 * @property int question_type
 * @property string answer
 * @property string question_name
 * @property Estate estate
 *
 */
class EstateFaq extends Model
{
    protected $table = 'estate_faq';
    protected $guarded = [];
    public $timestamps = false;

    /**
     * The array of document types.
     *
     * @var array
     */
    const QUESTIONS = [
        'Which local council is estate in?' => 0,
        'Who is the developer for estate?' => 1,
        'How many lots make up estate?' => 2,
        'What is the closest display home village to estate?' => 3,
    ];
    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['question_name'];

    /**
     * Relations
     */

    function estate(): BelongsTo
    {
        return $this->belongsTo(Estate::class);
    }

    /**
     * Attributes
     */

    /**
     * Get the stage name flag for the stage table.
     *
     * @return string
     */
    public function getQuestionNameAttribute(): string
    {
        return array_search($this->question_type, self::QUESTIONS);
    }
}
