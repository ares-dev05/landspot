<?php

namespace App\Http\Controllers\Lotmix;

use App\Facades\HouseRepository;
use App\Http\Controllers\Controller;
use App\Models\InvitedUserDocument;
use App\Models\{
    Company,
    File,
    FloorplanShortList,
    House,
    InvitedUser,
    Estate,
    Lot,
    UnsubscribeUser,
    User
};
use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\{Crypt};
use Illuminate\Contracts\View\Factory;
use Illuminate\Support\Collection;
use Illuminate\View\View;
use Landconnect\Blog\Models\Post;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LotmixController extends Controller
{
    function index()
    {
        $title = 'Lotmix - House and Land';
        $relatedPosts = Post::with(['topic:id,title', 'thumb'])
            ->where('is_blog', 0)
            ->orderBy('id', 'desc')
            ->take(2)
            ->get();

        $companies = Company::getBriefAdminCompanies();

        $houses = $companies->flatMap(function (Company $company) {
            $userFilters['range'] = $company->getLotmixUserFilters()->toArray();
            /** @var Collection $houses */
            $houses = HouseRepository::applyFilterAttributesEB($userFilters)->get();
            $houses = $houses->map(function (House $model) use ($company) {
                $house = new \stdClass();
                $model->randomFacadeImage = true;
                $house->image = $model->image;
                $house->companyLogo = $company->company_small_logo ?? $company->company_logo ?? '';
                $house->title = $model->title;
                return $house;
            });

            return $houses;
        })->random(3);

        [$estates, $lots] = Estate::getEstatesLotCount(['lotmix' => 1, 'published' => 1]);

        $estates = Estate::transformCoordsAndSmallImage($estates);

        $lots = $lots->map(function (Lot $model) use ($estates) {
            $estate = $estates->first(function ($item) use ($model) {
                return collect(explode(',', $item->lot_ids))->contains($model->getKey());
            });
            $model->company_image = $estate->logo ?? $estate->smallImage ?? '';
            $model->rotation = $model->drawerData->rotation;
            return $model;
        })->random(3);

        return view('lotmix.home', compact('relatedPosts', 'title', 'lots', 'houses'));
    }

    public function showUnsubscribe(Request $request, $hash)
    {
        self::getUserByEncrypt($hash);

        return view('lotmix.unsubscribe', compact('hash'));
    }

    public function unsubscribe(Request $request, $hash)
    {
        $user = self::getUserByEncrypt($hash);
        $user->unsubscribed()->create();

        return redirect()->route('homepage');
    }

    private function getUserByEncrypt(string $hash)
    {
        $data = Crypt::decrypt($hash);
        switch ($data['type']) {
            case UnsubscribeUser::USER_TYPE['client']:
                $user = InvitedUser::findByEmail($data['email']);
                break;
            case UnsubscribeUser::USER_TYPE['user']:
                $user = User::findByEmail($data['email']);
                break;
            default:
                abort(404, 'Error user type');
        }
        if ($user->unsubscribed) {
            abort(409, 'User already unsubscribed');
        }
        return $user;
    }



    //region
    //TODO: deprecated
    /**
     * @param Company $company
     * @return array
     * @throws AuthorizationException
     */
    function getCompany(Company $company)
    {
        /** @var InvitedUser $user */
        $user = auth()->user();

        $sitings = $user->builderSiting()
            ->wherePivot('company_id', $company->id)
            ->whereNotNull('house')
            ->get();
        $sitings->each->append(['imageURL', 'sittingHouseByTitle']);

        $houses = array_key_exists($company->id, $user->getBuilderCompanies())
            ? $company->getRandomHousesWithFacades(3)
            : [];

        $documents = $user->documents()
                ->whereHas('user', function ($q) use ($company) {
                    $q->where('company_id', $company->id);
                })->get() ?? [];
        $documents->each->append('fileURL');


        return compact('company', 'documents', 'houses', 'sitings');
    }


    /**
     * @param Estate $estate
     * @return array
     * @throws Exception
     */
    public function getDocumentsByEstate(Estate $estate)
    {
        /** @var InvitedUser $user */
        $user = auth()->user();

        $documents = $user->document()
                ->where('estate_id', $estate->id)
                ->get() ?? [];
        $documents->each(function (InvitedUserDocument $document) {
            $document->append('fileURL');
        });
        return compact('documents');
    }

    /**
     * @param Estate $estate
     * @return array
     */
    function getEstate(Estate $estate)
    {
        return compact('userData');
    }

    /**
     * @return array
     */
    function getClientShortlist()
    {
        /** @var InvitedUser $user */
        $user = auth()->user();
        return $user->getShorList();
    }

    /**
     * @param Lot $lot
     * @return array
     * @throws AuthorizationException
     * @throws Exception
     */
    function toggleShortlistLot(Lot $lot)
    {

        /** @var InvitedUser $user */
        $user = auth()->user();
        /** @var Estate $estate */
        $estate = $lot->stage->estate;

        $shl = $user->getShortListByLotId($lot->id);
        if ($shl) {
            $shl->delete();
        } else {
            $estateShortList = $estate->estateShortLists()->firstOrCreate(['invited_user_id' => $user->id]);

            $estateShortList->shortList()->create([
                'lot_id' => $lot->id,
                'stage_id' => $lot->stage->id
            ]);
        }
        $shortlistLotsIds = $user->getShortListsByEstateId($estate->id)->pluck('lot_id');

        return compact('shortlistLotsIds');
    }

    /**
     * @param House $house
     * @return array
     * @throws AuthorizationException
     * @throws Exception
     */
    function toggleShortlistHouse(House $house)
    {
        /** @var InvitedUser $user */
        $user = auth()->user();

        if ($house->discovery != House::DISCOVERY_ENABLE) {
            throw new Exception('House cannot be added to shortlist');
        }

        /** @var FloorplanShortList|null $shh */
        $shh = $user->floorplanShortLists()
            ->where('house_id', $house->id)
            ->first();

        if ($shh) {
            $shh->delete();
        } else {
            $user->floorplanShortLists()->create([
                'house_id' => $house->id,
                'facade_id' => $house->facades()->first()->id
            ]);
        }

        $shortlistHouseIds = $user->floorplanShortLists()->pluck('house_id');
        return compact('shortlistHouseIds');
    }

    /**
     * @param InvitedUserDocument $document
     * @return Factory|View|StreamedResponse
     */
    public function previewFile(InvitedUserDocument $document)
    {
        $document->increment('open_count');
        $fileURL = File::storageTempUrl($document->path, now()->addHours(1));
        $fileInfo = pathinfo(basename($fileURL));

        return $fileInfo['extension'] === 'pdf'
            ? view('layouts.pdf-viewer', compact('fileURL'))
            : File::appStorage()->download($document->path);
    }
    //endregion
}
