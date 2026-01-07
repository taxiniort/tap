/* ==========================================================================
   INITIALISATION AU CHARGEMENT DU DOM
   ========================================================================== */

window.addEventListener('DOMContentLoaded', () => {
    // Remplissage des Tarifs Taxi depuis l'objet CONSTANTES
    document.getElementById('tarifA').value = CONSTANTES.taxi.tarifA;
    document.getElementById('tarifB').value = CONSTANTES.taxi.tarifB;
    document.getElementById('tarifC').value = CONSTANTES.taxi.tarifC;
    document.getElementById('tarifD').value = CONSTANTES.taxi.tarifD;
    document.getElementById('heureAttente').value = CONSTANTES.taxi.heureAttente;
    document.getElementById('priseChargeTAXI').value = CONSTANTES.taxi.priseChargeTAXI;

    // Remplissage des Tarifs CPAM depuis l'objet CONSTANTES
    document.getElementById('tarifKmCPAM').value = CONSTANTES.cpam.tarifKmCPAM;
    document.getElementById('priseChargeCPAM').value = CONSTANTES.cpam.priseChargeCPAM;
    document.getElementById('suppAireMetro').value = CONSTANTES.cpam.suppAireMetro;
    document.getElementById('majoMoins50').value = CONSTANTES.cpam.majoMoins50;
    document.getElementById('majo50etPlus').value = CONSTANTES.cpam.majo50etPlus;

    // Remplissage des Abattements Transport Partagé
    document.getElementById('abatt2pass').value = CONSTANTES.cpam.abatt2pass;
    document.getElementById('abatt3pass').value = CONSTANTES.cpam.abatt3pass;
    document.getElementById('abatt4pass').value = CONSTANTES.cpam.abatt4pass;
});

/* ==========================================================================
   GESTION DES ONGLETS
   ========================================================================== */

/**
 * Gère le basculement entre les différents onglets de l'application
 */
function openTab(tabId, event) {
    // Désactivation de tous les onglets et contenus
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));

    // Activation de l'onglet cliqué
    document.getElementById(tabId).classList.add('active');
    if (event) event.currentTarget.classList.add('active');

    // Reset visuel de la bande de type (Consultation/Hospit) lors du changement d'onglet
  /*  const bandes = document.querySelectorAll(".type-bande");
    bandes.forEach(b => {
        b.textContent = "";
        b.style.display = "none";
        b.classList.remove("consultation", "hospitalisation");
    });*/
}

/* ==========================================================================
   MOTEUR DE CALCUL
   ========================================================================== */

/**
 * Fonction centrale de calcul des tarifs Taxi et CPAM (TAP)
 * @param {Object} passager - Contient distance, durée, nuit, aire métro
 * @returns {Object|null} - Les totaux calculés ou null si distance invalide
 */
function calculerTarif(passager) {
    // Récupération des paramètres saisis dans l'onglet Paramètres
    const tarifA = parseFloat(document.getElementById('tarifA').value);
    const tarifB = parseFloat(document.getElementById('tarifB').value);
    const tarifC = parseFloat(document.getElementById('tarifC').value);
    const tarifD = parseFloat(document.getElementById('tarifD').value);
    const tarifKmCPAM = parseFloat(document.getElementById('tarifKmCPAM').value);
    const tarifMinute = parseFloat(document.getElementById('heureAttente').value) / 60;
    const priseChargeTAXI = parseFloat(document.getElementById('priseChargeTAXI').value);
    const priseChargeCPAM = parseFloat(document.getElementById('priseChargeCPAM').value);
    const suppAireMetro = parseFloat(document.getElementById('suppAireMetro').value);
    const majo50etPlus = parseFloat(document.getElementById('majo50etPlus').value);
    const majoMoins50 = parseFloat(document.getElementById('majoMoins50').value);

    // Données spécifiques au passager
    const distance = Math.abs(parseFloat(passager.distance)) || 0;
    const dureeAttente = Math.abs(parseFloat(passager.dureeAttente)) || 0;
    const tarifNuit = passager.tarifNuit || false;
    const aireMetro = passager.aireMetro || false;

    if (distance <= 0) return null;

    let suppGdeVille = aireMetro ? suppAireMetro : 0;
    let totalTaxi = 0;
    let totalCPAM = 0;
    let textType = "";

    if (dureeAttente <= 0) {
        /* CAS 1 : HOSPITALISATION (Aller simple) */
        textType = "Hospitalisation";
        totalTaxi = !tarifNuit
            ? priseChargeTAXI + distance * tarifC
            : priseChargeTAXI + distance * tarifD;

        // Calcul CPAM avec majoration selon distance
        if (distance < 50) {
            totalCPAM = priseChargeCPAM + (distance - 4) * tarifKmCPAM * majoMoins50;
        } else {
            totalCPAM = priseChargeCPAM + (distance - 4) * tarifKmCPAM * majo50etPlus;
        }
        totalCPAM += suppGdeVille;
        totalCPAM *= (tarifNuit ? 1.5 : 1);
    } else {
        /* CAS 2 : CONSULTATION (Aller/Retour avec attente) */
        textType = "Consultation";
        totalTaxi = !tarifNuit
            ? priseChargeTAXI + distance * 2 * tarifA + dureeAttente * tarifMinute
            : priseChargeTAXI + distance * 2 * tarifB + dureeAttente * tarifMinute;
        
        // Calcul CPAM spécifique consultation (base x2)
        totalCPAM = ((priseChargeCPAM + suppGdeVille + ((distance - 4) * tarifKmCPAM)) * (tarifNuit ? 1.5 : 1)) * 2;
    }

    return { totalTaxi, totalCPAM, textType };
}

