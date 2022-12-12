<?php


namespace App\Services\DrawerThemeRebuilder;


use App\Models\File;
use App\Models\LotDrawerData;
use DOMDocument;
use DOMElement;
use DOMNodeList;
use Exception;

class LotDrawerSVG
{
    /** @var LotDrawerData */
    protected $drawerData;

    /**
     * LotDrawer constructor.
     * @param LotDrawerData $drawerData
     */
    public function __construct(LotDrawerData $drawerData)
    {
        $this->drawerData = $drawerData;
    }

    /**
     * @param DOMDocument $xml
     * @param string $class
     * @return DOMNodeList|DOMElement[]|false
     */
    public function findNodeByClass(DOMDocument $xml, string $class)
    {
        $finder = new \DOMXPath($xml);
        return $finder->query("//*[contains(@class, '{$class}')]");
    }

    /**
     * @return DOMDocument
     */
    protected function loadSVG() : DOMDocument
    {
        $path = File::storageUrl($this->drawerData->path);

        $svg = new DOMDocument;
        $svg->load($path);
        return $svg;
    }

    /**
     * @param string $svgRaw
     * @throws Exception
     */
    protected function uploadSVG(string $svgRaw)
    {
        $filePath = File::generateOSTempfilename('.svg');
        $fileName = basename($this->drawerData->path);
        file_put_contents($filePath, $svgRaw);
        File::storeToTempFolderFromPath($filePath, $fileName);
        $this->drawerData->path = File::moveTemporaryFileToStorage($fileName, LotDrawerData::$storageFolder);
        $this->drawerData->save();
    }

    /**
     * @param DrawerThemeData $themeData
     * @throws Exception
     */
    public function rebuildByTheme(DrawerThemeData $themeData)
    {
        $svg = $this->loadSVG();

        foreach($this->findNodeByClass($svg, 'title-font') as $node){
            $node->setAttribute('fill',$themeData->fontColor);
            $node->setAttribute('font-family',$themeData->fontType);
            $node->setAttribute('family',$themeData->fontType);
        }

        foreach($this->findNodeByClass($svg, 'label-font') as $node){
            $node->setAttribute('fill',$themeData->fontColor);

        }

        foreach($this->findNodeByClass($svg, 'line-stroke') as $node){
            $node->setAttribute('stroke', $themeData->boundaryColor);
            $node->setAttribute('stroke-width', $themeData->lineThickness);
            if ($node->hasAttribute('stroke-dasharray')){
                $node->setAttribute('stroke-dasharray', $themeData->lineThickness . ' ' . $themeData->lineThickness);
            }
        }

        foreach($this->findNodeByClass($svg, 'background-fill') as $node){
            $node->setAttribute('fill', $themeData->lotBackground);
        }

        $this->uploadSVG($svg->saveXML());
    }
}