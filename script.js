/* ==========================================================================
   INITIALISATION AU CHARGEMENT DU DOM
   ========================================================================== */

// Attend que le HTML soit totalement chargé avant d'exécuter le script
window.addEventListener('DOMContentLoaded', () => {
    // Remplissage automatique des Tarifs Taxi dans le formulaire depuis l'objet CONSTANTES
    document.getElementById('tarifA').value = CONSTANTES.taxi.tarifA;
    document.getElementById('tarifB').value = CONSTANTES.taxi.tarifB;
    document.getElementById('tarifC').value = CONSTANTES.taxi.tarifC;
    document.getElementById('tarifD').value = CONSTANTES.taxi.tarifD;
    document.getElementById('heureAttente').value = CONSTANTES.taxi.heureAttente;
    document.getElementById('priseChargeTAXI').value = CONSTANTES.taxi.priseChargeTAXI;

    // Remplissage automatique des Tarifs CPAM depuis l'objet CONSTANTES
    document.getElementById('tarifKmCPAM').value = CONSTANTES.cpam.tarifKmCPAM;
    document.getElementById('priseChargeCPAM').value = CONSTANTES.cpam.priseChargeCPAM;
    document.getElementById('suppAireMetro').value = CONSTANTES.cpam.suppAireMetro;
    document.getElementById('majoMoins50').value = CONSTANTES.cpam.majoMoins50;
    document.getElementById('majo50etPlus').value = CONSTANTES.cpam.majo50etPlus;

    // Remplissage automatique des taux d'Abattements pour le Transport Partagé
    document.getElementById('abatt2pass').value = CONSTANTES.cpam.abatt2pass;
    document.getElementById('abatt3pass').value = CONSTANTES.cpam.abatt3pass;
    document.getElementById('abatt4pass').value = CONSTANTES.cpam.abatt4pass;
});

/* ==========================================================================
   GESTION DES ONGLETS
   ========================================================================== */

/**
 * Gère le basculement visuel entre les différents onglets de l'application
 */
function openTab(tabId, event) {
    // Supprime la classe 'active' de tous les contenus et de tous les boutons d'onglets
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));

    // Ajoute la classe 'active' au contenu correspondant et au bouton cliqué
    document.getElementById(tabId).classList.add('active');
    if (event) event.currentTarget.classList.add('active');

    // Section commentée : Possibilité de réinitialiser les badges (Consult/Hospit) au changement d'onglet
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
 * Fonction centrale qui calcule les tarifs théoriques Taxi et CPAM (TAP)
 * @param {Object} passager - Objet contenant les infos de la course (dist, durée, nuit, zone)
 * @returns {Object|null} - Objet avec les totaux ou null si la saisie est incorrecte
 */
