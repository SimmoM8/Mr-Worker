<div class="color-inputs col-md-6">
  <div class="color-input card card-body card-flat">
    <div class="circle-wrapper">
      <div class="color-circle" id="colorCircle1"></div>
      <div class="overlay" id="editIcon1">Edit</div>
    </div>
    <div class="hex-input">
      <label class="" for="grad_color_1">Colour 1</label>
      <hex-input class="" id="grad_color_1" name="grad_color_1" color="<?php if(isset($_SESSION['grad_color_1'])) {echo($_SESSION[ 'grad_color_1' ]);} else {echo "#FF1C1C";}?>" prefixed="true"></hex-input>
    </div>
    <!-- Hidden input to store the value -->
    <input type="hidden" id="grad_color_1_hidden" name="grad_color_1_hidden" value="<?php if(isset($_SESSION['grad_color_1'])) {echo($_SESSION[ 'grad_color_1' ]);} else {echo "#FF1C1C";}?>">
    <hex-color-picker class="color-picker shadow" id="colorPicker1" color="<?php echo($_SESSION[ 'grad_color_1' ])?>"></hex-color-picker>
  </div>
  <div class="more-colors">
    <div class="color-input card card-body card-flat">
      <div class="circle-wrapper">
        <div class="overlay" id="editIcon2">Edit</div>
        <div class="color-circle" id="colorCircle2"></div>
      </div>
      <div class="hex-input">
        <label class="" for="grad_color_2">Colour 2</label>
        <hex-input class="" id="grad_color_2" name="grad_color_2" color="<?php if(isset($_SESSION['grad_color_2'])) {echo($_SESSION[ 'grad_color_2' ]);} else {echo "#750D64";}?>" prefixed="true"></hex-input>
      </div>
      <!-- Hidden input to store the value -->
      <input type="hidden" id="grad_color_2_hidden" name="grad_color_2_hidden" value="<?php if(isset($_SESSION['grad_color_2'])) {echo($_SESSION[ 'grad_color_2' ]);} else {echo "#750D64";}?>">
      <hex-color-picker class="color-picker shadow" id="colorPicker2" color="<?php echo($_SESSION[ 'grad_color_2' ])?>"></hex-color-picker>
    </div>
    <div class="color-input card card-body card-flat">
      <div class="circle-wrapper">
        <div class="overlay" id="editIconBackground">Edit</div>
        <div class="color-circle" id="colorCircleBackground"></div>
      </div>
      <div class="hex-input">
        <label class="" for="background_color">Background Color</label>
        <hex-input class="" id="background_color" name="background_color" color="<?php if(isset($_SESSION['background_color'])) {echo($_SESSION[ 'background_color' ]);} else {echo "#FCE8E8";}?>" prefixed="true"></hex-input>
      </div>
      <!-- Hidden input to store the value -->
      <input type="hidden" id="background_color_hidden" name="background_color_hidden" value="<?php if(isset($_SESSION['background_color'])) {echo($_SESSION[ 'background_color' ]);} else {echo "#FCE8E8";}?>">
      <hex-color-picker class="color-picker shadow" id="colorPickerBackground" color="<?php echo($_SESSION[ 'background_color' ])?>"></hex-color-picker>
    </div>
    <div class="color-input card card-body card-flat">
      <div class="circle-wrapper">
        <div class="overlay" id="editIconBubble">Edit</div>
        <div class="color-circle" id="colorCircleBubble"></div>
      </div>
      <div class="hex-input">
        <label class="" for="bubble_color">Bubble Colour</label>
        <hex-input class="" id="bubble_color" name="bubble_color" color="<?php if(isset($_SESSION['bubble_color'])) {echo($_SESSION[ 'bubble_color' ]);} else {echo "#E69BA8";}?>" prefixed="true"></hex-input>
      </div>
      <!-- Hidden input to store the value -->
      <input type="hidden" id="bubble_color_hidden" name="bubble_color_hidden" value="<?php if(isset($_SESSION['bubble_color'])) {echo($_SESSION[ 'bubble_color' ]);} else {echo "#E69BA8";}?>">
      <hex-color-picker class="color-picker shadow" id="colorPickerBubble" color="<?php echo($_SESSION[ 'bubble_color' ])?>"></hex-color-picker>
    </div>
  </div>
  <p class="menu-btn link" id="moreColors" style="flex-grow: 1;">Click for more colours</p>
</div>
<section class="preview col-md-6">
  <div class="preview-wrapper">
    <div id="p-name">
      <div class="p-heading"></div>
    </div>
    <div id="p-titleBar"></div>
    <div id="p-profile"></div>
    <div class="p-container">
      <div id="p-sideBar">
        <div>
          <p class="p-heading" style="width: 80%"></p>
          <div class="p-bar"></div>
          <div class="p-infoList">
            <div>
              <div class="p-icon-wrapper">
                <div class="p-icon"></div>
              </div>
              <div class="p-text"></div>
            </div>
            <div>
              <div class="p-icon-wrapper">
                <div class="p-icon"></div>
              </div>
              <div class="p-text"></div>
            </div>
            <div>
              <div class="p-icon-wrapper">
                <div class="p-icon"></div>
              </div>
              <div class="p-text"></div>
            </div>
          </div>
        </div>
        <div>
          <p class="p-heading" style="width: 38%"></p>
          <div class="p-bar"></div>
          <div class="bubbles-wrapper">
            <div class="p-bubbles" style="width: 80%;"></div>
            <div class="p-bubbles" style="width: 60%;"></div>
            <div class="p-bubbles" style="width: 100%;"></div>
            <div class="p-bubbles" style="width: 70%;"></div>
          </div>
        </div>
      </div>
      <div id="p-content">
        <div>
          <div class="p-heading" style="width: 43%"></div>
          <div class="p-bar"></div>
          <div class="p-text" style="height: 20%"></div>
        </div
        
        
        
        <div>
          <div class="p-heading" style="width: 68%"></div>
          <div class="p-bar"></div>
          <div class="p-text" style="height: 32%"></div>
        </div
      
      
      
      </div>
    </div>
  </div>
</section>
<script src="../js/color_pickers.js" type="module"></script>