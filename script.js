
window.addEventListener('DOMContentLoaded', () => {
  // Tarifs Taxi
  document.getElementById('tarifA').value = CONSTANTES.taxi.tarifA;
  document.getElementById('tarifB').value = CONSTANTES.taxi.tarifB;
  document.getElementById('tarifC').value = CONSTANTES.taxi.tarifC;
  document.getElementById('tarifD').value = CONSTANTES.taxi.tarifD;
  document.getElementById('heureAttente').value = CONSTANTES.taxi.heureAttente;
  document.getElementById('priseChargeTAXI').value = CONSTANTES.taxi.priseChargeTAXI;

  // Tarifs CPAM
  document.getElementById('tarifKmCPAM').value = CONSTANTES.cpam.tarifKmCPAM;
  document.getElementById('priseChargeCPAM').value = CONSTANTES.cpam.priseChargeCPAM;
  document.getElementById('suppAireMetro').value = CONSTANTES.cpam.suppAireMetro;
  document.getElementById('majoMoins50').value = CONSTANTES.cpam.majoMoins50;
  document.getElementById('majo50etPlus').value = CONSTANTES.cpam.majo50etPlus;
  
  document.getElementById('abatt2pass').value = CONSTANTES.cpam.abatt2pass;
  document.getElementById('abatt3pass').value = CONSTANTES.cpam.abatt3pass;
  document.getElementById('abatt4pass').value = CONSTANTES.cpam.abatt4pass;

});


function openTab(tabId) {
  // Désactiver tous les contenus
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
  
  // Activer le bon
  document.getElementById(tabId).classList.add('active');
  event.currentTarget.classList.add('active');
}




function genererFormulairesPassagers() {
    const container = document.getElementById('passengersContainer');
    container.innerHTML = ''; // On vide le conteneur
    
    const nbPassagers = parseInt(document.getElementById('nbPassagers').value) || 1;

    for (let i = 1; i <= nbPassagers; i++) {
        const div = document.createElement('div');
        div.className = 'passenger-block';
        div.innerHTML = `
            <h3>⚜ Passager ${i} ⚜</h3>
            <label for="distance_${i}">Distance parcourue (juste <u>l'aller</u> pour une consult.)</label>
            <input type="number" id="distance_${i}" step="0.1">

            <label for="dureeAttente_${i}">Durée pour une consult. (laisser vide pour une hospit.)</label>
            <input type="number" id="dureeAttente_${i}">

            <div class="checkbox-container">
              <input type="checkbox" id="aireMetro_${i}">
              <label for="aireMetro_${i}">Aire métropolitaine (Nantes...) ?</label>
            </div>

            <div class="checkbox-container">
              <input type="checkbox" id="tarifNuit_${i}">
              <label for="tarifNuit_${i}">Tarif nuit (si plus de 50% en nuit) ?</label>
            </div>
        `;
        container.appendChild(div);
    }
}


// ----------------------------
// Fonction pour calculer le tarif
// ----------------------------
function calculerTarif(passager) {
    // Récupération des paramètres globaux
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

    const distance = Math.abs(parseFloat(passager.distance)) || 0;
    const dureeAttente = Math.abs(parseFloat(passager.dureeAttente)) || 0;
    const tarifNuit = passager.tarifNuit || false;
    const aireMetro = passager.aireMetro || false;

    if (distance <= 0) {
        return null;
    }

    let suppGdeVille = aireMetro ? suppAireMetro : 0;
    let totalTaxi = 0;
    let totalCPAM = 0;
    let textType = "";

    if (dureeAttente <= 0) {
        // Hospitalisation
        textType = "HOSPIT.";
        totalTaxi = !tarifNuit
            ? priseChargeTAXI + distance * tarifC
            : priseChargeTAXI + distance * tarifD;

        if (distance < 50) {
            totalCPAM = priseChargeCPAM + (distance - 4) * tarifKmCPAM * majoMoins50;
        } else {
            totalCPAM = priseChargeCPAM + (distance - 4) * tarifKmCPAM * majo50etPlus;
        }
        totalCPAM += suppGdeVille;
		totalCPAM *= (tarifNuit ? 1.5 : 1);	
    } else {
        // Consultation
        textType = "CONSULT.";
        totalTaxi = !tarifNuit
            ? priseChargeTAXI + distance * 2 * tarifA + dureeAttente * tarifMinute
            : priseChargeTAXI + distance * 2 * tarifB + dureeAttente * tarifMinute;
		totalCPAM = ((priseChargeCPAM + suppGdeVille + ((distance - 4) * tarifKmCPAM)) * (tarifNuit ? 1.5 : 1)) * 2;
    }

    return { totalTaxi, totalCPAM, textType };
}

// ----------------------------
// Fonction pour afficher le tarif d'un seul passager
// ----------------------------
function afficherTarif() {
    const passager = {
        distance: document.getElementById('distance').value,
        dureeAttente: document.getElementById('dureeAttente').value,
        tarifNuit: document.getElementById('tarifNuit').checked,
        aireMetro: document.getElementById('aireMetro').checked
    };

    const resultats = calculerTarif(passager);
    if (!resultats) {
        document.getElementById('resultTaxi').innerText = "Veuillez renseigner la distance totale du trajet ❗";
        return;
    }

    let totalTaxi = resultats.totalTaxi;
    let totalCPAM = resultats.totalCPAM;
    const typeCourse = resultats.textType;


    const remise = 100 - (totalCPAM / totalTaxi * 100);

    document.getElementById("verticalLabel").innerText = typeCourse;
    document.getElementById('resultTaxi').innerText = `🚖 Tarif estimé TAXI : ${totalTaxi.toFixed(2)} €`;
    document.getElementById('resultCPAM').innerText = `🚑 Tarif estimé TAP : ${totalCPAM.toFixed(2)} €`;
    document.getElementById('resultRemise').innerText = remise >= 0
        ? `Remise effective : ${remise.toFixed(1)} %`
        : `Pas de remise, le tarif TAP est plus intéressant que le tarif Taxi`;
}


// ----------------------------
// Fonction pour calculer tous les passagers
// ----------------------------
function calculerTousPassagers() {
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

        // Application des réductions selon le nombre de passagers
        let reduction = 0;
        if (nbPassagers === 2) reduction = abatt2pass;
        else if (nbPassagers === 3) reduction = abatt3pass;
        else if (nbPassagers >= 4) reduction = abatt4pass;

       // totalTaxi *= (1 - reduction);
        totalCPAM *= (1 - reduction);

        const result = document.createElement('div');
        result.className = 'passenger-result';
        result.innerHTML = `<h4>Passager ${i}</h4>
                            <div>🚖 Tarif estimé TAXI : ${totalTaxi.toFixed(2)} €</div>
                            <div>🚑 Tarif estimé TAP : ${totalCPAM.toFixed(2)} €</div>`;
        resultsDiv.appendChild(result);
    }
}


