<?php

namespace App\Http\Controllers\Lotmix;

use App\Http\Requests\Brief\VerifySMSCodeRequest;
use App\Http\Requests\EnquireCompaniesRequest;
use App\Http\Requests\EnquireForm;
use App\Http\Requests\EnquireFormBuilder;
use App\Mail\SendEmailEnquire;
use App\Mail\SendEmailEnquireOnce;
use App\Models\BuyerType;
use App\Models\Company;
use App\Models\Estate;
use App\Models\HouseState;
use App\Models\InvitedUser;
use App\Models\Lot;
use App\Models\Region;
use App\Models\State;
use App\Models\User;
use Exception;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class EnquireController extends Controller
{
    /**
     * @param Company $company
     * @param EnquireFormBuilder $request
     * @return array
     * @throws Exception
     */
    public function companyEnquireMessage(Company $company, EnquireFormBuilder $request): array
    {
        /** @var InvitedUser $user */
        $user = InvitedUser::where('phone', $request->phone)->firstOrFail();
        $buyerType = BuyerType::findOrFail($request->buyerTypeId)->name;
        $region = Region::findOrFail($request->regionId)->name;
        $type = 'builder';

        if (empty($company->email)) {
            throw new Exception("Company hasn't address email");
        } else {
            $mail = Mail::to($company->email);
            if (App::environment('production')) {
                $mail->bcc(config('mail.support.jobsBCC'));
            }

            $mail->queue(new SendEmailEnquire($user, compact('type', 'region', 'buyerType')));

            $emailAlert = "Company enquiry has been successfully submited";
        }
        return compact('emailAlert');
    }

    /**
     * @param Estate $estate
     * @param EnquireForm $request
     * @return array
     */
    public function estateEnquireMessage(Estate $estate, EnquireForm $request): array
    {
        /** @var InvitedUser $user */
        $user = InvitedUser::where('phone', $request->phone)->firstOrFail();

        $mail = Mail::to($estate->estateManager);
        if (App::environment('production')) {
            $mail->bcc(config('mail.support.jobsBCC'));
        }
        $lotNumber = Lot::find($request->lotId)->lot_number;
        $estateName = $estate->name;
        $type = 'estate manager';

        $mail->queue(new SendEmailEnquire($user, compact('type', 'estateName', 'lotNumber')));

        $emailAlert = "Estate enquiry has been successfully submited";
        return compact('emailAlert');
    }

    /**
     * @param EnquireCompaniesRequest $request
     * @return bool[]
     */
    public function companiesEnquireMessage(EnquireCompaniesRequest $request): array
    {
        /** @var InvitedUser $user */
        $user = InvitedUser::where('phone', $request->phone)->firstOrFail();

        $single_story = $request->stories['single_story'];
        $double_story = $request->stories['double_story'];

        $data = [
            'buyer_type' => BuyerType::findOrFail($request->finance['buyerTypeId'])->name,
            'pre_approval' => $request->finance['preApproval'],
            'land' => $request->land,
            'suburbs' => Estate::find($request->landForm['selectedSuburbs'])->pluck('suburb')->implode(','),
            'lot_number' => $request->landForm['lotNumber'] ?? null,
            'street_name' => $request->landForm['streetName'] ?? null,
            'estate_name' => $request->landForm['estateName'] ?? null,
            'region' => Region::findOrFail($request->region)->name,
            'house_requirements' => [
                'bedrooms' => $request->houseRequirements['bedrooms'],
                'bathrooms' => $request->houseRequirements['bathrooms'],
                'story' => ($single_story && $double_story) ? 'both' : ($single_story ? 'single' : 'double')
            ]
        ];

        $companies = Company::whereIn('id', $request->companies)
            ->whereNotNull('email')
            ->pluck('email');

        if (!$companies->isEmpty()) {
            $companies->map(function ($mail) use ($user, $data) {
                $mail = Mail::to($mail);
                if (App::environment('production')) {
                    $mail->bcc(config('mail.support.jobsBCC'));
                }

                $mail->queue(new SendEmailEnquireOnce($user, 'Brief Admin', $data));
            });
        }

        return ['success' => true];
    }

    /**
     * @param EnquireForm $request
     * @return JsonResponse
     * @throws Exception
     */
    public function sendSMSVerification(EnquireForm $request): JsonResponse
    {
        $message = 'This is code to verification for enquiry form. Never tell anyone this code.';

        /** @var InvitedUser $invitedUser */
        $invitedUser = InvitedUser::updateOrCreate(
            ['phone' => $request->phone],
            [
                'first_name' => $request->firstName ?? '',
                'last_name' => $request->lastName ?? '',
                'email' => $request->email ?? '',
                'phone' => $request->phone,
                'last_sign_in_stamp' => time(),
                'password' => '',
                'accepted_tos' => $request->tos ?? false,
            ]
        );

        $code = $invitedUser->generateCode();

        $invitedUser->smsVerification()->updateOrCreate(
            ['invited_user_id' => $invitedUser->id],
            ['code' => Hash::make($code)]
        );

        $invitedUser->sendSMS($code . ' ' . $message, $request->phone);

        return response()->json([
            'codeSent' => true
        ], 200);
    }

    /**
     * @param VerifySMSCodeRequest $request
     * @return JsonResponse
     */
    public function verifySMSCode(VerifySMSCodeRequest $request): JsonResponse
    {
        $invitedUser = InvitedUser::where('phone', $request->phone)
            ->with('smsVerification')
            ->firstOrFail();

        if (!$invitedUser->smsVerification) {
            return response()->json(['verified' => false, 'message' => 'Code not found'], 404);
        }

        if (!Hash::check($request->code, $invitedUser->smsVerification->code)) {
            return response()->json(['verified' => false, 'message' => 'Code does not match'], 400);
        }

        $invitedUser->smsVerification->update(['verified' => true]);

        return response()->json(['verified' => true]);
    }

    /**
     * @param Company $company
     * @return Collection
     */
    public function getBuilders(Company $company): Collection
    {
        return $company->where('type', 'builder')
            ->whereHas('user', function ($query) {
                $query->where('is_brief_admin', true);
            })->get();
    }

    /**
     * @return Collection
     */
    public function getRegions(): Collection
    {
        return Region::get(['id', 'name']);
    }

    /**
     * @param Region $region
     * @return Collection
     */
    public function getSuburbs(Region $region): Collection
    {
        $state = State::byAbbrev('VIC')->first();
        return Estate::where('region_id', $region->getKey())
            ->byState($state)
            ->orderBy('suburb', 'asc')
            ->get(['id', 'region_id', 'company_id', 'name', 'state_id', 'suburb'])
            ->unique('suburb')
            ->values();
    }

    /**
     * @return Collection
     */
    public function getStates(): Collection
    {
        return HouseState::get(['id', 'name']);
    }

    /**
     * @return JsonResponse
     */
    public function getBuyerTypes()
    {
        return BuyerType::get(['id', 'name']);
    }
}
