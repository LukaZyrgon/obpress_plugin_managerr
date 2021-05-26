<?php
/*
  Plugin name: OBPress_SearchBarPlugin by Zyrgon
  Plugin uri: www.zyrgon.net
  Text Domain: OBPress_SearchBarPlugin
  Description: Widgets to OBPress
  Version: 0.0.2
  Author: Zyrgon
  Author uri: www.zyrgon.net
  License: GPlv2 or Later
*/

//Activator
function activate_obpress() {
	require_once plugin_dir_path( __FILE__ ) . 'includes/obpress-activator.php';
	OBPress_Activator::activate();
}

//Deactivator
function deactivate_obpress() {
	require_once plugin_dir_path( __FILE__ ) . 'includes/obpress-deactivator.php';
	OBPress_Deactivator::deactivate();
}

//Register Activator and Deactivator
register_activation_hook( __FILE__, 'activate_obpress' );
register_deactivation_hook( __FILE__, 'deactivate_obpress' );

//Init language files and check for localization
function language_init() {
  load_plugin_textdomain( 'obpress', false, '/OBPress_SearchBarPlugin/languages' );
}
add_action('init', 'language_init');
add_filter( 'locale', 'set_my_locale' );
function set_my_locale( $lang ) {
  if(isset($_GET['lang'])) {
    return $_GET['lang'];
  }
  elseif(get_option('default_language') != null) {
    return get_option('default_language');
  }
  else {
    // return original language
    return $lang;
  }
}

//Register Ajax Calls file
require_once(WP_PLUGIN_DIR . '/OBPress_SearchBarPlugin/ajax/registerAjax.php');

//Show Elementor plugins only if api token and chain/hotel are set in the admin
if(get_option('obpress_api_set') == true){
  require_once('elementor/init.php');
}

require_once(WP_PLUGIN_DIR . '/OBPress_SearchBarPlugin/plugin-update-checker-4.11/plugin-update-checker.php');
$myUpdateChecker = Puc_v4_Factory::buildUpdateChecker(
  'https://github.com/MilosZyrgon/OBPress_SearchBarPlugin',
  __FILE__,
  'OBPress_SearchBarPlugin'
);

//Set the branch that contains the stable release.
$myUpdateChecker->setBranch('main');
