<?php
/**
 * Created by PhpStorm.
 * User: volmarg
 * Date: 16.05.19
 * Time: 20:34
 */

namespace App\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class Utils extends AbstractExtension {


    public function getFunctions() {
        return [
            new TwigFunction('unset', [$this, '_unset']),
            new TwigFunction('keepMenuOpen', [$this, 'keepMenuOpen']),
        ];
    }

    public function _unset($array, $key) {
        unset($array[$key]);
        return $array;
    }

    /**
     * @param string $currUrl
     * @param string $pathUrl
     * @param string $searchedString
     * @param mixed $chidlrensSubmenuIds
     * @return string|void
     */
    public function keepMenuOpen(string $currUrl, string $pathUrl = '', string $searchedString = '',  $chidlrensSubmenuIds = '') {
        $dropdownOpenClass = 'open';

        if (!empty($pathUrl) && $currUrl == $pathUrl) {

            return $dropdownOpenClass;
        } elseif (!empty($searchedString) && strstr($currUrl, $searchedString)) {

            return $dropdownOpenClass;
        } elseif (!empty($chidlrensSubmenuIds)) {

            /**
             * Info: not a perfect solution, but fine for now
             *  might cause problems if url has some numbers in name (equal to child node id)
             */
            foreach ($chidlrensSubmenuIds as $childSubmenuId) {

                if (strstr($currUrl, $childSubmenuId)) {
                    return $dropdownOpenClass;
                }

            }

        }

        return;
    }

}