/* ==========================================================================
   LOGIQUE DE L'ONGLET ACCUEIL (Un seul passager)
   ========================================================================== */

function afficherTarifUnPassager() {
    const passager = {
        distance: document.getElementById('distance').value,
        dureeAttente: document.getElementById('dureeAttente').value,
        tarifNuit: document.getElementById('tarifNuit').checked,
        aireMetro: document.getElementById('aireMetro').checked
    };

    const resultats = calculerTarif(passager);
    const resultsContainer = document.getElementById('resultsContainer');

    if (!resultats) {
        resultsContainer.innerHTML = `
            <div id="resultTaxi" class="resultBox">Veuillez renseigner la distance totale du trajet ❗</div>
            <div id="resultCPAM" class="resultBox"></div>
            <div id="resultRemise" class="resultBox"></div>
        `;
        majTypeAffichage('');
        return;
    }

    let totalTaxi = resultats.totalTaxi;
    let totalCPAM = resultats.totalCPAM;
    const remise = 100 - (totalCPAM / totalTaxi * 100);

    majTypeAffichage(resultats.textType);

    resultsContainer.innerHTML = `
        <div id="resultTaxi" class="resultBox">🚖 Tarif estimé TAXI : ${totalTaxi.toFixed(2)} €</div>
        <div id="resultCPAM" class="resultBox">🚑 Tarif estimé TAP : ${totalCPAM.toFixed(2)} €</div>
        <div id="resultRemise" class="resultBox">
            ${remise >= 0 
                ? `Remise effective : ${remise.toFixed(1)} %` 
                : `Pas de remise, le tarif TAP est plus intéressant`}
        </div>
    `;
}

/* ==========================================================================
   LOGIQUE DU TRANSPORT PARTAGÉ
   ========================================================================== */

/**
 * Crée les champs de saisie dynamiquement selon le nombre de passagers
 */
function genererFormulairesPassagers() {
    const container = document.getElementById('passengersContainer');
    container.innerHTML = ''; 
    
    const nbPassagers = parseInt(document.getElementById('nbPassagers').value) || 1;
    if (nbPassagers > 6) return; // Limite technique à 6 passagers
    
    for (let i = 1; i <= nbPassagers; i++) {
        const div = document.createElement('div');
        div.className = 'passenger-block';
        div.innerHTML = `
            <h3>⚜ Passager ${i} ⚜</h3>
            <label for="distance_${i}">Distance parcourue (juste l'aller)</label>
            <input type="number" id="distance_${i}" step="0.1">

            <label for="dureeAttente_${i}">Durée attente (minutes)</label>
            <input type="number" id="dureeAttente_${i}">

            <div class="checkbox-container">
                <input type="checkbox" id="aireMetro_${i}">
                <label for="aireMetro_${i}">Aire métropolitaine ?</label>
            </div>

            <div class="checkbox-container">
                <input type="checkbox" id="tarifNuit_${i}">
                <label for="tarifNuit_${i}">Tarif nuit ?</label>
            </div>
        `;
        container.appendChild(div);
    }
}

/**
 * Calcule et affiche les résultats pour tous les passagers partagés
 */