function calculerTarif(passager) {
    // Récupère les valeurs numériques actuelles dans l'onglet Paramètres (pour permettre les tests de tarifs)
    const tarifA = parseFloat(document.getElementById('tarifA').value);
    const tarifB = parseFloat(document.getElementById('tarifB').value);
    const tarifC = parseFloat(document.getElementById('tarifC').value);
    const tarifD = parseFloat(document.getElementById('tarifD').value);
    const tarifKmCPAM = parseFloat(document.getElementById('tarifKmCPAM').value);
    const tarifMinute = parseFloat(document.getElementById('heureAttente').value) / 60; // Conversion tarif horaire en tarif minute
    const priseChargeTAXI = parseFloat(document.getElementById('priseChargeTAXI').value);
    const priseChargeCPAM = parseFloat(document.getElementById('priseChargeCPAM').value);
    const suppAireMetro = parseFloat(document.getElementById('suppAireMetro').value);
    const majo50etPlus = parseFloat(document.getElementById('majo50etPlus').value);
    const majoMoins50 = parseFloat(document.getElementById('majoMoins50').value);

    // Extraction et sécurisation des données du passager
    const distance = Math.abs(parseFloat(passager.distance)) || 0;
    const dureeAttente = Math.abs(parseFloat(passager.dureeAttente)) || 0;
    const tarifNuit = passager.tarifNuit || false;
    const aireMetro = passager.aireMetro || false;

    // Sécurité : si pas de distance, pas de calcul
    if (distance <= 0) return null;

    let suppGdeVille = aireMetro ? suppAireMetro : 0;
    let totalTaxi = 0;
    let totalCPAM = 0;
    let textType = "";

    if (dureeAttente <= 0) {
        /* CAS 1 : HOSPITALISATION (Géré comme un Aller simple en Taxi) */
        textType = "Hospitalisation";
        // En Taxi : Prise en charge + distance x tarif (C jour / D nuit)
        totalTaxi = !tarifNuit
            ? priseChargeTAXI + distance * tarifC
            : priseChargeTAXI + distance * tarifD;

        // En CPAM : Application de la majoration réglementaire (taux différent selon < ou > 50km)
        if (distance < 50) {
            totalCPAM = priseChargeCPAM + (distance - 4) * tarifKmCPAM * majoMoins50;
        } else {
            totalCPAM = priseChargeCPAM + (distance - 4) * tarifKmCPAM * majo50etPlus;
        }
        totalCPAM += suppGdeVille;
        totalCPAM *= (tarifNuit ? 1.5 : 1); // Majoration nuit CPAM (+50%)
    } else {
        /* CAS 2 : CONSULTATION (Géré comme un Aller/Retour avec attente) */
        textType = "Consultation";
        // En Taxi : Prise en charge + (distance x 2 x tarif A/B) + coût de l'attente
        totalTaxi = !tarifNuit
            ? priseChargeTAXI + distance * 2 * tarifA + dureeAttente * tarifMinute
            : priseChargeTAXI + distance * 2 * tarifB + dureeAttente * tarifMinute;
        
        // En CPAM : Calcul d'un aller simple majoré, puis multiplié par 2 (Base forfaitaire A/R)
        totalCPAM = ((priseChargeCPAM + suppGdeVille + ((distance - 4) * tarifKmCPAM)) * (tarifNuit ? 1.5 : 1)) * 2;
    }

    return { totalTaxi, totalCPAM, textType };
}

/* ==========================================================================
   LOGIQUE DE L'ONGLET ACCUEIL (Un seul passager)
   ========================================================================== */

/**
 * Récupère les données du formulaire principal et affiche les résultats
 */
