<?php

namespace Landconnect\Blog\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Landconnect\Blog\Models\Subscription;

class SubscriptionController extends Controller
{
    function subscribe(Request $request)
    {
        if (!request()->expectsJson()) {
            return view('blog::insights.index', compact('theme'));
        }

        $subscriberData = $this->validate(
            $request,
            [
                'email' => 'email|required',
            ]
        );

        $subscriptionProvider = Subscription::i()->getProvider();

        $message = 'You are already subscribed to the newsletter';
        if (!$subscriptionProvider->hasMember($subscriberData['email'])) {
            $result = $subscriptionProvider->subscribe($subscriberData['email']);
            $message = $result['msg'] ?? 'Thank you for subscribing';
        }
        return compact('message');
    }
}
