<?php

class Searchbar extends \Elementor\Widget_Base {
	
	public function get_name() {
		return 'Searchbar';
	}

	public function get_title() {
		return __( 'Searchbar', 'plugin-name' );
	}

	public function get_icon() {
		return 'fa fa-calendar';
	}

	public function get_categories() {
		return [ 'OBPress' ];
	}

	protected function _register_controls() {

		$this->start_controls_section(
			'content_section',
			[
				'label' => __( 'Content', 'plugin-name' ),
				'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
			]
		);

		$this->add_control(
			'url',
			[
				'label' => __( 'URL to embed', 'plugin-name' ),
				'type' => \Elementor\Controls_Manager::TEXT,
				'input_type' => 'url',
				'placeholder' => __( 'https://your-link.com', 'plugin-name' ),
			]
		);

		$this->end_controls_section();

	}
    
	protected function render() {
		$settings_rooms = $this->get_settings_for_display();
		require_once(WP_CONTENT_DIR . '/plugins/OBPressPluginManager/BeApi/BeApi.php');

		$chainId = get_option('chain_id');

		$removedHotels = json_decode(get_option('removed_hotels'));
		

		$hotelFolders = BeApi::getClientPropertyFolders($chainId)->Result;

		$counter_for_hotel = 0;

        foreach ($hotelFolders as $hotel_in_folder_key => $hotel_in_folder) {
            if($hotel_in_folder->IsPropertyFolder == false){
                $counter_for_hotel++;
            }
			foreach($removedHotels as $removedHotel ) {
				if(isset($hotel_in_folder->Property_UID) && $hotel_in_folder->Property_UID != null) {
					if($hotel_in_folder->Property_UID == $removedHotel) {
						unset($hotelFolders[$hotel_in_folder_key]);
					}
				}
			}
        }
		
		//if set, if today or later
		$todayDateTime = new \DateTime('today');

		$start_date = \DateTime::createFromFormat('dmY', $_GET['CheckIn']);
		//if set, valid datetime, and not in past
		if(isset($_GET['CheckIn']) && $start_date && !$todayDateTime->diff($start_date)->invert){
			$CheckIn = $start_date->format('dmY');
			$CheckInShow = $start_date->format('d/m/Y');
			$tomorrow = $start_date->modify('+1 day');
		}else{
			$CheckIn = $todayDateTime->format('dmY');
			$CheckInShow = $todayDateTime->format('d/m/Y');
			$tomorrow = $todayDateTime->modify('+1 day');
		}

		$end_date = \DateTime::createFromFormat('dmY', $_GET['CheckOut']);

		if(isset($_GET['CheckOut']) && $end_date && !$tomorrow->diff($end_date)->invert){
			$CheckOut = $end_date->format('dmY');
			$CheckOutShow = $end_date->format('d/m/Y');
		}else{
			$CheckOut = $tomorrow->format('dmY');
			$CheckOutShow = $tomorrow->format('d/m/Y');
		}

		if($_GET['ad'] && intval($_GET['ad'])>0){
			$adults = intval($_GET['ad']);
		}

		if($_GET['ch'] && intval($_GET['ch'])>=0){
			$children = intval($_GET['ch']);
		}		

		require_once(WP_PLUGIN_DIR . '/OBPress_SearchBarPlugin/widgets/searchbar/assets/templates/searchbar.php');
	}
}

