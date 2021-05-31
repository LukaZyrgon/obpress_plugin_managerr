<?php

add_action('wp_ajax_admin_apply_changes', 'admin_apply_changes');
add_action('wp_ajax_nopriv_admin_apply_changes', 'admin_apply_changes');


function admin_apply_changes() {
    $selectedCurrency = $_POST['selectedCurrency'];
    $selectedLang = $_POST['selectedLang'];
    $calendarAdults = $_POST['calendarAdults'];
    $removedHotels = $_POST['removedHotels'];
    $changedMaxRooms = $_POST['changedMaxRooms'];
    $allowUnavailDates = $_POST['allowUnavailDates'];

    $langArray = [
        8 => "pt_BR",
        3 => "es_ES",
        1 => "en_US",
        4 => "pt_PT",
        2 => "fr_FR"
    ];

    foreach($langArray as $key=>$lang) {
        if($key == $selectedLang) {
            $selectedLangLocale = $lang;
        }
    }

    update_option('default_currency_id', $selectedCurrency);
    update_option('default_language_id', $selectedLang);
    update_option('default_language', $selectedLangLocale);
    update_option('calendar_adults', $calendarAdults);
    update_option('removed_hotels', $removedHotels);
    update_option('allow_unavail_dates', $allowUnavailDates);

    if(!empty($changedMaxRooms)) {
        update_option('changed_max_rooms', $changedMaxRooms);
    }

    echo json_encode(get_option('changed_max_rooms'));

    die();
}

add_action('wp_ajax_get_hotel_max_rooms', 'get_hotel_max_rooms');
add_action('wp_ajax_nopriv_get_hotel_max_rooms', 'get_hotel_max_rooms');

function get_hotel_max_rooms() {
    $property = json_decode($_POST['hotelId'], true);
    $currency = get_option('default_currency_id');
    $style =  BeApi::getPropertyStyle($property, $currency);

    $roomLimits = array('defaultMaxRooms' => $style->Result->MaxRooms);;

    if(!empty(get_option('changed_max_rooms'))) {
        $maxRoomsArr = get_option('changed_max_rooms');

        foreach($maxRoomsArr as $room) {
            if($property == $room['hotelId']) {
                $roomLimits['selectedMaxRooms'] = $room['newMaxRooms'];
            }
        }

    }


    echo json_encode($roomLimits);

    die();    
}