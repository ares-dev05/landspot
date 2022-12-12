<?php

include_once("class.user.php");

/**
 * @var $loggedInUser loggedInUser the currently logged-in user
 */
$loggedInUser = NULL;

/**
 * sets up a test loggedInUser object
 */
function setupTestUser()
{
    global $loggedInUser;

    $loggedInUser                   = new loggedInUser();

    // general user properties
    $loggedInUser->user_id          = 1;
    $loggedInUser->email            = "user@watersun.com.au";
    $loggedInUser->username         = "user@watersun.com.au";
    $loggedInUser->domain           = "watersun.landconnect.com.au";
    $loggedInUser->title            = "New User";
    $loggedInUser->displayname      = "John Jackson";
    $loggedInUser->builder_id       = "Watersun";

    /**
     * @param company_id int the ID of the company that this user is assigned to (foreign key companies.id).
     *      Only houses from this company need to get displayed
     */
    $loggedInUser->company_id       = 14;

    /**
     * @param state_id int the ID of the state that this user is from (foreign key houses_states.id);
     *      Only houses from this state should get displayed
     * 7    = Victoria
     * 4    = Queensland
     */
    $loggedInUser->state_id         = 7;
    // uncomment the following line to switch the user to the Queensland state
    // $loggedInUser->state_id         = 4;

    /**
     * @param has_multihouse bool flag that indicates if this user has access to 'multihouse' ranges
     */
    $loggedInUser->has_multihouse   = 0;

    /**
     * @param has_exclusive bool flag that indicates if the user has access to 'exclusive' ranges
     */
    $loggedInUser->has_exclusive    = 0;
}

// comment this line to test that no user is logged-in
setupTestUser();

?>