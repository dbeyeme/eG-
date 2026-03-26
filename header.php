<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <!-- Mobile Specific Metas -->
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, viewport-fit=cover">
    <title>Voyageur241</title>

    <!-- Favicon and Touch Icons  -->
    <link rel="shortcut icon" href="images/logo-YXujZMfe.svg" />
    <link rel="apple-touch-icon-precomposed" href="images/logo-YXujZMfe.svg" />
    <!-- Font -->
    <link rel="stylesheet" href="fonts/fonts.css" />
    <!-- Icons -->
    <link rel="stylesheet" href="fonts/icons-alipay.css">
    <link rel="stylesheet" href="styles/bootstrap.css">
    <link rel="stylesheet" href="styles/swiper-bundle.min.css">
    <link rel="stylesheet" type="text/css" href="styles/styles.css" />
    <link rel="manifest" href="_manifest.json" data-pwa-version="set_in_manifest_and_pwa_js">
    <link rel="apple-touch-icon" sizes="192x192" href="app/icons/icon-192x192.png">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">

    <!--<script src="https://cdn.jsdelivr.net/npm/html5-qrcode@2.3.8/minified/html5-qrcode.min.js"></script>-->
    <style>
         #reader {
            width: auto;
            height: 100vh;
            position: fixed;
            padding: 0;
            margin: 0;
            top: 0;
            left: 0;
            z-index: 1000;
            background-color: rgba(255, 255, 255, 255); /* Optional: to give a dark background */
        }

        #reader__dashboard_section_csr button {
            color: black;
        }

        #html5-qrcode-button-file-selection {
            color: black;
        }

        #reader__dashboard_section_csr button:hover  {
            color: #58d68d;
        }

        #html5-qrcode-button-file-selection:hover  {
            color: #58d68d;
        }

        .tabs-list-item{
            padding: 0;
            
            height: auto;
        }

        #qr-result {
            transition: opacity 2s ease-in-out; /* Transition de l'opacité sur 2 secondes */
            opacity: 1;
        }

        .fade-out {
            opacity: 0; /* Diminution de l'opacité à 0 */
        }
     
    </style>

</head>