function afficherTarifUnPassager() {
    const passager = {
        distance: document.getElementById('distance').value,
        dureeAttente: document.getElementById('dureeAttente').value,
        tarifNuit: document.getElementById('tarifNuit').checked,
        aireMetro: document.getElementById('aireMetro').checked
    };

    const resultats = calculerTarif(passager);
    const resultsContainer = document.getElementById('resultsContainer');

    // Gestion de l'erreur si distance vide
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
    // Calcul du pourcentage de remise par rapport au tarif Taxi standard
    const remise = 100 - (totalCPAM / totalTaxi * 100);

    majTypeAffichage(resultats.textType);

    // Affichage des montants formatés
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
 * Génère dynamiquement les formulaires de saisie selon le nombre de passagers choisi
 */
function genererFormulairesPassagers() {
    const container = document.getElementById('passengersContainer');
    container.innerHTML = ''; 
    
    const nbPassagers = parseInt(document.getElementById('nbPassagers').value) || 1;
    if (nbPassagers > 6) return; // Limite arbitraire pour éviter les abus d'affichage
    
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
 * Calcule les tarifs pour chaque passager en appliquant les abattements du transport partagé
 */
function afficherTarifNPassagers() {
    const nbPassagers = parseInt(document.getElementById('nbPassagers').value) || 1;
    const resultsDiv = document.getElementById('resultsPartage');
    resultsDiv.innerHTML = '';

    // Récupération des taux d'abattement saisis dans les paramètres
    const abatt2pass = parseFloat(document.getElementById('abatt2pass').value);
    const abatt3pass = parseFloat(document.getElementById('abatt3pass').value);
    const abatt4pass = parseFloat(document.getElementById('abatt4pass').value);
    
    // Boucle sur chaque formulaire de passager généré
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

        // Logique d'abattement réglementaire selon le nombre TOTAL de personnes dans le véhicule
        let reduction = 0;
        if (nbPassagers === 2) reduction = abatt2pass;
        else if (nbPassagers === 3) reduction = abatt3pass;
        else if (nbPassagers >= 4) reduction = abatt4pass;
        
        // Application de la réduction sur le tarif CPAM
        totalCPAM *= (1 - reduction);

        // Création de la ligne de résultat pour le passager concerné
        const result = document.createElement('div');
        result.className = 'passenger-result';
        result.innerHTML = `
            <h4>Passager ${i}</h4>
            <div>🚖 Tarif estimé TAXI : ${totalTaxi.toFixed(2)} €</div>
            <div>🚑 Tarif estimé TAP : ${totalCPAM.toFixed(2)} €</div>
        `;
        resultsDiv.appendChild(result);
        
        // On définit le type de course (badge) selon les données du premier passager
        if(i === 1) majTypeAffichage(resultats.textType);
    }
}

/* ==========================================================================
   UTILITAIRES ET AFFICHAGE
   ========================================================================== */

/**
 * Affiche une popup avec champ de recherche pour lister les villes en zone métropolitaine (ex: Nantes)
 */
function ouvrirListe() {
    const data = LISTE_AIRE_METRO.slice(); 

    // Création du fond sombre
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    overlay.onclick = () => { overlay.remove(); popup.remove(); };
    document.body.appendChild(overlay);

    // Création de la boîte de dialogue
    const popup = document.createElement('div');
    popup.className = 'popup-liste';
    popup.innerHTML = `
        <div class="popup-close" onclick="this.parentElement.remove(); document.querySelector('.popup-overlay').remove();">✖</div>
        <div class="popup-title">Aires Métropolitaines</div>
        <input type="text" class="popup-search" placeholder="Rechercher...">
        <div class="popup-list">${data.map(item => `<div>${item}</div>`).join('')}</div>
    `;
    document.body.appendChild(popup);

    // Gestion de la recherche filtrée en temps réel
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
 * Met à jour dynamiquement le badge coloré indiquant si c'est une Consult ou une Hospit
 */
function majTypeAffichage(type) {
    const ongletActif = document.querySelector('.tab-content.active');
    if (!ongletActif) return;

    const bande = ongletActif.querySelector(".type-bande");
    if (!bande) return;

    // Reset initial
    bande.classList.remove("consultation", "hospitalisation");
    bande.textContent = "";
    bande.style.display = "none";

    // Affichage et coloration selon le mot-clé détecté
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

// Efface "79" quand on clique pour faciliter la saisie d'un autre département
deptInput.addEventListener("focus", () => {
    if(deptInput.value === "79") deptInput.value = "";
});

// Remet "79" par défaut si le champ est laissé vide en sortant
deptInput.addEventListener("blur", () => {
    if(deptInput.value.trim() === "") deptInput.value = "79";
});

// Création d'un petit message d'alerte sous le champ département
let messageDiv = document.createElement('div');
messageDiv.id = 'deptMessage';
messageDiv.style.cssText = 'color:red; font-size:12px; margin-top:4px;';
deptInput.parentNode.appendChild(messageDiv);

// Affiche un avertissement si le département n'est pas le 79 (car les tarifs diffèrent)
deptInput.addEventListener('blur', function() {
    const value = deptInput.value.trim();
    messageDiv.textContent = (value !== '79' && value !== "") ? `Dép. ${value} non pris en charge.` : '';
});

/* ==========================================================================
   CARBURANT (LOGIQUE API)
   ========================================================================== */

/**
 * Processus principal : Convertit un CP en coordonnées, puis cherche les prix des carburants
 */
async function chercherCarburant() {
    const cp = document.getElementById('cpCarbu').value;
    const loader = document.getElementById('loaderCarbu');
    const container = document.getElementById('resultsCarbu');

    // Validation du format du Code Postal
    if (!/^\d{5}$/.test(cp)) {
        alert("Veuillez entrer un code postal à 5 chiffres");
        return;
    }

    loader.style.display = "block";
    container.innerHTML = "";

    try {
        // 1. Appel à l'API Adresse pour transformer le Code Postal en Latitude/Longitude
        const gpsRes = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${cp}&postcode=${cp}&limit=1`);
        const gpsData = await gpsRes.json();
        
        if (!gpsData.features || gpsData.features.length === 0) {
            throw new Error("Localisation introuvable");
        }

        const [lon, lat] = gpsData.features[0].geometry.coordinates;
        
        // 2. Appel à l'API Prix-Carburants pour trouver les stations dans un rayon de 10km
        const url = `https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/records?where=within_distance(geom%2C%20geom'POINT(${lon}%20${lat})'%2C%2010km)&limit=50`;

        const response = await fetch(url);
        if (!response.ok) throw new Error("Erreur serveur");
        
        const data = await response.json();

        // 3. Vérification si des stations existent à proximité
        if (!data.results || !Array.isArray(data.results) || data.results.length === 0) {
            container.innerHTML = "<p style='text-align:center; padding:20px; color:#666;'>Aucune station trouvée dans un rayon de 10km.</p>";
            return;
        }

        // 4. Envoi des données vers la fonction d'affichage
        afficherResultatsStations(data.results);

    } catch (error) {
        // Affiche un message d'erreur générique en cas de problème réseau ou API
        console.error("Détail technique de l'erreur:", error);
        container.innerHTML = `
            <div style="text-align:center; padding:20px; color:#666;">
                <p>⚠️ <strong>Service momentanément indisponible</strong></p>
                <p style="font-size:0.85em;">Impossible de récupérer les prix pour le moment.<br>Réessayez ultérieurement.</p>
            </div>`;
    } finally {
        loader.style.display = "none"; // Masque le loader dans tous les cas
    }
}

/**
 * Ouvre une popup contenant une carte interactive centrée sur le code postal
 */
function ouvrirCarteCarbu() {
    const cp = document.getElementById('cpCarbu').value;
    
    if (!cp || cp.length !== 5) {
        alert("Veuillez entrer un code postal à 5 chiffres pour centrer la carte.");
        return;
    }
    
    // Style de l'overlay de fond
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.8); z-index: 1000; display: flex;
        justify-content: center; align-items: center; padding: 10px;
    `;
    
    // Boîte contenant l'iframe
    const popup = document.createElement('div');
    popup.style.cssText = `
        position: relative; width: 100%; max-width: 900px; height: 85%;
        background: white; border-radius: 12px; overflow: hidden;
        box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    `;

    // Bouton de fermeture
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = "✖ Fermer";
    closeBtn.style.cssText = `
        position: absolute; top: 10px; right: 10px; z-index: 1001;
        padding: 10px 20px; background: #e74c3c; color: white;
        border: none; border-radius: 5px; cursor: pointer; font-weight: bold;
    `;
    
    const iframe = document.createElement('iframe');
    
    // Construction de l'URL pour embarquer la carte officielle de l'économie
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

    // Fermeture de la popup au clic sur le bouton ou sur le fond
    closeBtn.onclick = () => overlay.remove();
    overlay.onclick = (e) => { if(e.target === overlay) overlay.remove(); };
}

/**
 * Lance la recherche en utilisant la position GPS réelle de l'utilisateur
 */
function geolocaliserEtChercher() {
    const loader = document.getElementById('loaderCarbu');
    const container = document.getElementById('resultsCarbu');

    if (!navigator.geolocation) {
        alert("La géolocalisation n'est pas supportée par votre navigateur.");
        return;
    }

    loader.style.display = "block";
    container.innerHTML = "Autorisez l'accès à votre position...";

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            
            document.getElementById('cpCarbu').value = ""; // Vide le CP pour clarifier l'interface
            await chercherCarburantParCoordonnees(lat, lon);
        },
        (error) => {
            loader.style.display = "none";
            container.innerHTML = "";
            alert("Erreur de géolocalisation : " + error.message);
        }
    );
}

/**
 * Recherche les prix directement par coordonnées GPS (sans passer par le CP)
 */
async function chercherCarburantParCoordonnees(lat, lon) {
    const container = document.getElementById('resultsCarbu');
    const loader = document.getElementById('loaderCarbu');

    loader.style.display = "block";
    container.innerHTML = "";

    try {
        const url = `https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/records?where=within_distance(geom%2C%20geom'POINT(${lon}%20${lat})'%2C%2010km)&limit=50`;

        const response = await fetch(url);
        const data = await response.json();
        loader.style.display = "none";

        if (!data.results || data.results.length === 0) {
            container.innerHTML = "<p style='text-align:center;'>Aucune station dans un rayon de 10km autour de vous.</p>";
            return;
        }

        afficherResultatsStations(data.results);
        
    } catch (error) {
        loader.style.display = "none";
        container.innerHTML = `<p style='color:red; text-align:center;'>Erreur : ${error.message}</p>`;
    }
}

/**
 * Logique d'affichage des stations : tri par prix du gazole et génération du HTML
 */
function afficherResultatsStations(results) {
    const container = document.getElementById('resultsCarbu');
    container.innerHTML = "";

    // TRI : On place les stations les moins chères (Gazole) en haut de liste
    const stationsTriees = results.sort((a, b) => {
        const obtenirPrixGazole = (station) => {
            const prixList = typeof station.prix === 'string' ? JSON.parse(station.prix) : (station.prix || []);
            const gazole = prixList.find(p => p['@nom'] === "Gazole");
            return gazole ? parseFloat(gazole['@valeur']) : Infinity;
        };
        return obtenirPrixGazole(a) - obtenirPrixGazole(b);
    });

    // Boucle de génération des cartes stations
    stationsTriees.forEach((station, index) => {
        const adresse = station.adresse || "Adresse non renseignée";
        const ville = (station.ville || "Ville inconnue").toUpperCase();
        // Création du lien Google Maps
        const urlMaps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(adresse + ' ' + ville)}`;

        // Badge spécial pour la station la moins chère
        const badgeMoinsCher = (index === 0) 
            ? `<div style="background: #FFD700; color: #000; font-size: 0.7em; font-weight: bold; padding: 2px 8px; border-radius: 10px; margin-bottom: 8px; display: inline-block; border: 1px solid #b8860b;">🏆 LE MOINS CHER (10km)</div>` 
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

        // Affichage du prix de chaque carburant disponible dans la station
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
}

async function incrementerCompteur() {
    const badge = document.querySelector('#compteur');
    if (!badge) return;

    // Ton identifiant unique pour le groupement Taxi Niort
    const ID_UNIQUE = "taxi-halles-niort-2026"; 

    try {
        const response = await fetch(`https://api.counterapi.dev/v1/taxi-niort/${ID_UNIQUE}/increment`);
        
        if (response.ok) {
            const data = await response.json();
            // On affiche le vrai chiffre global
            badge.textContent = data.count.toString().padStart(4, '0');
        } else {
            badge.textContent = "----";
        }
    } catch (error) {
        // En local (file://) ou sans réseau, on affiche des tirets discrets
        badge.textContent = "----";
        console.log("Compteur global indisponible (attente de mise en ligne)");
    }
}

// Appelle la fonction au chargement du DOM
window.addEventListener('DOMContentLoaded', incrementerCompteur);