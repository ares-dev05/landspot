<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TestUser extends Model
{
    // User Account details
    public $username = NULL;
    public $email = NULL;
    public $displayname = NULL;
    public $title = NULL;
    public $hash_pw = NULL;
    public $user_id = NULL;
    public $csrf_token = NULL;
    public $remember_me = NULL;
    public $remember_me_sessid = NULL;
    public $ll = NULL;
    public $ckey = NULL;
    public $domain = NULL;

    // Landconnect-specific details
    public $state_id = NULL;
    public $theme_id = NULL;
    public $builder_id = NULL;
    public $company_id = NULL;

    //
    public $has_multihouse = false;
    public $has_exclusive = false;


    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        // general user properties
        $this->user_id          = 1;
        $this->email            = "user@watersun.com.au";
        $this->username         = "user@watersun.com.au";
        $this->domain           = "watersun.landconnect.com.au";
        $this->title            = "New User";
        $this->displayname      = "John Jackson";
        $this->builder_id       = "Watersun";

        /**
         * @param company_id int the ID of the company that this user is assigned to (foreign key companies.id).
         *      Only houses from this company need to get displayed
         */
        $this->company_id       = 14;

        /**
         * @param state_id int the ID of the state that this user is from (foreign key houses_states.id);
         *      Only houses from this state should get displayed
         * 7    = Victoria
         * 4    = Queensland
         */
        $this->state_id         = 7;
        // uncomment the following line to switch the user to the Queensland state
        // $loggedInUser->state_id         = 4;

        /**
         * @param has_multihouse bool flag that indicates if this user has access to 'multihouse' ranges
         */
        $this->has_multihouse   = 0;

        /**
         * @param has_exclusive bool flag that indicates if the user has access to 'exclusive' ranges
         */
        $this->has_exclusive    = 0;
    }
}
