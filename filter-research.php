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
    <div class="header mb-1 is-fixed">
        <div class="tf-container">
            <div class="tf-statusbar d-flex justify-content-center align-items-center">
                <a href="history.php" class="left-back"> <i class="icon-left"></i> </a>
                <h3>Filtre</h3>
            </div>
        </div>
    </div>
    <div id="app-wrap" class="style1">
        <div class="wrap-filter-rs bg_white_color mt-1">
            <div class="tf-container">
                <div class="filter-rs">
                    <div class="input-field">
                        <span class="icon-search"></span>
                        <input required class="search-field value_input" placeholder="Recherche" type="text">
                        <span class="icon-clear"></span>
                    </div>
                    <a href="#" id="btn-popup-up"><i class="icon-filter"></i> </a>
    
                </div>
            </div>
        </div>
        
        <div class="bg_white_color">
            <div class="tf-container">
                <div class="trading-month">
                    <h4 class="fw_5 mb-3">Novembre</h4>
                    <div class="group-trading-history mb-5">
                        <a class="tf-trading-history" href="#">
                            <div class="inner-left">
                                <div class="icon-box rgba_primary">
                                    <i class="icon icon-mobile"></i>
                                </div>
                                <div class="content">
                                    <h4>Ticket 123654</h4>
                                    <p>Aujourd'hui 10:27</p>
                                </div>
                            </div>
                            <span class="num-val critical_color">- 10 000 FCFA</span>
                        </a>
                        <a class="tf-trading-history" href="#">
                            <div class="inner-left">
                                 <div class="icon-box rgba_primary">
                                    <i class="icon icon-mobile"></i>
                                </div>
                                <div class="content">
                                    <h4>Ticket 7896412</h4>
                                    <p>Aujourd'hui 7:30</p>
                                </div>
                            </div>
                            <span class="num-val success_color">+ 50 500 FCFA</span>
                        </a>
                     
                    </div>
                </div>
                <div class="trading-month">
                    <h4 class="fw_5 mb-3">Octobre</h4>
                    <div class="group-trading-history mb-5">
                    <a class="tf-trading-history" href="#">
                            <div class="inner-left">
                                <div class="icon-box rgba_primary">
                                    <i class="icon icon-mobile"></i>
                                </div>
                                <div class="content">
                                    <h4>Ticket 123654</h4>
                                    <p>Aujourd'hui 10:27</p>
                                </div>
                            </div>
                            <span class="num-val critical_color">- 10 000 FCFA</span>
                        </a>
                    </div>
                </div>
                <div class="trading-month pb-1">
                    <h4 class="fw_5 mb-3">Septembre</h4>
                    <div class="group-trading-history mb-5">
                    <a class="tf-trading-history" href="#">
                            <div class="inner-left">
                                <div class="icon-box rgba_primary">
                                    <i class="icon icon-mobile"></i>
                                </div>
                                <div class="content">
                                    <h4>Ticket 123654</h4>
                                    <p>Aujourd'hui 10:27</p>
                                </div>
                            </div>
                            <span class="num-val critical_color">- 10 000 FCFA</span>
                        </a>
                        <a class="tf-trading-history" href="#">
                            <div class="inner-left">
                                 <div class="icon-box rgba_primary">
                                    <i class="icon icon-mobile"></i>
                                </div>
                                <div class="content">
                                    <h4>Ticket 7896412</h4>
                                    <p>Aujourd'hui 7:30</p>
                                </div>
                            </div>
                            <span class="num-val success_color">+ 50 500 FCFA</span>
                        </a>
                    </div>
                </div>
    
            </div>
        </div>
    </div>


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
                        <li><a href="#"class="tf-btn large active">Tous</a></li>
                        <li><a href="#"class="tf-btn large">Jan</a></li>
                        <li><a href="#"class="tf-btn large">Feb</a></li>
                        <li><a href="#"class="tf-btn large">Mar</a></li>
                        <li><a href="#"class="tf-btn large">Avr</a></li>
                        <li><a href="#"class="tf-btn large">Mai</a></li>
                        <li><a href="#"class="tf-btn large">Juin</a></li>
                        <li><a href="#"class="tf-btn large">Juil</a></li>
                        <li><a href="#"class="tf-btn large">Aout</a></li>
                        <li><a href="#"class="tf-btn large">Sep</a></li>
                        <li><a href="#"class="tf-btn large">Oct</a></li>
                        <li><a href="#"class="tf-btn large">Nov</a></li>
                        <li><a href="#"class="tf-btn large">Dec</a></li>
                    </ul>
                </div>
            </div>
            <div class="mt-1">
                <div class="container">
                    <h4 class="mt-3 mb-3">Statuts</h4>
                    <ul class="filter-history status">
                        <li><a href="#"class="tf-btn large active">Tous</a></li>
                        <li><a href="#"class="tf-btn large">Vérifié</a></li>
                        <li><a href="#"class="tf-btn large">En attente</a></li>
                        <li><a href="#"class="tf-btn large">Annullé</a></li>
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