<?php
/*
  Plugin name: OBPress Plugin Manager by Omnibees
  Plugin uri: www.zyrgon.net
  Text Domain: OBPress_Plugin_Manager
  Description: Plugin used to connect to the BEAPI and edit different settings for the Elementor extension
  Version: 0.0.1
  Author: Zyrgon
  Author uri: www.zyrgon.net
  License: GPlv2 or Later
*/

//Create admin page
add_action('admin_menu', 'obpress_manger');
function obpress_manger() {
 add_menu_page ('OBPress Plugin Manager by Omnibees',
                 'OBPress Plugin Manager',
                 'manage_options',
                 'obpress',
                 'obpress_plugin_manager',
                 'dashicons-calendar-alt',
                 90);
}
function obpress_plugin_manager() {
  include_once ('admin/index.php');
}
