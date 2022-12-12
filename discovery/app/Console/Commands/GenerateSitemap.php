<?php

namespace App\Console\Commands;

use App\Models\Company;
use App\Models\Estate;
use App\Models\State;
use Illuminate\Console\Command;
use Illuminate\Support\Str;
use Spatie\Sitemap\Sitemap;
use Landconnect\Blog\Models\Post;

class GenerateSitemap extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sitemap:generate';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generated the sitemap.xml file';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $lotmixUrl = config('app.LOTMIX_URL');
        //needed for connecting the lotmix blog database
        $_SERVER['HTTP_X_INSIGHTS_URL'] = parse_url($lotmixUrl, PHP_URL_HOST);
        $sitemap = Sitemap::create()
            ->add($lotmixUrl)
            ->add("$lotmixUrl/floorplans/")
            ->add("$lotmixUrl/land-for-sale/communities/")
            ->add("$lotmixUrl/land-estates/vic/")
            ->add("$lotmixUrl/sunpather/")
            ->add("$lotmixUrl/enquire/")
            ->add("$lotmixUrl/blog/")
            ->add("$lotmixUrl/insights/");

		$state 	 = State::byAbbrev('vic')->firstOrFail();
        $estates = Estate::byState($state)->lotmixPublic()->get();
        $companies = Company::getBriefAdminCompanies()->pluck('slug');
        $floorplans = Estate::getEstatesLotCount(['lotmix' => 1, 'published' => 1])[0]->pluck('slug');

        $floorplans->each(function ($floorplanSlug) use ($sitemap, $lotmixUrl){
            $sitemap->add("$lotmixUrl/land-for-sale/communities/$floorplanSlug/");
        });


        $companies->each(function ($companySlug) use ($sitemap, $lotmixUrl){
            $sitemap->add("$lotmixUrl/floorplans/homebuilder/$companySlug/");
        });

        $estates->each(function (Estate $estate) use ($sitemap, $lotmixUrl) {
            $estateName = Str::slug($estate->name);
            $estateSubrb = Str::slug($estate->suburb);
            $sitemap->add("$lotmixUrl/land-estates/vic/$estateSubrb/");
            $sitemap->add("$lotmixUrl/land-estates/vic/$estateSubrb/$estateName/");
        });

//        $posts	 = Post::all();
//        $posts->each(function (Post $post) use ($sitemap, $lotmixUrl) {
//            if($post->is_blog){
//                $sitemap->add("$lotmixUrl/blog/{$post->slug}/");
//            } else{
//                $sitemap->add("$lotmixUrl/insights/{$post->slug}/");
//            }
//        });

        $sitemap->writeToFile(public_path('sitemap.xml'));

        return $this->info('sitemap is generated');
    }
}
