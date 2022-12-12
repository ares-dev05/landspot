<?php namespace App\Services\DrawerThemeRebuilder;

class DrawerThemeData
{
    public $fontColor;
    public $boundaryColor;
    public $lotBackground;
    public $lineThickness;
    public $fontType;
    public $fontSize;
    public $lotLabelFontSize;

    /**
     * DrawerThemeData constructor.
     * @param $fontColor
     * @param $boundaryColor
     * @param $lotBackground
     * @param $lineThickness
     * @param $fontType
     * @param $fontSize
     * @param $lotLabelFontSize
     */
    public function __construct($fontColor, $boundaryColor, $lotBackground, $lineThickness, $fontType, $fontSize, $lotLabelFontSize)
    {
        $this->fontColor = $fontColor;
        $this->boundaryColor = $boundaryColor;
        $this->lotBackground = $lotBackground;
        $this->lineThickness = $lineThickness;
        $this->fontType = $fontType;
        $this->fontSize = $fontSize;
        $this->lotLabelFontSize = $lotLabelFontSize;
    }
}