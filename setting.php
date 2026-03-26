<?php
include 'header.php';
?>
<body class="bg_surface_color">
       <!-- preloade -->
       <div class="preload preload-container">
        <div class="preload-logo">
          <div class="spinner"></div>
        </div>
      </div>
    <!-- /preload -->
    <div class="header">
        <div class="tf-container">
            <div class="tf-statusbar d-flex justify-content-center align-items-center">
                <a href="#" class="back-btn"> <i class="icon-left"></i> </a>
                <h3>Parametres</h3>
            </div>
        </div>
    </div>
    <div class="mt-1 box-settings-profile style1">
        <a class="list-setting-profile" href="new-pass.php">
            <div class="inner-left">
                <h4 class="fw_6">Modifier le mot de passe</h4>
            </div>
            <span class="inner-right"><i class="icon-right"></i></span>

        </a>
    </div>

    <a class="mt-1 list-setting-profile style1" href="#" id="btn-logout">
        <h4 class="fw_6 critical_color">Déconnexion</h4>
        <span class="inner-right"> <i class="icon-right"></i> </span>
    </a>
  
    <div class="tf-panel logout">
        <div class="panel_overlay"></div>
          <div class="panel-box panel-center panel-logout">
                <div class="heading">
                    <h2 class="text-center">Voulez-vous vraiment vous déconnecter de votre compte ?</h2>
                </div>
                <div class="bottom">
                    <a class="clear-panel" href="#">Annuller</a>
                    <a class="clear-panel critical_color" href="index.php">Déconnexion</a>
                </div>
            
          </div>
    </div>


<?php
include 'footer.php';
?>