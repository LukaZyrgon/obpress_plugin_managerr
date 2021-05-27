<?php

class OBPress_Activator {
    public static function activate() {
        add_option('obpress_api_set', false);
		add_option('obpress_api_token', null);
		add_option('chain_id', null);
		add_option('hotel_id', null);
        add_option('default_currency_id', null);
        add_option('default_language_id', null);
        add_option('default_language', null);
        add_option('calendar_adults', 1);
        add_option('removed_hotels', null);

        flush_rewrite_rules();
    }
}