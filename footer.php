<!--Index-->
<script type="text/javascript" src="javascript/password-addon.js"></script>
<script type="text/javascript" src="javascript/init.js"></script>
<!--Accueil-->
<script type="text/javascript" src="javascript/jquery.min.js"></script>
<script type="text/javascript" src="javascript/bootstrap.min.js"></script>
<script type="text/javascript" src="javascript/swiper-bundle.min.js"></script>
<script type="text/javascript" src="javascript/swiper.js"></script>
<script type="text/javascript" src="javascript/main.js"></script>

<!--Verification otp_1-->
<script type="text/javascript" src="javascript/count-down.js"></script>
<script type="text/javascript" src="javascript/verify-input.js"></script>
<!--Verification histirique-->
<script type="text/javascript" src="javascript/swiper-bundle.min.js"></script>
<script type="text/javascript" src="javascript/swiper.js"></script>

<!--Verification otp_2--><script src="javascript/html5-qrcode.min.js"></script>
<audio id="success-audio" src="3beeps-108353.mp3" hidden></audio>
<audio id="failure-audio" src="censor-beep-1sec-8112.mp3" hidden></audio>

<script>
    // Initialiser ou récupérer la liste des tickets scannés depuis le LocalStorage
    const scannedTickets = JSON.parse(localStorage.getItem('scannedTickets')) || [];
    let scanCooldown = false;

    // Fonction pour vérifier si un ticket est déjà scanné
    function isTicketScanned(ticketNumber) {
        return scannedTickets.some(ticket => ticket.number === ticketNumber);
    }

    // Fonction pour générer un matricule aléatoire pour chaque ticket
    function generateRandomMatricule() {
        return Math.floor(100000 + Math.random() * 900000); // Matricule aléatoire à 6 chiffres
    }

    // Fonction pour obtenir la date et l'heure actuelles
    function getCurrentDateTime() {
        const now = new Date();
        const date = now.toLocaleDateString();
        const time = now.toLocaleTimeString();
        return { date, time };
    }

    // Fonction pour ajouter un ticket à la liste
    function addTicketToList(ticketNumber, status, validity) {
        if (isTicketScanned(ticketNumber)) {
            displayTicket('Déjà scanné', ticketNumber, 'critical_color', 'Ticket déjà scanné', 'fa-times-circle');
            return;
        }

        const { date, time } = getCurrentDateTime();
        const matricule = generateRandomMatricule();

        const ticketData = { number: ticketNumber, status, validity, date, time, matricule };
        
        // Ajouter le ticket en première position pour que le plus récent soit toujours en tête de liste
        scannedTickets.unshift(ticketData);

        localStorage.setItem('scannedTickets', JSON.stringify(scannedTickets));
        displayTicket(status, ticketNumber, validity === 'Vérifié' ? 'primary_color' : 'critical_color', status, validity === 'Vérifié' ? 'fa-check-circle' : 'fa-times-circle', date, time, matricule);
    }

    // Fonction pour afficher un ticket dans le DOM
    function displayTicket(status, ticketNumber, colorClass, statusText, iconClass, date, time, matricule) {
        const ticketList = document.getElementById('list_ticket');
        
        const listItem = document.createElement('li');
        listItem.className = 'list-card-invoice';
        listItem.innerHTML = `
            <div class="logo">
                <i class="fas ${iconClass}" style="font-size: 25px; color: ${colorClass === 'primary_color' ? 'green' : 'red'};"></i>
            </div>
            <div class="content-right">
                <h4><a href="#">${ticketNumber} <span class="${colorClass}">${statusText}</span></a></h4>
                <p>Ticket N° ${ticketNumber} <br> Matricule : ${matricule} <br> Date : ${date} <br> Heure : ${time}</p>
            </div>
        `;
        
        // Ajouter le ticket en première position pour l'affichage (le plus récent en haut)
        ticketList.insertBefore(listItem, ticketList.firstChild);
    }

    // Afficher les tickets scannés au chargement de la page
    document.addEventListener('DOMContentLoaded', function () {
        scannedTickets.forEach(ticket => {
            displayTicket(
                ticket.status, 
                ticket.number, 
                ticket.validity === 'Vérifié' ? 'primary_color' : 'critical_color', 
                ticket.status, 
                ticket.validity === 'Vérifié' ? 'fa-check-circle' : 'fa-times-circle',
                ticket.date,
                ticket.time,
                ticket.matricule
            );
        });

        // Initialiser le scanner QR code avec html5-qrcode
        const html5QrcodeScanner = new Html5QrcodeScanner("reader", {
            fps: 10,
            qrbox: 250,
            experimentalFeatures: {
                useBarCodeDetectorIfSupported: true
            }
        });

        html5QrcodeScanner.render(onScanSuccess);
    });

    // Gestion du scan avec prévention des scans rapides
    function onScanSuccess(decodedText, decodedResult) {
        if (scanCooldown) return;

        scanCooldown = true;
        setTimeout(() => {
            scanCooldown = false;
        }, 2000);

        let status = 'Inconnu';
        let validity = 'Annulé';
        let messageHTML = '';

        if (decodedText.startsWith('http://') || decodedText.startsWith('https://')) {
            status = 'Vérifié';
            validity = 'Vérifié';
            messageHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; background-color: #d4edda; border: 2px solid #28a745; padding: 20px; border-radius: 10px;">
                    <div style="font-size: 50px; color: #28a745;">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h2 style="color: #28a745;">Ticket Vérifié !</h2>
                    <p>Votre ticket est authentifié avec succès !</p>
                    <p>Données QR : ${decodedText}</p>
                </div>
            `;
        } else if (decodedText.includes('waiting')) {
            status = 'En Attente';
            validity = 'En Attente';
            messageHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; background-color: #fff3cd; border: 2px solid #ffc107; padding: 20px; border-radius: 10px;">
                    <div style="font-size: 50px; color: #ffc107;">
                        <i class="fas fa-clock"></i>
                    </div>
                    <h2 style="color: #ffc107;">Ticket en attente !</h2>
                    <p>Données QR : ${decodedText}</p>
                </div>
            `;
        } else {
            messageHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; background-color: #f8d7da; border: 2px solid #dc3545; padding: 20px; border-radius: 10px;">
                    <div style="font-size: 50px; color: #dc3545;">
                        <i class="fas fa-times-circle"></i>
                    </div>
                    <h2 style="color: #dc3545;">Ticket Inconnu !</h2>
                    <p>Données QR : ${decodedText}</p>
                </div>
            `;
        }

        const qrResultElement = document.getElementById('qr-result');
        qrResultElement.innerHTML = messageHTML;
        qrResultElement.style.display = 'block';

        setTimeout(() => {
            qrResultElement.style.display = 'none';
        }, 7000);

        if (status === 'Vérifié') {
            document.getElementById('success-audio').play();
        } else {
            document.getElementById('failure-audio').play();
        }

        addTicketToList(decodedText, status, validity);
    }

    // Gestion de la permission et démarrage automatique du scanner
    function clickCameraPermissionAndStart() {
        const permissionButton = document.getElementById('html5-qrcode-button-camera-permission');
        const startButton = document.getElementById('html5-qrcode-button-camera-start');
        const dashboardElement = document.getElementById('reader__dashboard_section');
        const cameraSelect = document.getElementById('html5-qrcode-select-camera');

        if (permissionButton && permissionButton.style.display !== 'none') {
            permissionButton.click();
        }

        if (cameraSelect && cameraSelect.style.display !== 'none') {
            for (let i = 0; i < cameraSelect.options.length; i++) {
                if (cameraSelect.options[i].text.toLowerCase().includes('facing back')) {
                    cameraSelect.selectedIndex = i;
                    const event = new Event('change');
                    cameraSelect.dispatchEvent(event);
                    break;
                }
            }
        }

        if (startButton && startButton.style.display !== 'none') {
            startButton.click();
        }

        if (dashboardElement) {
            dashboardElement.style.display = 'none';
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        setTimeout(() => {
            clickCameraPermissionAndStart();
        }, 1000);
    });
</script>


</body>

</html>