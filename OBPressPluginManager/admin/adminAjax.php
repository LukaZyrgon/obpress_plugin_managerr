<?php

add_action('wp_ajax_admin_apply_changes', 'admin_apply_changes');
add_action('wp_ajax_nopriv_admin_apply_changes', 'admin_apply_changes');

function admin_apply_changes() {
    $selectedCurrency = $_POST['selectedCurrency'];
    $selectedLang = $_POST['selectedLang'];
    $calendarAdults = $_POST['calendarAdults'];
    $removedHotels = $_POST['removedHotels'];

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

    echo json_encode(get_option('removed_hotels'));

    die();
}