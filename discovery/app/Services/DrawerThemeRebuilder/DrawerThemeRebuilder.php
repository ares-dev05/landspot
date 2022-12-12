<?php


namespace App\Services\DrawerThemeRebuilder;


use App\Models\Lot;
use App\Models\LotDrawerTheme;
use Exception;

class DrawerThemeRebuilder
{
    /** @var LotDrawerTheme */
    protected $drawerTheme;

    /** @var DrawerThemeData */
    protected $drawerThemeData;

    public function __construct($drawerThemeId)
    {
        $this->drawerTheme = LotDrawerTheme::findOrFail($drawerThemeId);
        $data = json_decode($this->drawerTheme->theme);
        $this->drawerThemeData = new DrawerThemeData($data->fontColor,$data->boundaryColor, $data->lotBackground, $data->lineThickness, $data->fontType, $data->fontSize, $data->lotLabelFontSize);
    }

    /**
     * @throws Exception
     */
    public function rebuild()
    {
        /** @var Lot[] $lots */
        $lots = $this->drawerTheme->stage->lots()->hasDrawerData()->get();
        foreach ($lots as $lot) {
            $drawer = new LotDrawerSVG($lot->drawerData);
            $drawer->rebuildByTheme($this->drawerThemeData);
        }
    }
}