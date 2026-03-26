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
    <div class="header is-fixed">
        <div class="tf-container">
            <div class="tf-statusbar br-none d-flex justify-content-center align-items-center">
                <a href="#" class="back-btn"> <i class="icon-left"></i> </a>
            </div>
        </div>
    </div>
    <div id="app-wrap">
        <div class="reset-pass-section mt-5">
            <div class="tf-container">
                <div class="tf-title">
                    <h1>Réinitialiser le mot de passe</h1>
                    <p>Entrez votre adresse e-mail enregistrée ci-dessous pour recevoir les instructions de réinitialisation du mot de passe</p>
                </div>
                <div class="image-box">
                    <img src="images/user/forgotpass.jpg" alt="image">
                </div>
                <form action="verify-otp.php" class="tf-form">
                    <div class="group-input">
                        <label>Email/Numero de téléphone</label>
                        <input type="text" placeholder="Your Email/PhoneNumber">
                    </div>
                    <button type="submit" class="tf-btn accent large">Soumettre</button>
                </form>
               
            </div>
        </div>
    </div>
    
    
  



<?php
include 'footer.php';
?>