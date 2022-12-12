<?php

namespace App\Http\Controllers\Lotmix;

use App\Mail\InvitedUserDocumentCreated;
use Carbon\Carbon;
use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Contracts\View\Factory;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\{Brief,
    Builder,
    BuyerType,
    Estate,
    EstatePremiumFeatures,
    EstateShortList,
    House,
    InvitedUser,
    Lot,
    Region,
    ShortList,
    File,
    FloorplanShortList,
    ImageFromPDF,
    InvitedUserDocument,
    Sitings\MigratableLegacySiting,
    UnsubscribeUser,
    User,
    UserInvitedUsers
};
use App\Models\Sitings\Siting;
use Illuminate\Support\Collection;
use Illuminate\View\View;
use App\Http\Requests\{InviteUserRequest,
    ShareAccessRequest,
    UpdateMyClientDetails,
    UpdateMyClientInfo,
    UpdateShortList,
    UploadMyClientsFile
};
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\{Crypt, Mail, App};
use Illuminate\Mail\Message;
use PaginationHelper;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\HttpKernel\Exception\HttpException;

class MyClientsController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return Factory|View|array
     */
    public function index()
    {
        if (!request()->expectsJson()) {
            return view('user.spa', ['rootID' => 'my-clients']);
        }
        /** @var User $user */
        $user = auth()->user();

        $filters = request()->all();

        $result = [];

        if (request()->has('fullData')) {
            if ($user instanceof Builder) {
                $result['houses'] = $user->builderHouses->with('facades')->get() ?? [];
            } else {
                $estates = $user->estate();
                if (!$user->isGlobalAdmin() && !$user->isLandDeveloper()) {
                    $estates->whereHas('premiumFeatures', function (EloquentBuilder $b) {
                        $b->byType(EstatePremiumFeatures::FEATURE_LOTMIX);
                    });
                }
                $result['estates'] = $estates->with(['stage' => function ($b) {
                        $b->withAndWhereHas('lots', function ($b) {
                            $b->where('lotmix_visibility', Lot::lotmixVisibility['visible']);
                        });
                    }])
                        ->get() ?? [];
            }
            $result['company'] = $user->company;
        }

        if ($user->has_all_sitings) {
            $invitedUsers = $user->company->user->flatMap(function ($user) use ($filters) {
                $invitedUsers = $user->getInvitedUserForMyClientsTable($filters);
                $invitedUsers = $invitedUsers->map(function ($invitedUser) use ($user) {
                    $invitedUser->consultant = $user->display_name;
                    return $invitedUser;
                });
                return $invitedUsers;
            })->sortByDesc('id');
            if ($consultant = trim($filters['consultant'] ?? '')) {
                $invitedUsers = $invitedUsers->filter(function ($item) use ($consultant) {
                    return false !== stripos($item->consultant, $consultant);
                });
            }
        } else {
            $invitedUsers = $user->getInvitedUserForMyClientsTable($filters);
        }

        $companyId = $user->company_id;

        $notInvitedUsersData = InvitedUser::with([
            'userInvitations' => function ($q) {
                $q->where('status', '=', UserInvitedUsers::STATUS_BRIEF)
                    // ->whereNull('user_id')
                    ->whereNull('deleted_at');
            },
            'documents' => function ($q) use ($companyId) {
                $q->whereHas('user', function ($b) use ($companyId) {
                    $b->where('company_id', $companyId);
                });
            },
            'brief',
            'brief.companies',
            'brief.regions',
            'brief.estates',
            'brief.budget',
            'brief.buyerType',
            'brief.houseRequirement'
        ])
            ->whereHas('brief.companies', function ($query) use ($user) {
                $query->where('company_id', $user->company_id)
                    ->where(function ($q) {
                        $q->where('accepted_brief', true)
                            ->orWhere('accepted_brief', null);
                    });
            })
            ->get();

        $buyerTypes = BuyerType::all();
        $buildRegions = Region::all();
        $suburbSection = Estate::get(['id', 'suburb']);

        $newNotInvitedUsersData = collect($notInvitedUsersData)
            ->filter(function ($notInvitedUserData) use ($user, $buyerTypes, $suburbSection, $buildRegions) {
                $userInvitedUser = null;
                $userInvitedUser = $this->getFirstUserInvitedUser($user->is_brief_admin, $notInvitedUserData, $user->id);

                if (is_null($userInvitedUser)) {
                    return null;
                }

                $notInvitedUserData->accepted_brief = (bool)$notInvitedUserData->brief->companies
                    ->where('pivot.company_id', $user->company_id)
                    ->first()->pivot->accepted_brief;
                $notInvitedUserData->build_regions = $buildRegions;
                $notInvitedUserData->suburb_section = $suburbSection;
                $notInvitedUserData->buyer_types = $buyerTypes;
                $notInvitedUserData->setRelation('pivot', $userInvitedUser);
                $notInvitedUserData->unsetRelation('userInvitations');
                return (object)$notInvitedUserData;
            });

        $draftSitings = $this->getMySitings($user, $filters);
        $sortedClients = $invitedUsers->concat($draftSitings)->concat($newNotInvitedUsersData);
        $sortedClients = $sortedClients->sortByDesc(function ($client) {
            return $client->pivot ? $client->pivot->created_at : $client->created_at;
        });

        $result['clients'] = PaginationHelper::paginate($sortedClients->values(), 100);
        $result['chasLotmix'] = $user->can('hasLotmixAccess');
        $result['draftFeature'] = (bool)$user->draft_feature;
        $result['is_brief_admin'] = (bool)$user->is_brief_admin;
        $result['has_all_sitings'] = (bool)$user->has_all_sitings;
        return $result;
    }

    public function getFirstUserInvitedUser($isBriefAdmin, $notInvitedUserData, $value)
    {
        $value = $isBriefAdmin ? null : $value;
        return collect($notInvitedUserData->userInvitations)->firstWhere('user_id', $value);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param InviteUserRequest $request
     * @return InvitedUser|void|array|string[]
     * @throws \Throwable
     */
    public function store(InviteUserRequest $request)
    {
        /** @var User $authUser */
        $authUser = auth()->user();
        $company = $authUser->company;
        $isBuilder = $company->isBuilder();

        if (!$isBuilder && Estate::where('id', $request->estate)->whereHas('premiumFeatures', function ($b) {
                $b->byType(EstatePremiumFeatures::FEATURE_LOTMIX);
            })->doesntExist()) {
            return abort(409, 'This estate must be lotmix featured.');
        }
        /** @var InvitedUser $user */
        $user = InvitedUser::firstOrCreate(['email' => $request->email], $request->all());

        if ($request->has('siting_id')) {
            $siting = Siting::findOrFail($request->siting_id);
            $result = $user->processInvitation($siting);
            if (!isset($result['ajax_success'])) {
                return $result;
            }
            $siting->update([
                'status' => Siting::STATUS_COMPLETED,
            ]);

            $newUser = $authUser
                ->availableInvitedUsers()
                ->where('invited_users.id', $user->id)
                ->orderBy('id', 'DESC');

            if ($authUser->company->isDeveloper()) {
                $newUser->with('estateShortLists');
            }
            $newUser = $newUser->first();
            if ($newUser) {
                $newUser->recentlyCreated = true;
            }
            return $newUser;
        }

        $isInvited = $authUser->invitedUser->contains($user);
        if (!$isInvited) {
            $authUser->invitedUser()->attach($user, ['user_id' => $authUser->id]);
        } elseif ($isInvited) {
            $user->restoreInvitation($authUser->id);
        }

        if (!$isBuilder) {
            $userEstateShortList = $user->getEstateShortListByEstateId($request->estate);
            if ($isInvited && $userEstateShortList->isNotEmpty()) {
                return abort(409, 'User already invited to this estate.');
            }
            $user->estateShortLists()->updateOrCreate(['estate_id' => $request->estate]);
        }
        if ($user->unsubscribed()->doesntExist() && \EmailDisabledCheckHelper::checkEmail($user->email)) {
            $hash = Crypt::encrypt([
                'type' => UnsubscribeUser::USER_TYPE['client'],
                'email' => $user->email
            ]);
            $mailData = compact('user', 'authUser', 'hash');
            $userInvitations = UserInvitedUsers::byInvitedUser($user->id)
                ->byStatus(UserInvitedUsers::STATUS_CLAIMED)->withTrashed()->count();
            if ($user->wasRecentlyCreated || $userInvitations <= 0) {
                $mailData['invitationToken'] = $user->getInvitationMailToken($authUser->id);
            }
            Mail::send('emails.lotmix-invitation', $mailData, function (Message $msg) use ($user) {
                $msg->from(config('mail.support.lotmix'), config('app.LOTMIX_URL'))
                    ->to($user->email, $user->display_name)
                    ->subject("Activate your " . config('app.LOTMIX_URL') . " account");
            });
        }

        $newUser = $authUser
            ->availableInvitedUsers()
            ->where('invited_users.id', $user->id)
            ->orderBy('id', 'DESC');

        if ($authUser->company->isDeveloper()) {
            $newUser->with('estateShortLists');
        }
        $newUser = $newUser->first();
        $newUser->recentrlyCreated = true;

        return $newUser;
    }

    /**
     * Update the specified resource in storage.
     *
     * @param UpdateMyClientInfo $request
     * @param InvitedUser $invitedUser
     * @return array
     * @throws AuthorizationException
     */
    public function update(UpdateMyClientInfo $request, InvitedUser $invitedUser)
    {
        $this->authorize('editByUser', $invitedUser);
        $user = auth()->user()->findInvitedUserById($invitedUser->id);
        if (!$user) {
            abort(403, 'You can\'t update this user.');
        }
        if ($user->pivot->status != UserInvitedUsers::STATUS_PENDING) {
            abort(403, 'Only a client with a status of Pending can be edited');
        }

        $invitedUser->update($request->all());

        return ['ajax_success' => 'Updated!'];
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param InvitedUser $invitedUser
     * @return array
     * @throws AuthorizationException
     */
    public function destroy(InvitedUser $invitedUser)
    {
        $this->authorize('editByUser', $invitedUser);
        auth()->user()->deleteInvitedUser($invitedUser);

        return [
            'ajax_success' => 'User deleted from company.'
        ];
    }

    /**
     * @param InvitedUser $invitedUser
     * @return array
     */
    public function getShortList(InvitedUser $invitedUser)
    {
        /** @var User $user */
        $user = auth()->user();
        if (!$user->company->isDeveloper()) {
            throw new HttpException(400, 'Invalid company type');
        }

        $estateIds = $user->estate->pluck('id')->toArray();

        $shortLists = EstateShortList::byInvitedUser($invitedUser->id)
                ->with('shortList')
                ->whereIn('estate_short_lists.estate_id', $estateIds)
                ->get() ?? [];
        return compact('shortLists');
    }

    /**
     * @param UpdateShortList $request
     * @return array
     * @throws \Throwable
     */
    public function updateShortList(UpdateShortList $request)
    {
        /** @var User $user */
        $user = auth()->user();
        if (!$user->company->isDeveloper()) {
            throw new HttpException(400, 'Invalid company type');
        }
        $message = \DB::transaction(function () use ($request) {
            if (count($request->remove)) {

                $shortLists = ShortList::findMany(Arr::pluck($request->remove, 'id'));

                foreach ($shortLists as $shortList) {
                    $this->authorize('shortlisted', $shortList->estateShortList->estate);
                    $shortList->delete();
                }

                $ids = array_unique(Arr::pluck($request->remove, 'estate_short_list_id'));
                // delete all of the estate shortlist which does not have the shortlist
                EstateShortList::whereIn('id', $ids)->doesntHave('shortList')->delete();
            };

            foreach ($request->create as $shortList) {
                $estate = Estate::findOrFail($shortList['estate_id']);
                $this->authorize('shortlisted', $estate);

                $estateShortList = EstateShortList::firstOrCreate([
                    'invited_user_id' => $shortList['invited_user_id'],
                    'estate_id' => $shortList['estate_id']
                ]);

                $estateShortList->shortList()->create([
                    'lot_id' => $shortList['lot_id'],
                    'stage_id' => $shortList['stage_id']
                ]);
            }

            return 'Estate short list updated';
        });
        return compact('message');
    }

    /**
     * @param Request $request
     * @return array
     * @throws Exception
     */
    public function uploadFile(Request $request)
    {
        $request->validate([
            'file' => "required|file|max:100000|mimes:pdf,jpeg,png,jpg"
        ]);
        return ImageFromPDF::storeToTempFolder($request->file);
    }

    /**
     * @param InvitedUserDocument $document
     * @return Factory|View|StreamedResponse
     * @throws AuthorizationException
     */
    public function previewFile(InvitedUserDocument $document)
    {
        /** @var User $user */
        $user = auth()->user();
        $company = $user->company;

        $this->authorize('updateClientDocuments', $company);
        $this->authorize('viewDocument', $document);

        $document->increment('open_count');
        $fileURL = File::storageTempUrl($document->path, now()->addHours(1));
        $fileInfo = pathinfo(basename($fileURL));

        return $fileInfo['extension'] === 'pdf'
            ? view('layouts.pdf-viewer', compact('fileURL'))
            : File::appStorage()->download($document->path);
    }

    /**
     * @param UploadMyClientsFile $request
     * @return void|array
     * @throws Exception
     */
    public function addDocument(UploadMyClientsFile $request)
    {
        /** @var User $user */
        /** @var InvitedUser $invitedUser */
        $user = auth()->user();
        $company = $user->company;
        $invitedUser = InvitedUser::findOrFail($request->user_id);

        $this->authorize('updateClientDocuments', $company);

        if (File::appStorage()->exists($request->path)) {
            $documentInfo = pathinfo($request->path);
            $path = File::moveTemporaryFileToStorage($documentInfo['basename'], 'invited_user_documents');
            $thumb = null;
            if ($documentInfo['extension'] === 'pdf') {
                $thumb = File::moveTemporaryFileToStorage('thumb_' . $documentInfo['filename'] . '.png',
                    'invited_user_documents');
            }
            $documentCreated = $user->invitedUserDocuments()->create([
                'estate_id' => $request->estate_id ?? null,
                'invited_user_id' => $invitedUser->id,
                'type' => $request->type,
                'name' => $documentInfo['basename'],
                'path' => $path,
                'thumb' => $thumb
            ]);
            if ($documentCreated) {
                $documentCount = $user->invitedUserDocuments()->where('notified_at', '>',
                    Carbon::now()
                        ->subHours(1)
                        ->toDateTimeString()
                )->count();

                if ($documentCount === 0
                    && $invitedUser->unsubscribed()->doesntExist()
                    && \EmailDisabledCheckHelper::checkEmail($invitedUser->email)) {
                    $mail = Mail::to($invitedUser->email);
                    if (App::environment('production')) {
                        $mail->bcc(config('mail.support.jobsBCC'));
                    }
                    $token = null;
                    if (!$invitedUser->userInvitations()->byStatus(UserInvitedUsers::STATUS_CLAIMED)->count()) {
                        $invitation = $invitedUser->userInvitations()
                            ->byStatus(UserInvitedUsers::STATUS_PENDING)
                            ->first();

                        $token = $invitation ? $invitedUser->getHashedToken($invitation->invitation_token) : null;
                    }
                    $mail->queue(new InvitedUserDocumentCreated($invitedUser, $user, $token));
                    $documentCreated->update(['notified_at' => Carbon::now()]);
                }
            }
        } else {
            return abort(404, 'File not found. Please upload the file again.');
        }

        $documents = $invitedUser->documents()->whereHas('user', function ($b) use ($user) {
            $b->where('company_id', $user->company_id);
        });
        $documents = $documents->get();
        return compact('documents');
    }

    /**
     * @param InvitedUser $invitedUser
     * @return array
     * @throws AuthorizationException
     */
    public function getMyClientDetails(InvitedUser $invitedUser)
    {
        /** @var User $user */
        $user = auth()->user();
        $company = $user->company;

        $this->authorize('updateClientDocuments', $company);
        $sitings = $invitedUser->builderSiting()->withoutGlobalScope('userVisibility')->get();
        $res['sitings'] = $this->addAbsoluteURL($sitings);

        $documents = $invitedUser->documents()->whereHas('user', function ($b) use ($user) {
            $b->where('company_id', $user->company_id);
        });

        $res['documents'] = $documents->get();
        $res['accepted_brief'] = $invitedUser->brief && $this->checkAcceptedBrief($invitedUser->brief->companies, $company->id);
        $res['shortLists'] = $invitedUser->load([
            'floorplanShortLists' => function ($b) use ($company) {
                $b->whereHas('house.range', function (EloquentBuilder $b) use ($company) {
                    $b->byCompanyId($company->id);
                });
            }
        ])->setVisible(['floorplanShortLists'])->floorplanShortLists;

        return $res;
    }

    public function checkAcceptedBrief(Collection $companies, int $companyId): bool
    {
        $data = $companies->filter(function ($company) use ($companyId) {
            if (is_null($company->pivot->accepted_brief)) {
                return null;
            }
            return (((bool)$company->pivot->accepted_brief === true) && ($companyId === $company->id));
        });
        return $data->isNotEmpty();
    }

    /**
     * @param UpdateMyClientDetails $request
     * @return array
     * @throws AuthorizationException
     */
    public function updateMyClientDetails(UpdateMyClientDetails $request)
    {
        // floorplanshortlist
        /** @var User $user */
        $user = auth()->user();
        $company = $user->company;

        $this->authorize('updateFloorplanShortList', $company);

        $message = \DB::transaction(function () use ($request, $company, $user) {
            if (count($request->removedShortLists)) {
                $removedIds = Arr::pluck($request->removedShortLists, 'id');
                FloorplanShortList::whereHas('house.range', function (EloquentBuilder $b) use ($company) {
                    $b->byCompanyId($company->id);
                })
                    ->whereIn('id', $removedIds)
                    ->delete();
            };

            foreach ($request->createdShortLists as $floorplanShortList) {
                $house = House::findOrFail($floorplanShortList['house_id']);
                $this->authorize('view', $house);

                FloorplanShortList::firstOrCreate([
                    'invited_user_id' => $floorplanShortList['invited_user_id'],
                    'house_id' => $house->id,
                    'facade_id' => $floorplanShortList['facade_id']
                ]);
            }

            if (count($request->removedDocuments)) {
                $deleteDocuments = InvitedUserDocument::whereIn('id', $request->removedDocuments)->get();
                $deleteDocuments->each(function ($document) {
                    $document->deleteFile();
                });
            }

            return 'User details updated';
        });

        return compact('message');
    }

    /**
     * @param Request $request
     * @return array
     */
    public function deleteMyClientSitings(Request $request, InvitedUser $invitedUser)
    {
        $request->validate([
            'siting_id' => 'required|integer|exists:sitings,id',
        ]);

        $invitedUser->builderSiting()->detach($request->siting_id);

        $id = auth()->user()->company_id;
        $sitings = $invitedUser->builderSitingByCompanyId($id);

        return compact('sitings');
    }

    /**
     * @param Builder|User $user
     * @param array $filters
     * @return Collection
     */
    private function getMySitings($user, array $filters = []): Collection
    {
        $query = $user->siting()
            ->where(function ($b) {
                $b->where(function ($b) {
                    $b->byStatus(Siting::STATUS_DRAFT);
                })->orWhere(function ($b) {
                    $b->withUnfinishedSiting();
                });
            })
            ->orderBy('created_at', 'desc');

        $sharedSitingQuery = Siting::whereHas('sharedSiting', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        });

        if ($firstName = trim($filters['firstName'] ?? '')) {
            $query->where('first_name', 'like', "%{$firstName}%");
            $sharedSitingQuery->where('first_name', 'like', "%{$firstName}%");
        }

        if ($lastName = trim($filters['lastName'] ?? '')) {
            $query->where('last_name', 'like', "%{$lastName}%");
            $sharedSitingQuery->where('last_name', 'like', "%{$lastName}%");
        }

        $sitings = $query->get()->each->append('protectedFileURL') ?? collect([]);
        $shredSitings = $sharedSitingQuery->withoutGlobalScope('userVisibility')->get();

        return $this->addAbsoluteURL($sitings->merge($shredSitings));
    }

    /**
     * @return array
     */
    public function getLegacySitings()
    {
        /** @var Builder| $user */
        $user = auth()->user();
        $legacySitings = $user->legacySiting()
                ->orderBy('date', 'desc')
                ->limit(250)
                ->get() ?? collect([]);
        $draftFeature = (bool)$user->draft_feature;
        return compact('legacySitings', 'draftFeature');
        // return $this->addImportURL($legacySitings);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param Siting $siting
     * @return array
     * @throws AuthorizationException
     * @throws Exception
     */
    public function deleteMySiting(Siting $siting)
    {
        $this->authorize('update', $siting);
        /** @var Builder| $user */
        $user = auth()->user();

        $siting->delete();
        $result['sitings'] = $this->getMySitings($user);
        $result['draftFeature'] = (bool)$user->draft_feature;
        return $result;
    }

    /**
     * Add absolute_url attribute to each value in collection
     *
     * @param Collection $sitings
     * @return Collection
     */
    protected function addAbsoluteURL($sitings): Collection
    {
        return $sitings->map(function (Siting $siting) {
            $siting->append(['statusLabel', 'absoluteUrl', 'protectedFileURL']);
            $siting['fileURL'] = $siting->fileURL;
            return $siting;
        });
    }

    /**
     * @param InvitedUser $invitedUser
     * @return array
     * @throws AuthorizationException
     */
    public function getAvailableManagers(InvitedUser $invitedUser)
    {
        if (!$invitedUser->brief) {
            $this->authorize('editByUser', $invitedUser);
        }

        /** @var User $manager */
        $manager = auth()->user();

        $managers = User::byCompany($manager->company_id)
            ->activeAccount()
            ->where('id', '!=', $manager->id)
            ->with([
                'availableInvitedUsers' => function ($b) use ($invitedUser) {
                    $b->byId($invitedUser->id);
                }
            ])->get(['id', 'display_name']);

        return compact('managers');
    }

    /**
     * @param Siting $siting
     * @return array
     * @throws AuthorizationException
     */
    public function getSitingManagers(Siting $siting)
    {
        $this->authorize('editByUser', $siting);
        /** @var User $manager */
        $manager = auth()->user();

        $managers = User::byCompany($manager->company_id)
            ->activeAccount()
            ->where('id', '!=', $manager->id)
            ->with([
                'sharedSiting' => function ($b) use ($siting) {
                    $b->bySitingId($siting->id);
                }
            ])->get(['id', 'display_name']);

        return compact('managers');
    }

    /**
     * @param ShareAccessRequest $request
     * @param Siting $siting
     * @return array
     * @throws AuthorizationException
     */
    function shareDraftSiting(ShareAccessRequest $request, Siting $siting)
    {
        $this->authorize('editByUser', $siting);
        /** @var User $authUser */
        $authUser = auth()->user();

        foreach ($request->deletedManagers as $manager) {
            /** @var User $user */
            $user = User::findOrFail($manager['id']);
            $user->sharedSiting()->where('siting_id', $siting->id)->delete();
        }

        foreach ($request->selectedManagers as $manager) {
            /** @var User $user */
            $user = User::findOrFail($manager['id']);
            $user->sharedSiting()->create(['siting_id' => $siting->id]);
            if ($user->unsubscribed()->doesntExist() && \EmailDisabledCheckHelper::checkEmail($user->email)) {
                Mail::send('emails.share-draft-siting', compact('authUser', 'user'),
                    function (Message $msg) use ($user) {
                        $msg->from(config('mail.from.address'), config('mail.from.name'))
                            ->to($user->email, $user->display_name)
                            ->subject("You have a draft siting shared with you");
                    });
            }
        }

        $response = $this->getSitingManagers($siting);
        $response['message'] = [
            'success' => "Draft Siting access shared"
        ];

        return $response;
    }

    /**
     * @param ShareAccessRequest $request
     * @param InvitedUser $invitedUser
     * @return array
     * @throws AuthorizationException
     */
    function shareBuyerCredentials(ShareAccessRequest $request, InvitedUser $invitedUser)
    {
        if (!$invitedUser->brief) {
            $this->authorize('editByUser', $invitedUser);
        }

        /** @var User $authUser */
        $authUser = auth()->user();

        foreach ($request->deletedManagers as $manager) {
            /** @var User $user */
            $user = User::findOrFail($manager['id']);
            $this->authorize('shareClient', $user);
            $user->invitedUser()->detach($invitedUser);
        }

        foreach ($request->selectedManagers as $manager) {
            /** @var User $user */
            $user = User::findOrFail($manager['id']);
            $this->authorize('shareClient', $user);

            $userInvitation = $invitedUser->userInvitations()->byLandSpotUser($user->id)->first();
            if (
                $user->invitedUser()->byId($invitedUser->id)->doesntExist() ||
                ($userInvitation && $userInvitation->trashed())
            ) {
                $status = $invitedUser->brief
                    ? UserInvitedUsers::STATUS_BRIEF
                    : $invitedUser->landSpotUser()->wherePivot('user_id', $authUser->id)->first(['status'])->status;

                $userInvitation
                    ? $userInvitation->restore()
                    : $user->invitedUser()->attach($invitedUser, [
                    'user_id' => $user->id,
                    'invitation_token' => '',
                    'status' => $status ?: UserInvitedUsers::STATUS_PENDING
                ]);
                if ($user->unsubscribed()->doesntExist() && \EmailDisabledCheckHelper::checkEmail($user->email)) {
                    $msg = "{$authUser->display_name} has shared a new client with you";
                    Mail::send('emails.share-client-data', compact('invitedUser', 'user', 'msg'),
                        function (Message $msg) use ($user) {
                            $msg->from(config('mail.from.address'), 'Landconnect')
                                ->to($user->email, $user->display_name)
                                ->subject('New Client has been added to your "My Clients"');
                        });
                }
            }
        }

        $response = $this->getAvailableManagers($invitedUser);
        $response['message'] = [
            'success' => "Client Details shared"
        ];

        return $response;
    }

    /**
     * @param Siting $siting
     * @param Request $request
     * @return array
     * @throws \Throwable
     */
    function cloneSiting(Siting $siting, Request $request)
    {
        $request->validate([
            'clientId' => 'sometimes|required|exists:invited_users,id'
        ]);
        $invitedUser = null;
        if ($request->clientId) {
            $invitedUser = InvitedUser::find($request->clientId);
        }
        return $siting->cloneSiting($siting, false, $invitedUser);
    }

    /**
     * Imports a siting from the sitting_sessions table
     *
     * @param int $sitingId
     * @return array
     * @throws AuthorizationException
     */
    function importLegacy($sitingId)
    {
        $this->authorize('create', Siting::class);
        // Create a blank siting
        $newSiting = auth()->user()->siting()->create();


        // Fetch the legacy session, if it is owned by this user
        $legacySiting = MigratableLegacySiting::find($sitingId);

        // Load the old siting into the newly created one, if it is found
        if ($legacySiting && $legacySiting->uid === auth()->user()->id) {
            $newSiting->migrate($legacySiting);
        }
        $newSiting->append('absoluteUrl');

        return compact('newSiting');
    }

    public function briefAction(Request $request)
    {
        $request->validate([
            'brief_id' => 'required|exists:briefs,id',
            'accepted_brief' => 'required|boolean'
        ]);
        /*  @var $user User */
        $user = auth()->user();
        $companyId = $user->company_id;

        $brief = Brief::findOrFail($request->brief_id);

        $brief->companies()
            ->sync([$companyId => ['accepted_brief' => $request->accepted_brief]], false);

        $minPrice = ((20 / 100) * $brief->budget->total_budget);
        $maxPrice = $brief->budget->total_budget + ((10 / 100) * $brief->budget->total_budget);
        $floorplans = $user->builderHouses
            ->with('facades')
            ->join('house_attributes', 'house_attributes.house_id', '=', 'houses.id')
            ->where('beds', $brief->houseRequirement->bedrooms)
            ->where('story', $brief->houseRequirement->double_story ? 2 : 1)
            ->whereBetween('price', [$minPrice, $maxPrice])
            ->orderBy('price')
            ->limit(3)
            ->get();

        $floorplans->map(function ($floorplan) use ($brief) {
            FloorplanShortList::create([
                'invited_user_id' => $brief->invited_user_id,
                'house_id' => $floorplan->id,
                'facade_id' => $floorplan->facades->first()->id
            ]);
        });

        return response()->json([
            'success' => true
        ], 200);
    }

    public function downloadBriefPDF(Brief $brief)
    {
        $exists = File::appStorage()->exists($brief->file_path);
        return $exists
            ? File::appStorage()->download($brief->file_path)
            : response()->json([
                'success' => false,
                'message' => 'Brief file was not found.'
            ], 404);
    }

    /**
     * @param Siting $siting
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View|StreamedResponse
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    function sitingPreview(Siting $siting)
    {
        $this->authorize('view', $siting);
        config(['title' => "{$siting->first_name} {$siting->last_name} siting"]);
        if (!$siting->path) {
            abort(404, "This sitting doesn't have a pdf preview");
        }
        $fileURL = File::storageTempUrl($siting->path, now()->addHours(1));
        return view('layouts.pdf-viewer', compact('fileURL'));
    }
}
