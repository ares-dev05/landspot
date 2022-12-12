<?php
/**
 * Created by PhpStorm.
 * User: mihai
 * Date: 26/03/20
 * Time: 18:13
 */

namespace App\Models\Sitings;


class MigratableLegacySiting extends LegacySiting
{
    /**
     * In Migratable Sitings, we need to persist the session data so that we can re-encode it in the new format
     * @return bool
     */
    public function getPersistSessionData() { return true; }
}