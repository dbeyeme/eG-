<?php
include 'header.php';
?>


<body>
    <!-- preloade -->
    <div class="preload preload-container">
        <div class="preload-logo">
          <div class="spinner"></div>
        </div>
      </div>
    <!-- /preload -->
    <div class="header">
        <div class="tf-container">
            <div class="tf-statusbar br-none d-flex justify-content-center align-items-center">
                <a href="#" class="back-btn"> <i class="icon-left"></i> </a>
                <h3>Vérification OTP</h3>
            </div>
            
        </div>
    </div>
    
    <div class="mt-5">
        <div class="tf-container">
            <form class="tf-form tf-form-verify" action="new-pass.php">
                <div class="d-flex group-input-verify">
                        <input type="tel" maxlength="1" pattern="[0-9]" class="input-verify" value="1">
                        <input type="tel" maxlength="1" pattern="[0-9]" class="input-verify" value="2">
                        <input type="tel" maxlength="1" pattern="[0-9]" class="input-verify" value="3">
                        <input type="tel" maxlength="1" pattern="[0-9]" class="input-verify" value="4">
                </div>
                <div class="text-send-code">
                        <p class="fw_4">Un code a été envoyé sur votre email/téléphone</p>
                        <p class="primary_color fw_7">Renvoyer&nbsp;<span class="js-countdown" data-timer="60" data-labels=" :  ,  : , : , "></span></p>
                </div>
                <div class="bottom-navigation-bar bottom-btn-fixed">
                    <button type="submit" class="tf-btn accent large">Suivant</button>
                </div>
            </form>
        </div>

    </div>



<?php
include 'footer.php';
?>