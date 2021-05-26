<?php
$chain = get_option('chain_id');

$currencies = BeApi::getCurrencies($chain)->Result;
$languages = BeApi::getLanguages($chain)->Result;

$hotelFolders = BeApi::getClientPropertyFolders($chain)->Result;
$hotelFromFolder = [];

foreach($hotelFolders as $hotelFolder) {
    if($hotelFolder->IsPropertyFolder == false) {
        array_push($hotelFromFolder, $hotelFolder);
    }
}