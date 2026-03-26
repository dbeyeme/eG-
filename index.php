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
    <div class="boarding-section">
            <div class="tf-container">
                <div class="images">    
                    <img src="images/boarding/boarding1.png" alt="image">
                </div>
            </div>
        </div>

    <div class="mt-7 login-section">
        <div class="tf-container my-auto">
            <form class="tf-form" action="home.php">
                    <h1>Connexion</h1>
                    <div class="group-input">
                        <label>Identifiant</label>
                        <input type="text" placeholder="Example@gmail/Agent_1" required>
                    </div>
                    <div class="group-input auth-pass-input last">
                        <label>Mot de passe </label>
                        <input type="password" class="password-input" placeholder="Password" required>
                        <a class="icon-eye password-addon" id="password-addon"></a>
                    </div>
                 <!--   <a href="reset-password.php" class="auth-forgot-password mt-3">Mot de passe oublier?</a>-->

                <button type="submit" class="tf-btn accent large">Se connecter</button>

            </form>
        </div>
    </div>
    
  



<?php
include 'footer.php';
?>