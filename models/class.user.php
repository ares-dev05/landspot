<?php


class loggedInUser {

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

}

?>