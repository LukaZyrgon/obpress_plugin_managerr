jQuery(document).ready(function () {

    //When you change selected radio button, toggles between hotel and chain id input field
    jQuery('.type_radio_button').on('click', function(){
        if(jQuery(this).hasClass('type_radio_chain')){
            jQuery('.input-hotel-holder').css('display', 'none');
            jQuery('.input-chain-holder').css('display', 'flex');
        }
        else {
            jQuery('.input-chain-holder').css('display', 'none');
            jQuery('.input-hotel-holder').css('display', 'flex');
        }
    })

    //When the apply button is clicked
    jQuery('.ob-plugin-form').submit(function(e){
        //Get Values for the Api token Input field and selected radio button value
        var apiTokenInput = jQuery('.input-plugin-token').val();
        var chainOrHotel = jQuery("input[type='radio'][name='type_setup']:checked").val();

        //If Chain radio is selected, take Chain input field value as property id, else take Hotel input field value
        if(chainOrHotel == 'chain') {
            var propertyId = jQuery(".input-plugin-chain-id").val();
        }
        else {
            var propertyId = jQuery('.input-plugin-hotel-id').val();
        }

        //If PropertyId is valid or Api token, hide the invalid warning
        if(propertyId != 0 && propertyId > 0) {
            jQuery('.missing-id').css('display', 'none');
        }
        if(apiTokenInput != 0 && apiTokenInput.length > 15) {
            jQuery('.missing-token').css('display', 'none');
        }


        //If everything is not correct, prevent form from submitting, else submit it
        if(apiTokenInput != 0 && apiTokenInput.length > 15 && propertyId != 0 && propertyId > 0 ) {
            
        }
        else {
            e.preventDefault(e);
            if(apiTokenInput == 0 || apiTokenInput.length <= 15) {
                jQuery('.missing-token').css('display', 'block');
            }
            if(propertyId == 0 && propertyId <= 0) {
                jQuery('.missing-id').css('display', 'block');
            }
        }


    })

    var removedHotels = jQuery('.obpress-select-list-hotel').attr('data-removed-hotels');

    if(removedHotels != null && removedHotels != '') {
        removedHotels = JSON.parse(removedHotels);
    }

    for(i = 0; i < jQuery('.list-hotel-checkbox').length; i++) {
        for(j = 0; j < removedHotels.length; j++) {
            if(jQuery('.list-hotel-checkbox').eq(i).attr('data-property-id') == removedHotels[j]) {
                jQuery('.list-hotel-checkbox').eq(i).prop('checked', false);
            }
        }
    }

    var calendarAdultsSelected = jQuery('.calendar-adults-select').attr('data-adults-selected');
    jQuery('.calendar-adults-select').find('option[value='+ calendarAdultsSelected +']').prop('selected', 'selected');

    jQuery('.obpress-apply').on('click', function(){
        var action = "admin_apply_changes";
        var data = {};
    
        var selectedCurrency = jQuery('.currency-select').find(':selected').attr('data-currency-id');
        var selectedLang = jQuery('.language-select').find(':selected').attr('data-language-id');
        var calendarAdults = jQuery('.calendar-adults-select').find(':selected').val();
        var removedHotels = [];

        for(i = 0; i < jQuery('.list-hotel-checkbox').length; i++) {
            if(jQuery('.list-hotel-checkbox').eq(i).prop("checked") == false) {
                removedHotels.push(parseInt(jQuery('.list-hotel-checkbox').eq(i).attr('data-property-id')));
            }
        }

        data.selectedCurrency = selectedCurrency;
        data.selectedLang = selectedLang;
        data.calendarAdults = calendarAdults;
        data.removedHotels = JSON.stringify(removedHotels);

        data.action = action;        

        jQuery.post(adminAjax.ajaxurl, data, function(response){
            if(response != null) {
                alert('success');
            }
        })
    });

});