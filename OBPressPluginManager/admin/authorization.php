<?php

require_once(WP_PLUGIN_DIR . '/OBPressPluginManager/BeApi/BeApi.php');


if(isset($_POST['input-plugin-token']) && (isset($_POST['input-plugin-chain-id']) || isset($_POST['input-plugin-hotel-id']))) {
  if(!empty($_POST['input-plugin-token']) && (!empty($_POST['input-plugin-chain-id']) || isset($_POST['input-plugin-hotel-id']))) {
    $token = isset($_POST['input-plugin-token']) ? trim($_POST['input-plugin-token']) : '';
    $chainOrHotel = $_POST['type_setup'];
    $chainId = $_POST['input-plugin-chain-id'];
    $hotelId = $_POST['input-plugin-hotel-id'];
    $defaultCurrency = null;
    $defaultLanguage = null;    

    if($chainOrHotel == 'chain') {
        update_option('chain_id', $chainId);
        update_option( "hotel_id", null );
    }
    else{
        update_option( "hotel_id", $hotelId );
        update_option( "chain_id", null );        
    }

    update_option('obpress_api_set', true);
    update_option('obpress_api_token', $token);

    $authorization = checkAuthorization($chainId, $hotelId, $chainOrHotel);

    if($authorization == false) {
        update_option('obpress_api_set', false);
    }

    if($authorization == true) {
        if(!empty($chainId)){
            $defaultCurrency = BeApi::getCurrencies($chainId)->Result[0]->UID;

            $defaultLanguageId = BeApi::getLanguages($chainId)->Result[0]->UID;
            $defaultLanguage = returnLanguageByCode($defaultLanguageId);

            update_option('default_currency_id', $defaultCurrency);
            update_option('default_language_id', $defaultLanguageId);
            update_option('default_language', $defaultLanguage);
        }
    }

  }
}

if(isset($_POST['disconnect'])) {
    delete_option('obpress_api_set');
    delete_option('obpress_api_token');
    delete_option('chain_id');
    delete_option('hotel_id');
    delete_option('default_currency_id');
    delete_option('default_language');    
}

function checkAuthorization($chainId, $hotelId, $chainOrHotel) {

    if($chainOrHotel == "chain") {
        $baseInfo = BeApi::baseInfo();
        if(isset($baseInfo->Result) && isset($baseInfo->Status) && $baseInfo->Status == 0){ 
            return true;
        }        
        else {
            return false;
        }

    }
    else {
        $hotelSearch = BeApi::getHotelSearchForProperty($hotelId, "true");
        if (isset($hotelSearch->PropertiesType)) {
            findChainForSingleHotel($hotelSearch);            
            return true;
        }
        else {
            return false;
        }        
    }

}

function findChainForSingleHotel($hotelSearch) {
    $chain_id = $hotelSearch->PropertiesType->Properties[0]->HotelRef->ChainCode;
    update_option('chain_id', $chain_id);
    BeApi::setChainId($chain_id);

    $defaultCurrency = BeApi::getCurrencies($chain_id)->Result[0]->UID;

    $defaultLanguageId = BeApi::getLanguages($chain_id)->Result[0]->UID;
    $defaultLanguage = returnLanguageByCode($defaultLanguageId);

    update_option('default_currency_id', $defaultCurrency);
    update_option('default_language_id', $defaultLanguageId);

    update_option('default_language', $defaultLanguage);
}


function returnLanguageByCode($uid) {
    $langArray = [
        8 => "pt_BR",
        3 => "es_ES",
        1 => "en_US",
        4 => "pt_PT",
        2 => "fr_FR"
    ];

    foreach($langArray as $key=>$lang) {
        if($key == $uid) {
            return $lang;
        }
    }
}
