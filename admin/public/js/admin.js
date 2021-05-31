jQuery(document).ready(function () {
  //When you change selected radio button, toggles between hotel and chain id input field
  jQuery(".type_radio_button").on("click", function () {
    if (jQuery(this).hasClass("type_radio_chain")) {
      jQuery(".input-hotel-holder").css("display", "none");
      jQuery(".input-chain-holder").css("display", "flex");
    } else {
      jQuery(".input-chain-holder").css("display", "none");
      jQuery(".input-hotel-holder").css("display", "flex");
    }
  });

  //When the apply button is clicked
  jQuery(".ob-plugin-form").submit(function (e) {
    //Get Values for the Api token Input field and selected radio button value
    var apiTokenInput = jQuery(".input-plugin-token").val();
    var chainOrHotel = jQuery(
      "input[type='radio'][name='type_setup']:checked"
    ).val();

    //If Chain radio is selected, take Chain input field value as property id, else take Hotel input field value
    if (chainOrHotel == "chain") {
      var propertyId = jQuery(".input-plugin-chain-id").val();
    } else {
      var propertyId = jQuery(".input-plugin-hotel-id").val();
    }

    //If PropertyId is valid or Api token, hide the invalid warning
    if (propertyId != 0 && propertyId > 0) {
      jQuery(".missing-id").css("display", "none");
    }
    if (apiTokenInput != 0 && apiTokenInput.length > 15) {
      jQuery(".missing-token").css("display", "none");
    }

    //If everything is not correct, prevent form from submitting, else submit it
    if (
      apiTokenInput != 0 &&
      apiTokenInput.length > 15 &&
      propertyId != 0 &&
      propertyId > 0
    ) {
    } else {
      e.preventDefault(e);
      if (apiTokenInput == 0 || apiTokenInput.length <= 15) {
        jQuery(".missing-token").css("display", "block");
      }
      if (propertyId == 0 && propertyId <= 0) {
        jQuery(".missing-id").css("display", "block");
      }
    }
  });

  var removedHotels = jQuery(".obpress-select-list-hotel").attr(
    "data-removed-hotels"
  );

  if (removedHotels != null && removedHotels != "") {
    removedHotels = JSON.parse(removedHotels);
  }

  for (i = 0; i < jQuery(".list-hotel-checkbox").length; i++) {
    for (j = 0; j < removedHotels.length; j++) {
      if (
        jQuery(".list-hotel-checkbox").eq(i).attr("data-property-id") ==
        removedHotels[j]
      ) {
        jQuery(".list-hotel-checkbox").eq(i).prop("checked", false);
      }
    }
  }

  var calendarAdultsSelected = jQuery(".calendar-adults-select").attr(
    "data-adults-selected"
  );
  jQuery(".calendar-adults-select")
    .find("option[value=" + calendarAdultsSelected + "]")
    .prop("selected", "selected");

  var calendarUnavailDates = jQuery("#obpress-calendar-allow-checkbox").prop('checked');


  //Javascript for limiting max rooms
  var data = {};
  var action = "get_hotel_max_rooms";
  var hotelId = jQuery("#obpress-hotel-options")
    .children()
    .first()
    .attr("value");

  data.hotelId = hotelId;
  data.action = action;

  jQuery.post(adminAjax.ajaxurl, data, function (maxRooms) {
    maxRooms = JSON.parse(maxRooms);

    if(typeof maxRooms.selectedMaxRooms != 'undefined') {
      jQuery('#obpress-hotel-options').children().eq(0).attr('data-max-rooms-set', maxRooms.selectedMaxRooms);
    }

    if (maxRooms.defaultMaxRooms != null) {
      for (i = 1; i <= maxRooms.defaultMaxRooms; i++) {
        var option = "<option  value=" + i + ">" + i + "</option>";
        jQuery("#obpress-room-options").append(option);
      }
    }

    if (
      typeof maxRooms.selectedMaxRooms != "undefined" &&
      maxRooms.selectedMaxRooms != null
    ) {
      jQuery("#obpress-room-options")
        .children()
        .eq(parseInt(maxRooms.selectedMaxRooms) - 1)
        .attr("selected", "selected");
    } else {
      jQuery("#obpress-room-options")
        .children()
        .last()
        .attr("selected", "selected");
    }
  });

  jQuery("#obpress-hotel-options").on("change", function () {
    var data = {};
    var action = "get_hotel_max_rooms";

    var hotelId = parseInt(jQuery(this).find(":selected").val());

    data.hotelId = JSON.stringify(hotelId);
    data.action = action;

    jQuery.post(adminAjax.ajaxurl, data, function (maxRooms) {
      maxRooms = JSON.parse(maxRooms);

      if(typeof maxRooms.selectedMaxRooms != 'undefined') {
        jQuery("#obpress-hotel-options").find('option:selected').attr('data-max-rooms-set', maxRooms.selectedMaxRooms);
      }

      if (maxRooms.defaultMaxRooms != null) {
        jQuery("#obpress-room-options").empty();
        for (i = 1; i <= maxRooms.defaultMaxRooms; i++) {
          var option = "<option value=" + i + ">" + i + "</option>";
          jQuery("#obpress-room-options").append(option);
        }

        var selectedOption = jQuery("#obpress-hotel-options").find(
          "option:selected"
        );
        if (typeof maxRooms.selectedMaxRooms != "undefined") {
          jQuery("#obpress-room-options")
            .children()
            .eq(parseInt(maxRooms.selectedMaxRooms) - 1)
            .attr("selected", "selected");
        } else if (
          typeof selectedOption.attr("data-max-rooms-set") == "undefined"
        ) {
          jQuery("#obpress-room-options")
            .children()
            .last()
            .attr("selected", "selected");
        } else {
          jQuery("#obpress-room-options")
            .children()
            .eq(selectedOption.attr("data-max-rooms-set") - 1)
            .attr("selected", "selected");
        }
      }
    });
  });

  jQuery("#obpress-room-options").on("change", function () {
    var maxRoomsVal = jQuery(this).val();
    jQuery("#obpress-hotel-options")
      .find("option:selected")
      .attr("data-max-rooms-set", maxRoomsVal);
  });

  // on click apply
  jQuery(".obpress-apply").on("click", function () {
    var action = "admin_apply_changes";
    var data = {};

    var selectedCurrency = jQuery(".currency-select")
      .find(":selected")
      .attr("data-currency-id");
    var selectedLang = jQuery(".language-select")
      .find(":selected")
      .attr("data-language-id");
    var calendarAdults = jQuery(".calendar-adults-select")
      .find(":selected")
      .val();
    var removedHotels = [];

    var changedMaxRooms = [];

    var allowUnavailDates = false;
    if(jQuery('#obpress-calendar-allow-checkbox').is(":checked")) {
      allowUnavailDates = true;
    }

    for (i = 0; i < jQuery(".list-hotel-checkbox").length; i++) {
      if (jQuery(".list-hotel-checkbox").eq(i).prop("checked") == false) {
        removedHotels.push(
          parseInt(
            jQuery(".list-hotel-checkbox").eq(i).attr("data-property-id")
          )
        );
      }
    }

    for (i = 0; i < jQuery(".obpress-room-option").length; i++) {
      var option = jQuery(".obpress-room-option").eq(i);
      var roomAndId = {};

      if (
        typeof option.attr("data-max-rooms-set") != undefined &&
        option.attr("data-max-rooms-set") != null
      ) {
        roomAndId.hotelId = option.val();
        roomAndId.newMaxRooms = option.attr("data-max-rooms-set");

        changedMaxRooms.push(roomAndId);
      }
    }

    data.selectedCurrency = selectedCurrency;
    data.selectedLang = selectedLang;
    data.calendarAdults = calendarAdults;
    data.removedHotels = JSON.stringify(removedHotels);
    data.changedMaxRooms = changedMaxRooms;
    data.allowUnavailDates = allowUnavailDates;

    data.action = action;

    jQuery.post(adminAjax.ajaxurl, data, function (response) {
      if (response != null) {
        console.log(JSON.parse(response));
        alert("success");
      }
    });
  });
});
