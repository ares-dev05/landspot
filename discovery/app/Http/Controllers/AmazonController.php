<?php

namespace App\Http\Controllers;

use App\Models\BlacklistEmail;
use Aws\Sns\Message as AWSMessage;
use Aws\Sns\MessageValidator;


class AmazonController extends Controller
{
    public function handleBounceOrComplaint()
    {
        //check that request for SNS
        $message = AWSMessage::fromRawPostData();
        $validator = new MessageValidator();
        $validator->validate($message);
        $messageData = json_decode($message['Message']);

        switch ($messageData->notificationType) {
            case 'Bounce':
                $bounce = $messageData->bounce;
                foreach ($bounce->bouncedRecipients as $bouncedRecipient) {
                    $emailAddress = $bouncedRecipient->emailAddress;
                    BlacklistEmail::firstOrCreate(['email' => $emailAddress]);
                }
                break;
            case 'Complaint':
                $complaint = $messageData->complaint;
                foreach ($complaint->complainedRecipients as $complainedRecipient) {
                    $emailAddress = $complainedRecipient->emailAddress;
                    BlacklistEmail::firstOrCreate(['email' => $emailAddress]);
                }
                break;
        }


        return ['status' => 200, "message" => 'success'];
    }
}
