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
    /* const bandes = document.querySelectorAll(".type-bande");
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

/* ==========================================================================
   Carburant
   ========================================================================== */
/**
 * Récupère les prix des carburants pour un code postal donné
 * @param {string} codePostal - Le code postal (ex: "79000")
 */
async function chercherCarburant() {
    const cp = document.getElementById('cpCarbu').value;
    const container = document.getElementById('resultsCarbu');
    const loader = document.getElementById('loaderCarbu');

    if (!cp || cp.length !== 5) {
        alert("Veuillez entrer un code postal valide");
        return;
    }

    loader.style.display = "block";
    container.innerHTML = "";

    try {
        // ÉTAPE 1 : Trouver les coordonnées GPS du Code Postal (via l'API officielle adresse.data.gouv.fr)
        const gpsRes = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${cp}&postcode=${cp}&limit=1`);
        const gpsData = await gpsRes.json();
        
        if (!gpsData.features || gpsData.features.length === 0) {
            throw new Error("Code postal introuvable");
        }

        const [lon, lat] = gpsData.features[0].geometry.coordinates;

        // ÉTAPE 2 : Chercher les carburants dans un rayon de 10km autour de ce point
        const url = `https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/records?where=within_distance(geom%2C%20geom'POINT(${lon}%20${lat})'%2C%2010km)&limit=50`;

        const response = await fetch(url);
        const data = await response.json();
        loader.style.display = "none";

        if (!data.results || data.results.length === 0) {
            container.innerHTML = "<p style='text-align:center;'>Aucune station dans un rayon de 10km.</p>";
            return;
        }

        // --- LOGIQUE DE TRI ---
        const stationsTriees = data.results.sort((a, b) => {
            const obtenirPrixGazole = (station) => {
                const prixList = typeof station.prix === 'string' ? JSON.parse(station.prix) : (station.prix || []);
                const gazole = prixList.find(p => p['@nom'] === "Gazole");
                return gazole ? parseFloat(gazole['@valeur']) : Infinity;
            };
            return obtenirPrixGazole(a) - obtenirPrixGazole(b);
        });

        // --- AFFICHAGE ---
        stationsTriees.forEach((station, index) => {
            const adresse = station.adresse || "Adresse non renseignée";
            const ville = (station.ville || "Ville inconnue").toUpperCase();
            const urlMaps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(adresse + ' ' + ville)}`;

            const badgeMoinsCher = (index === 0) 
                ? `<div style="background: #FFD700; color: #000; font-size: 0.7em; font-weight: bold; padding: 2px 8px; border-radius: 10px; margin-bottom: 8px; display: inline-block; border: 1px solid #b8860b;">🏆 LE MOINS CHER (Rayon 10km)</div>` 
                : "";

            let htmlStation = `
                <div style="background: #fff; border: ${index === 0 ? '2px solid #FFD700' : '1px solid #ddd'}; padding: 12px; border-radius: 8px; margin-bottom: 12px; text-align: left; box-shadow: 0 2px 4px rgba(0,0,0,0.05); position: relative;">
                    ${badgeMoinsCher}
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                        <strong style="color: #2c3e50; font-size: 1.1em;">📍 ${ville}</strong>
                        <a href="${urlMaps}" target="_blank" style="text-decoration: none; background-color: #4285F4; color: white; padding: 6px 12px; border-radius: 4px; font-size: 0.8em; font-weight: bold;">🗺️ Maps</a>
                    </div>
                    <div style="color: #333; font-weight: 500; font-size: 0.9em; margin-bottom: 10px;">${adresse}</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            `;

            if (station.prix) {
                const prixList = typeof station.prix === 'string' ? JSON.parse(station.prix) : station.prix;
                prixList.forEach(p => {
                    const valeur = parseFloat(p['@valeur']).toFixed(3);
                    const estGazole = p['@nom'] === "Gazole";
                    htmlStation += `
                        <div style="background: ${estGazole ? '#fff9f9' : '#fdfdfd'}; padding: 6px; border-radius: 4px; border-left: 3px solid #8B0000; border-bottom: 1px solid #eee;">
                            <span style="font-size: 0.7em; font-weight: bold; display: block; color: #7f8c8d; text-transform: uppercase;">${p['@nom']}</span>
                            <span style="color: #8B0000; font-weight: bold; font-size: 1.1em;">${valeur}€</span>
                        </div>`;
                });
            }
            htmlStation += `</div></div>`;
            container.innerHTML += htmlStation;
        });

    } catch (error) {
        loader.style.display = "none";
        container.innerHTML = `<p style='color:red; text-align:center;'>Erreur : ${error.message}</p>`;
    }
}

function ouvrirCarteCarbu() {
    const cp = document.getElementById('cpCarbu').value;
    
    if (!cp || cp.length !== 5) {
        alert("Veuillez entrer un code postal à 5 chiffres pour centrer la carte.");
        return;
    }
    
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.8); z-index: 1000; display: flex;
        justify-content: center; align-items: center; padding: 10px;
    `;
    
    const popup = document.createElement('div');
    popup.style.cssText = `
        position: relative; width: 100%; max-width: 900px; height: 85%;
        background: white; border-radius: 12px; overflow: hidden;
        box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    `;

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = "✖ Fermer";
    closeBtn.style.cssText = `
        position: absolute; top: 10px; right: 10px; z-index: 1001;
        padding: 10px 20px; background: #e74c3c; color: white;
        border: none; border-radius: 5px; cursor: pointer; font-weight: bold;
    `;
    
    const iframe = document.createElement('iframe');
    
    // CONSTRUCTION DE L'URL DYNAMIQUE
    const baseUrl = "https://data.economie.gouv.fr/explore/embed/dataset/prix-des-carburants-en-france-flux-instantane-v2/map/";
    const params = `?q=${cp}&refine.cp=${cp}&basemap=6827db&static=false&datasetcard=false&scrollWheelZoom=true`;
    
    iframe.src = baseUrl + params;
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "none";

    popup.appendChild(closeBtn);
    popup.appendChild(iframe);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    closeBtn.onclick = () => overlay.remove();
    overlay.onclick = (e) => { if(e.target === overlay) overlay.remove(); };
}