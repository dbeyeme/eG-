<?php
include 'header.php';
?>

<body>
    <!-- preloade -->
    <div class="preload preload-container">
        <div class="preload-logo"></div>
    </div>
    <!-- /preload -->
    <div class="app-header">
        <div class="tf-container">
            <div class="tf-topbar d-flex justify-content-between align-items-center">
                <a class="user-info d-flex justify-content-between align-items-center" href="profile.php">
                    <img src="images/user/user1.jpg" alt="image">

                    <div class="content">
                        <h4 class="white_color text-dark">Agent_1</h4>
                        <p class="white_color text-dark fw_4">Contrôleur</p>
                    </div>
                </a>
            </div>
        </div>
    </div>
    <div class="tf-tab">
        <div class="card-secton">
            <div class="tf-container">
                <div class="tf-balance-box">
                    <div class="balance">
                        <div class="row">
                            <h3>Manifestes</h3>
                            <div class="box-search mt-3">
                                <div class="input-field">
                                    <select required class="search-field value_input" name="" id="">
                                        <option value="">Sélection manifeste</option>
                                        <option value="">LBV-OYEM</option>
                                        <option value="">OYEM-LBV</option>
                                        <option value="">FCV-BITAM</option>
                                        <option value="">FCV-LBV</option>
                                    </select>
                                    <span class="icon-clear"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="wallet-footer">
                        <ul class="d-flex justify-content-between align-items-center menu-tabs">

                            <li id="scan-qr" class="wallet-card-item nav-tab active">
                                <a class="fw_6" href="#" id="qR">
                                    <ul class="icon icon-my-qr">
                                        <li class="path1"></li>
                                        <li class="path2"></li>
                                        <li class="path3"></li>
                                        <li class="path4"></li>
                                        <li class="path5"></li>
                                        <li class="path6"></li>
                                        <li class="path7"></li>
                                    </ul>
                                    QR
                                </a>
                            </li>
                            <li id="scan-qr-2" class="wallet-card-item nav-tab">
                                <a class="fw_6 text-center" id="ticket">
                                    <ul class="icon icon-group-transfers">
                                        <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M5.87511 1.25C5.49974 1.24954 5.1266 1.30757 4.76911 1.422C4.00043 1.65173 3.32708 2.12475 2.85029 2.76998C2.37349 3.4152 2.11901 4.19775 2.12511 5V10C2.12564 10.7292 2.41554 11.4284 2.93115 11.944C3.44676 12.4596 4.14592 12.7495 4.87511 12.75H8.87511C9.07402 12.75 9.26479 12.671 9.40544 12.5303C9.54609 12.3897 9.62511 12.1989 9.62511 12V5C9.62379 4.00585 9.22827 3.05279 8.5253 2.34981C7.82232 1.64684 6.86926 1.25133 5.87511 1.25Z" fill="#DA9B00" />
                                            <path d="M23.6248 6.00002V20C23.625 20.3612 23.5541 20.7189 23.416 21.0527C23.2779 21.3865 23.0753 21.6897 22.8199 21.9452C22.5645 22.2006 22.2612 22.4031 21.9275 22.5412C21.5937 22.6793 21.236 22.7503 20.8748 22.75H10.8748C10.5136 22.7503 10.1558 22.6793 9.82208 22.5412C9.48831 22.4031 9.18505 22.2006 8.92964 21.9452C8.67422 21.6897 8.47167 21.3865 8.33356 21.0527C8.19545 20.7189 8.1245 20.3612 8.12477 20V4.25002C8.12328 3.54389 7.87275 2.86092 7.41729 2.32131C6.96182 1.78171 6.33062 1.42006 5.63477 1.30002C5.70929 1.26345 5.79184 1.24626 5.87477 1.25002H18.8748C20.1342 1.25108 21.3418 1.75186 22.2324 2.64243C23.1229 3.533 23.6237 4.74057 23.6248 6.00002Z" fill="#FECC0E" />
                                            <path d="M15.875 8.75H12.875C12.6761 8.75 12.4853 8.67098 12.3447 8.53033C12.204 8.38968 12.125 8.19891 12.125 8C12.125 7.80109 12.204 7.61032 12.3447 7.46967C12.4853 7.32902 12.6761 7.25 12.875 7.25H15.875C16.0739 7.25 16.2647 7.32902 16.4053 7.46967C16.546 7.61032 16.625 7.80109 16.625 8C16.625 8.19891 16.546 8.38968 16.4053 8.53033C16.2647 8.67098 16.0739 8.75 15.875 8.75Z" fill="white" />
                                            <path d="M18.875 11.75H12.875C12.6761 11.75 12.4853 11.671 12.3447 11.5303C12.204 11.3897 12.125 11.1989 12.125 11C12.125 10.8011 12.204 10.6103 12.3447 10.4697C12.4853 10.329 12.6761 10.25 12.875 10.25H18.875C19.0739 10.25 19.2647 10.329 19.4053 10.4697C19.546 10.6103 19.625 10.8011 19.625 11C19.625 11.1989 19.546 11.3897 19.4053 11.5303C19.2647 11.671 19.0739 11.75 18.875 11.75Z" fill="white" />
                                            <path d="M18.875 14.75H12.875C12.6761 14.75 12.4853 14.671 12.3447 14.5303C12.204 14.3897 12.125 14.1989 12.125 14C12.125 13.8011 12.204 13.6103 12.3447 13.4697C12.4853 13.329 12.6761 13.25 12.875 13.25H18.875C19.0739 13.25 19.2647 13.329 19.4053 13.4697C19.546 13.6103 19.625 13.8011 19.625 14C19.625 14.1989 19.546 14.3897 19.4053 14.5303C19.2647 14.671 19.0739 14.75 18.875 14.75Z" fill="white" />
                                            <path d="M18.875 17.75H12.875C12.6761 17.75 12.4853 17.671 12.3447 17.5303C12.204 17.3897 12.125 17.1989 12.125 17C12.125 16.8011 12.204 16.6103 12.3447 16.4697C12.4853 16.329 12.6761 16.25 12.875 16.25H18.875C19.0739 16.25 19.2647 16.329 19.4053 16.4697C19.546 16.6103 19.625 16.8011 19.625 17C19.625 17.1989 19.546 17.3897 19.4053 17.5303C19.2647 17.671 19.0739 17.75 18.875 17.75Z" fill="white" />
                                        </svg>
                                    </ul>
                                    Billets
                                </a>

                            </li>
                        </ul>
                        
                            <div id="qr-result" style="display:none;" class="qr-result-container">
                                <!-- Le contenu sera ajouté ici par le script -->
                            </div>
                    </div>
                </div>
            </div>

        </div>



        <div class="content-tab mx-3">
            <div class="tabs-list-item wrap-scan-camera">
                    <div id="reader">
                   
                    </div>
                    <!-- Ajoutez cet élément HTML pour afficher le résultat du QR code -->
                    

            </div>
            <ul id="list_ticket" class="tabs-list-item" >
        
            </ul>

        </div>
    </div>

    <?php
    //include 'menu_footer.php';
    ?>

    <!-- Modals pour les notifications et la politique de confidentialité 
    <div class="modal fade" id="modalhome1">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="heading">
                    <h4 class="fw_6 text-center">
                        “Voyageur241” Aimerait
                        Vous envoyer des notifications
                    </h4>
                    <p class="fw_4 mt-2 text-center">Les notifications peuvent inclure des alertes, des sons et des badges d’icône. Ceux-ci peuvent être configurés dans les paramètres.</p>
                </div>
                <div class="bottom">
                    <a href="#" class="secondary_color btn-hide-modal" data-bs-dismiss="modal" aria-label="Close">NE PAS AUTORISER</a>
                    <a href="#" class="primary_color btn-hide-modal" data-bs-toggle="modal" data-bs-target="#modalhome2" data-bs-dismiss="modal" aria-label="Close">AUTORISER</a>
                </div>
            </div>
        </div>
    </div>
    <div class="modal fade" id="modalhome2">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="heading">
                    <h2>Politique de confidentialité</h2>
                    <p class="mt-1 fw_3">
                        Une politique de confidentialité d’une application mobile est une déclaration juridique qui doit être claire, visible et approuvée par tous les utilisateurs. Elle doit divulguer la manière dont une application mobile collecte, stocke et utilise les informations personnellement identifiables qu’elle recueille auprès de ses utilisateurs.
                        Une application de confidentialité mobile est développée et présentée aux utilisateurs afin que les développeurs d’applications mobiles restent en conformité avec les lois nationales, fédérales et internationales. Par conséquent, ils remplissent l’obligation légale de protéger la vie privée des utilisateurs tout en protégeant l’entreprise elle-même contre les poursuites judiciaires.
                    </p>
                    <h2 class="mt-3">Utilisateurs autorisés</h2>
                    <p class="fw-3">
                        Une politique de confidentialité d’une application mobile est une déclaration juridique qui doit être claire, visible et approuvée par tous les utilisateurs. Elle doit divulguer la manière dont une application mobile collecte, stocke et utilise les informations personnellement identifiables qu’elle recueille auprès de ses utilisateurs.
                    </p>
                    <div class="group-cb mt-3 align-items-center">
                        <div class="cb">
                            <input type="checkbox" class="tf-checkbox st1" checked>
                        </div>
                        <span class="fw_3">J’accepte les conditions générales de service et la politique de confidentialité</span>
                    </div>
                </div>
                <div class="bottom mt-5">
                    <a href="#" id="acceptButton" class="tf-btn accent large" data-bs-dismiss="modal">J’accepte</a>
                </div>
            </div>
        </div>
    </div>-->
<div class="version-info text-center mt-4">
    <span class="version-text">Version : 1.20.24</span>
</div>
    <?php
    include 'footer.php';
    ?>