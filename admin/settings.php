<?php
require_once(dirname(__FILE__) . '/settingsController.php');

?>

<h1 class="obpress-welcome">Welcome!</h1>

<div class="obpress-select-currency">
    <h3>Select Currency</h3>
    <select class="currency-select" data-selected-currency="<?= get_option('default_currency_id'); ?>">
        <?php foreach ($currencies as $currency) : ?>
            <option class="currency-select-option" data-currency-id="<?= $currency->UID; ?>"<?php if(get_option('default_currency_id') == $currency->UID){echo 'selected';} ?>><?= $currency->Name; ?> (<?= $currency->CurrencySymbol; ?>) </option>
        <?php endforeach; ?>
    </select>
</div>

<div class="obpress-select-language">
    <h3>Select Language</h3>
    <select class="language-select">
        <?php foreach ($languages as $language) : ?>
            <option class="language-select-option" data-language-id="<?= $language->UID ?>"<?php if(get_option('default_language_id') == $language->UID){echo 'selected';} ?>><?= $language->Name ?></option>
        <?php endforeach; ?>
    </select>
</div>

<div class="obpress-calendar-options">
    <h3>Calendar Options</h3>
    <div class="obpress-select-calendar-adults">
        <label for="">Select Number of Adults for Calendar</label>
        <select class="calendar-adults-select" data-adults-selected="<?= get_option('calendar_adults') ?>">
            <option value="1">1</option>
            <option value="2">2</option>
        </select>
    </div>
    <div class="obpress-calendar-allow-unavail">
        <label for="">Allow selecting unavailable dates in calendar</label>
        <input type="checkbox" id="obpress-calendar-allow-checkbox">
    </div>
</div>

<?php if(empty(get_option('hotel_id'))) : ?>
    <div class="obpress-select-list-hotel" data-removed-hotels="<?= get_option('removed_hotels') ?>">
        <h3>Select which hotels will be visible</h3>
        <div class="obpress-list-grid">
            <?php foreach($hotelFromFolder as $hotel) : ?>
                <span class="list-hotel-holder">
                    <input type="checkbox" class="list-hotel-checkbox" data-property-id="<?= $hotel->Property_UID ?>" checked="checked">
                    <label for="list-hotel-checkbox" class="list-hotel-label" data-property-id="<?= $hotel->Property_UID ?>"><?= $hotel->Property_Name ?></label>
                </span> 
            <?php endforeach; ?>         
        </div>
    </div>
<?php endif; ?>

<div class="obpress-select-max-rooms">
    <h3>Select maximum number of rooms</h3>
    <div class="obpress-select-max-rooms-holder">
        <span class="obpress-hotel-select">
            <label for="">Hotel:</label>
            <select name="" id="obpress-hotel-options">
            <?php foreach($hotelFromFolder as $hotel) : ?>
                <option class='obpress-room-option' value="<?= $hotel->Property_UID ?>"><?= $hotel->Property_Name ?></option>
            <?php endforeach; ?>
            </select>
        </span>
        <span class="obpress-room-select">
            <label for="">Max Rooms</label>
            <select name="" id="obpress-room-options">
                    <!-- Options are generated through javascript, check line 80 in admin.js -->
            </select>
        </span>
    </div>
</div>

<div class="obpress-apply-holder">
    <button class="obpress-apply">Apply Changes</button>
</div>

<form method="POST" action="">
    <input class="disconnect-button" name="disconnect" value="disconnect" type="submit">
</form>