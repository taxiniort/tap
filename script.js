javascript


function openTab(tabId) {
  // Désactiver tous les contenus
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
  
  // Activer le bon
  document.getElementById(tabId).classList.add('active');
  event.currentTarget.classList.add('active');
}

function calculerTarif() {
	const distance = Math.abs(parseFloat(document.getElementById('distance').value));
	const dureeAttente = Math.abs(parseInt(document.getElementById('dureeAttente').value)) || 0;
	const tarifA = parseFloat(document.getElementById('tarifA').value);
	const tarifC = parseFloat(document.getElementById('tarifC').value);
	const tarifB = parseFloat(document.getElementById('tarifB').value);
	const tarifD = parseFloat(document.getElementById('tarifD').value);
	const tarifKmCPAM = parseFloat(document.getElementById('tarifKmCPAM').value);
	const tarifMinute = parseFloat(document.getElementById('heureAttente').value) / 60;
	const priseChargeTAXI = parseFloat(document.getElementById('priseChargeTAXI').value);
	const priseChargeCPAM = parseFloat(document.getElementById('priseChargeCPAM').value);
	const tarifNuit = document.getElementById('tarifNuit').checked;
	const grandeVille = document.getElementById('grandeVille').checked;

	if (isNaN(distance) || distance <= 0) {
		document.getElementById('resultTaxi').innerText = "❗Veuillez renseigner la distance totale du trajet.";
		return;
	}

	if (isNaN(tarifKmCPAM)) {
		document.getElementById('resultTaxi').innerText = "❗Veuillez renseigner le tarif kilométrique.";
		return;
	}

	if (isNaN(priseChargeTAXI) || isNaN(priseChargeCPAM)) {
		document.getElementById('resultTaxi').innerText = "❗Veuillez renseigner le tarif de prise en charge.";
		return;
	}

	let totalTaxi = 0;
	let totalCPAM = 0;
  
	/* Calcul du montant de la course taxi et cpam */
	if (isNaN(dureeAttente) || dureeAttente <= 0) { 
		/**** HOSPITALISATION (durée d'attente vide) ****/

		// Calcul du tarif taxi		
		totalTaxi = !tarifNuit 
			? priseChargeTAXI + (distance * tarifC)  // Tarif de jour
			: priseChargeTAXI + (distance * tarifD); // Tarif de nuit

		// Calcul tarif CPAM
		if (distance < 50) {	
			totalCPAM = priseChargeCPAM + ((distance-4) * tarifKmCPAM * 1.25); // Tarif CPAM moins de 50 km
		}
		else {
			totalCPAM = priseChargeCPAM + ((distance-4) * tarifKmCPAM * 1.50); // Tarif CPAM plus de 50 km
		}
		
	}  else if (dureeAttente > 0) {
			/**** CONSULTATION (durée d'attente renseignée) ****/
			totalTaxi = !tarifNuit 
				? priseChargeTAXI + (distance * tarifA) + (dureeAttente * tarifMinute)  // Tarif de jour
				: priseChargeTAXI + (distance * tarifB) + (dureeAttente * tarifMinute); // Tarif de nuit

			totalCPAM = (priseChargeCPAM + (distance-4) * tarifKmCPAM) * 2;
		}
		else {
			document.getElementById('resultTaxi').innerText = "❗Y'a un souci avec la durée d'attente : laisser vide ou mettre un nombre supérieur à zéro.";
			return;
		}

	// Ajustement grande ville (exemple)
	if (grandeVille) totalCPAM += 15; // +15 € si grande ville

	// Supplément de nuit pour le tarif de CPAM
	if (tarifNuit) totalCPAM *= 1.50;
	let remise = 100 - ( totalCPAM / totalTaxi * 100 );

	document.getElementById('resultTaxi').innerText = `💰 Tarif estimé TAXI : ${totalTaxi.toFixed(2)} €`;
	document.getElementById('resultCPAM').innerText = `💰 Tarif estimé CPAM : ${totalCPAM.toFixed(2)} €`;

	if (remise >= 0) { document.getElementById('resultRemise').innerText = `Remise effectivé : ${remise.toFixed(1)} %`;
	} else { document.getElementById('resultRemise').innerText = `Pas de remise, le tarif CPAM est plus intéressant que le tarif Taxi`; }

}