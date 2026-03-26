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
            </div>
        </div>
    </div>
    <div class="mt-5 newpass-section">
        <div class="tf-container">
            <form class="tf-form" action="newpass-confirm.php">
                <h1>Créer un nouveau mot de passe</h1>
                <div class="group-input">
                    <label>Password</label>
                    <input type="password" value="Agent_1">
                </div>
                <div class="group-input last">
                    <label>Comfirmation mot de passe</label>
                    <input type="password" placeholder="6-20 characters">
                </div>
                
                
                <button type="submit" class="tf-btn accent large">Réinitialiser le mot de passe</button>

        </form>

        </div>
    </div>
    
  




<?php
include 'footer.php';
?>