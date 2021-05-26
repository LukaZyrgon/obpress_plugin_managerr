<?php
add_action('wp_ajax_get_max_rooms', 'get_max_rooms_callback');
add_action('wp_ajax_nopriv_get_max_rooms', 'get_max_rooms_callback');

function get_max_rooms_callback() {
    $property = json_decode($_POST['hotel_id'], true);
    $currency = json_decode($_POST['currency_id'], true);

    $style =  BeApi::getPropertyStyle($property, $currency);

    echo json_encode($style->Result->MaxRooms);

    die();
}

