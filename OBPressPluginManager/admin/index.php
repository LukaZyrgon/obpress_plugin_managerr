<?php
require_once(dirname(__FILE__) . '/authorization.php')
?>

<?php if(get_option('obpress_api_set') == false) : ?>
<div class="ob-plugin">
  <h2>OBPress setup</h2>
  <form class="ob-plugin-form" method="POST" action="">
    <div class="input-plugin">
      <label for="input-plugin-token">OB API TOKEN</label>
      <input type="text" name="input-plugin-token" class="input-plugin-token">
      <div class="missing-token">
        <p>Token is invalid</p>
      </div>
    </div>
    <div class="input-radio-holder">
      <div class="input-plugin">
        <div class="input-chain-hotel-radio">
          <input type="radio" id="type_chain" class="type_radio_button type_radio_chain" name="type_setup" value="chain" data-type="Enter Chain ID" checked>
          <label for="type_setup" class="corh-label">Chain of Hotels</label>
        </div>
        <div class="input-chain-hotel-radio">
				  <input type="radio" id="type_hotel" class="type_radio_button type_radio_hotel" name="type_setup" value="hotel" data-type="Enter Hotel ID" >
				  <label for="type_setup" class="corh-label">Single Hotel</label>
        </div>
      </div>     
    </div>    
    <div class="input-chain-holder">
      <div class="input-plugin">
        <label for="input-plugin-chain-id">Chain ID</label>
        <input type="number" name="input-plugin-chain-id" class="input-plugin-chain-id" pattern="[0-9]">
      </div>
    </div>
    <div class="input-hotel-holder">
      <div class="input-plugin">
        <label for="input-plugin-hotel-id">Hotel ID</label>
        <input type="number" name="input-plugin-hotel-id" class="input-plugin-hotel-id" pattern="[0-9]">
      </div>
    </div>
    <div class="missing-id">
      <p>Property ID is invalid</p>      
    </div>     
    <button class="input-plugin-submit" type="submit">Apply</button>
  </form>
</div>

<?php else : ?>
  <?php require_once(dirname(__FILE__) . '/settings.php') ?>
<?php endif; ?>