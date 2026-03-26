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
    <div class="header is-fixed">
        <div class="tf-container">
            <div class="tf-statusbar d-flex justify-content-center align-items-center">
                <a href="#" class="back-btn"> <i class="icon-left"></i> </a>
                <h3>Historique</h3>
                <a href="#" id="btn-popup-up" class="action-right"><i class="icon icon-filter"></i> </a>
            </div>
        </div>
    </div>
    <div id="app-wrap">
        <div class="app-section st1 mt-1 bg_white_color">
            <div class="tf-container">
                <div class="wrap-total">
                    <div class="total-item">
                        <a href="#" class="box-icon bg_primary"><i class="icon-arrow-up_minor primary_color"></i></a>
                        <div class="content">
                            <p class="fw_4">Entrée </p>
                            <h2 class="fw_6 success_color">15 000 FCFA</h2>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="app-section st1 mt-1 mb-5 bg_white_color">
            <div class="tf-container">
                <div class="trading-month">
                    <h4 class="fw_5 mb-3">Novembre</h4>
                    <div class="group-trading-history mb-5">
                        <a class="tf-trading-history" href="filter-research.php">
                            <div class="inner-left">
                                <div class="icon-box">
                                    <i class="icon icon-mobile"></i>
                                </div>
                                <div class="content">
                                    <h4>Tiket N° 24568796</h4>
                                    <p>Aujourd'hui 10:27</p>
                                </div>
                            </div>
                            <span class="num-val success_color">12 000 FCFA</span>
                        </a>
                        <a class="tf-trading-history" href="filter-research.php">
                            <div class="inner-left">
                                <div class="icon-box">
                                    <i class="icon icon-mobile"></i>
                                </div>
                                <div class="content">
                                    <h4>Tiket N° 34568796</h4>
                                    <p>Aujourd'hui 7:30</p>
                                </div>
                            </div>
                            <span class="num-val critical_color">-10 000 FCFA</span>
                        </a>

                    </div>
                </div>
                <div class="trading-month">
                    <h4 class="fw_5 mb-3">Octobre</h4>
                    <div class="group-trading-history mb-5">
                        <a class="tf-trading-history" href="filter-research.php">
                            <div class="inner-left">
                                <div class="icon-box">
                                    <i class="icon icon-mobile"></i>
                                </div>
                                <div class="content">
                                    <h4>Tiket N° 74568790</h4>
                                    <p>Il y a 1 jour à 17:27</p>
                                </div>
                            </div>
                            <span class="num-val critical_color">-7 500 FCFA</span>
                        </a>
                    </div>
                </div>
                <div class="trading-month">
                    <h4 class="fw_5 mb-3">Septembre</h4>
                    <div class="group-trading-history mb-5">
                        <a class="tf-trading-history" href="filter-research.php">
                            <div class="inner-left">
                                <div class="icon-box">
                                    <i class="icon icon-mobile"></i>
                                </div>
                                <div class="content">
                                    <h4>Tiket N° 74568790</h4>
                                    <p>Il y a 1 jour à 17:27</p>
                                </div>
                            </div>
                            <span class="num-val success_color">7 500 FCFA</span>
                        </a>
                        <a class="tf-trading-history" href="filter-research.php">
                            <div class="inner-left">
                                <div class="icon-box">
                                    <i class="icon icon-mobile"></i>
                                </div>
                                <div class="content">
                                    <h4>Tiket N° 34568796</h4>
                                    <p>Aujourd'hui 7:30</p>
                                </div>
                            </div>
                            <span class="num-val success_color">30 000 FCFA</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>


    <?php
    include 'menu_footer.php';
    ?>


    <div class="tf-panel up">
        <div class="panel-box panel-up panel-filter-history">
            <div class="header mb-1 is-fixed">
                <div class="tf-container">
                    <div class="tf-statusbar d-flex justify-content-center align-items-center">
                        <a href="#" class="clear-panel"> <i class="icon-left"></i> </a>
                        <h3>Filtres</h3>
                    </div>
                </div>
            </div>
            <div id="app-wrap" class="style1">
                <div class="mt-6">
                    <div class="tf-container">
                        <h4 class="mt-3 mb-3">Mois</h4>
                        <ul class="filter-history">
                            <li><a href="#" class="tf-btn large active">Tous</a></li>
                            <li><a href="#" class="tf-btn large">Jan</a></li>
                            <li><a href="#" class="tf-btn large">Feb</a></li>
                            <li><a href="#" class="tf-btn large">Mar</a></li>
                            <li><a href="#" class="tf-btn large">Avr</a></li>
                            <li><a href="#" class="tf-btn large">Mai</a></li>
                            <li><a href="#" class="tf-btn large">Juin</a></li>
                            <li><a href="#" class="tf-btn large">Juil</a></li>
                            <li><a href="#" class="tf-btn large">Aout</a></li>
                            <li><a href="#" class="tf-btn large">Sep</a></li>
                            <li><a href="#" class="tf-btn large">Oct</a></li>
                            <li><a href="#" class="tf-btn large">Nov</a></li>
                            <li><a href="#" class="tf-btn large">Dec</a></li>
                        </ul>
                    </div>
                </div>
                <div class="mt-1">
                    <div class="container">
                        <h4 class="mt-3 mb-3">Statuts</h4>
                        <ul class="filter-history status">
                            <li><a href="#" class="tf-btn large active">Tous</a></li>
                            <li><a href="#" class="tf-btn large">Vérifié</a></li>
                            <li><a href="#" class="tf-btn large">En attente</a></li>
                            <li><a href="#" class="tf-btn large">Annullé</a></li>
                        </ul>
                    </div>
                </div>
                <div class="box-btn">
                    <div class="tf-container">
                        <a href="filter-research.php" class="tf-btn accent large">Appliquer</a>

                    </div>
                </div>
            </div>




        </div>

    </div>

    <?php
    include 'footer.php';
    ?>