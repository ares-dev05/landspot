<?php

namespace App\Http\Controllers\Lotmix;

use App\Models\{InvitedUser, InvitedUserNotification, LotmixNotification};
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class LotmixNotificationController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @param Request $request
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View|array
     */
    public function index(Request $request)
    {
        if ($request->expectsJson()) {
            $lotmixNotifications = LotmixNotification::paginate(50);

            return compact('lotmixNotifications');
        }

        return $this->_view();
    }

    public function show(LotmixNotification $lotmixNotification)
    {
        if (\request()->expectsJson()) {
            return compact('lotmixNotification');
        }

        return $this->_view();
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function create()
    {
        return $this->_view();
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param \Illuminate\Http\Request $request
     * @return array
     * @throws \Exception
     */
    public function store(Request $request)
    {
        $postData = $this->validateRequest();
        $lotmixNotification = LotmixNotification::create($postData);
        $message = 'Notification created';

        return $this->prepareNotification($lotmixNotification, $message);
    }

    /**
     * @param LotmixNotification $lotmixNotification
     * @param string $message
     * @return array
     */
    protected function prepareNotification(LotmixNotification $lotmixNotification, $message)
    {
        if (object_get(\request(), 'is_sent', null)) {
            $invitedUsers = InvitedUser::all();

            foreach ($lotmixNotification->invitedUserNotification as $notification) {
                if ($invitedUsers->contains($notification->invited_user_id)) {
                    $notification->delete();
                }
            }

            foreach ($invitedUsers as $invitedUser) {
                $lotmixNotification->invitedUserNotification()->updateOrCreate([
                    'invited_user_id' => $invitedUser->id
                ], [
                    'deleted_at' => null
                ]);
            }

            $lotmixNotification->update([
                'sent_timestamp' => time()
            ]);

            $message .= ' and successfully sent';
        }

        return compact('message', 'lotmixNotification');
    }

    function send(LotmixNotification $lotmixNotification)
    {
        request()->merge([
            'is_sent' => 1
        ]);

        return $this->prepareNotification($lotmixNotification, 'Notification updated');
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param LotmixNotification $lotmixNotification
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View|array
     */
    public function edit(LotmixNotification $lotmixNotification)
    {
        if (\request()->expectsJson()) {
            return compact('lotmixNotification');
        }

        return $this->_view();
    }

    /**
     * Update the specified resource in storage.
     *
     * @param LotmixNotification $lotmixNotification
     * @return array
     * @throws \Exception
     */
    public function update(LotmixNotification $lotmixNotification)
    {
        $postData = $this->validateRequest();
        $lotmixNotification->update($postData);
        $message = 'Notification edited';

        return $this->prepareNotification($lotmixNotification, $message);
    }

    /**
     * @return array
     * @throws \Exception
     */
    protected function validateRequest()
    {
        return $this->validate(
            \request(),
            [
                'title' => 'required|max:150',
                'content' => 'required',
                'is_sent' => 'required|boolean',
            ]
        );
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param LotmixNotification $lotmixNotification
     * @return array
     */
    public function destroy(LotmixNotification $lotmixNotification)
    {
        $lotmixNotification->delete();
        $lotmixNotifications = LotmixNotification::paginate(50);
        $message = 'Notification removed';

        return compact('lotmixNotifications', 'message');
    }

    protected function _view()
    {
        return view('user.spa', ['rootID' => 'notifications']);
    }
    /**
     * @return array|\Illuminate\Http\RedirectResponse
     * @throws \Throwable
     */
    function unreadedNotification()
    {
        if (!\request()->expectsJson()) {
            return redirect()->route('/');
        }

        $invitedUser = auth()->user();

        $this->authorize('updateProfile', $invitedUser);

        $lotmixNotifications  = $invitedUser->lotmixNotification()->unread()->get();

        return compact('lotmixNotifications');
    }

    /**
     * @param InvitedUserNotification $invitedUserNotification
     * @return array
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    function closeNotification(InvitedUserNotification $invitedUserNotification)
    {
        /** @var InvitedUser $user */
        $user = auth()->user();
        $this->authorize('updateProfile', $user);

        $invitedUserNotification->update(['read_at' => time()]);

        $lotmixNotifications = $user->lotmixNotification()->unread()->get();

        return compact('lotmixNotifications');
    }
}