function afficherTarifNPassagers() {
    const nbPassagers = parseInt(document.getElementById('nbPassagers').value) || 1;
    const resultsDiv = document.getElementById('resultsPartage');
    resultsDiv.innerHTML = '';

    const abatt2pass = parseFloat(document.getElementById('abatt2pass').value);
    const abatt3pass = parseFloat(document.getElementById('abatt3pass').value);
    const abatt4pass = parseFloat(document.getElementById('abatt4pass').value);
    
    for (let i = 1; i <= nbPassagers; i++) {
        const passager = {
            distance: document.getElementById(`distance_${i}`).value,
            dureeAttente: document.getElementById(`dureeAttente_${i}`).value,
            tarifNuit: document.getElementById(`tarifNuit_${i}`).checked,
            aireMetro: document.getElementById(`aireMetro_${i}`).checked
        };

        let resultats = calculerTarif(passager);
        if (!resultats) continue;

        let totalTaxi = resultats.totalTaxi;
        let totalCPAM = resultats.totalCPAM;

        // Application de l'abattement réglementaire selon le nombre de passagers
        let reduction = 0;
        if (nbPassagers === 2) reduction = abatt2pass;
        else if (nbPassagers === 3) reduction = abatt3pass;
        else if (nbPassagers >= 4) reduction = abatt4pass;
        
        totalCPAM *= (1 - reduction);

        const result = document.createElement('div');
        result.className = 'passenger-result';
        result.innerHTML = `
            <h4>Passager ${i}</h4>
            <div>🚖 Tarif estimé TAXI : ${totalTaxi.toFixed(2)} €</div>
            <div>🚑 Tarif estimé TAP : ${totalCPAM.toFixed(2)} €</div>
        `;
        resultsDiv.appendChild(result);
        
        // Met à jour la bande de type basée sur le premier passager
        if(i === 1) majTypeAffichage(resultats.textType);
    }
}

/* ==========================================================================
   UTILITAIRES ET AFFICHAGE
   ========================================================================== */

/**
 * Ouvre une fenêtre popup pour consulter les villes en zone métropolitaine
 */
function ouvrirListe() {
    const data = LISTE_AIRE_METRO.slice(); 

    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    overlay.onclick = () => { overlay.remove(); popup.remove(); };
    document.body.appendChild(overlay);

    const popup = document.createElement('div');
    popup.className = 'popup-liste';
    popup.innerHTML = `
        <div class="popup-close" onclick="this.parentElement.remove(); document.querySelector('.popup-overlay').remove();">✖</div>
        <div class="popup-title">Aires Métropolitaines</div>
        <input type="text" class="popup-search" placeholder="Rechercher...">
        <div class="popup-list">${data.map(item => `<div>${item}</div>`).join('')}</div>
    `;
    document.body.appendChild(popup);

    const searchInput = popup.querySelector('.popup-search');
    const listDiv = popup.querySelector('.popup-list');

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        listDiv.innerHTML = data
            .filter(item => item.toLowerCase().includes(query))
            .map(item => `<div>${item}</div>`)
            .join('');
    });
}

/**
 * Gère l'affichage du badge "Consultation" ou "Hospitalisation"
 */
function majTypeAffichage(type) {
    const ongletActif = document.querySelector('.tab-content.active');
    if (!ongletActif) return;

    const bande = ongletActif.querySelector(".type-bande");
    if (!bande) return;

    bande.classList.remove("consultation", "hospitalisation");
    bande.textContent = "";
    bande.style.display = "none";

    if (type && type.trim() !== "") {
        bande.textContent = type;
        bande.style.display = "inline-flex";
        
        if (type.toLowerCase().includes("consult")) {
            bande.classList.add("consultation");
        } else if (type.toLowerCase().includes("hospit")) {
            bande.classList.add("hospitalisation");
        }
    }
}

/* ==========================================================================
   GESTION DU CHAMP DÉPARTEMENT
   ========================================================================== */

const deptInput = document.getElementById("deptInput");

// Efface le champ si égal à 79 lors du focus
deptInput.addEventListener("focus", () => {
    if(deptInput.value === "79") deptInput.value = "";
});

// Remet 79 si quitté vide
deptInput.addEventListener("blur", () => {
    if(deptInput.value.trim() === "") deptInput.value = "79";
});

// Message d'alerte si département différent de 79
let messageDiv = document.createElement('div');
messageDiv.id = 'deptMessage';
messageDiv.style.cssText = 'color:red; font-size:12px; margin-top:4px;';
deptInput.parentNode.appendChild(messageDiv);

deptInput.addEventListener('blur', function() {
    const value = deptInput.value.trim();
    messageDiv.textContent = (value !== '79' && value !== "") ? `Dép. ${value} non pris en charge.` : '';
});