<?php
/*
  Plugin name: OBPress Plugin Manager by Omnibees
  Plugin uri: www.zyrgon.net
  Text Domain: OBPress_Plugin_Manager
  Description: Plugin used to connect to the BEAPI and edit different settings for the Elementor extension
  Version: 0.0.2
  Author: Zyrgon
  Author uri: www.zyrgon.net
  License: GPlv2 or Later
*/

//Create admin page
add_action('admin_menu', 'obpress_manger');
function obpress_manger() {
 $admin_page = add_menu_page ('OBPress Manager by Omnibees',
                 'OBPress Manager',
                 'manage_options',
                 'obpress_manager',
                 'obpress_plugin_manager',
                 'dashicons-calendar-alt',
                 90);
  add_action( 'load-' . $admin_page, 'load_obpress_manager_admin_style' );
  add_action( 'load-' . $admin_page, 'load_obpress_manager_admin_script' );                 
}
function obpress_plugin_manager() {
  include_once ('admin/index.php');
}

require_once(WP_PLUGIN_DIR . '/OBPressPluginManager/plugin-update-checker-4.11/plugin-update-checker.php');
$myUpdateChecker = Puc_v4_Factory::buildUpdateChecker(
  'https://github.com/MilosZyrgon/OBPress_SearchBarPlugin',
  __FILE__,
  'obpress_plugin_manager'
);

//Set the branch that contains the stable release.
$myUpdateChecker->setBranch('main');

//Functions that load and register admin css scripts
function enqueue_obpress_manager_admin_style() {
  wp_enqueue_style( 'admin_css', plugin_dir_url( __FILE__ ) . 'admin/public/css/admin.css');
  
}
function load_obpress_manager_admin_style() {
  add_action( 'admin_enqueue_scripts', 'enqueue_obpress_manager_admin_style' );
}

//Functions that load and register admin js scripts
function enqueue_obpress_manager_admin_script() {
  wp_register_script( 'admin_js', plugin_dir_url( __FILE__ ) . 'admin/public/js/admin.js');
  wp_localize_script('admin_js', 'adminAjax', array(
    'ajaxurl' => admin_url('admin-ajax.php')
  ));    
  wp_enqueue_script('admin_js');
}
function load_obpress_manager_admin_script() {
  add_action('admin_enqueue_scripts', 'enqueue_obpress_manager_admin_script' );
}

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

//register ajax calls
require_once(WP_PLUGIN_DIR . '/OBPressPluginManager/admin/adminAjax.php');
