const CONSTANTES = {
  taxi: {
    tarifA: 1.11,
    tarifB: 1.60,
    tarifC: 2.22,
    tarifD: 3.20,
    heureAttente: 30.04,
    priseChargeTAXI: 2.70
  },
  cpam: {
    tarifKmCPAM: 1.08,
    priseChargeCPAM: 13,
    suppAireMetro: 15,
	majoMoins50 : 1.25,
	majo50etPlus : 1.50,
	abatt2pass : 0.23,
	abatt3pass : 0.35,
	abatt4pass : 0.37
  }
};

const LISTE_AIRE_METRO = [
    /* --- GRANDES AGGLOMÉRATIONS --- */
    "PARIS (75)",
    "Dép. des Hauts-de-Seine (92)",
    "Dép. de la Seine-Saint-Denis (93)",
    "Dép. du Val-de-Marne (94)",
    "MARSEILLE",
    "LYON",
    "NANTES",
    "BORDEAUX",
    "LILLE",
    "TOULOUSE",
    "NICE",
    "STRASBOURG",
    "MONTPELLIER",
    "RENNES",
    "GRENOBLE",

    /* --- ÉTABLISSEMENTS NANTES (44) --- */
    "44 - CHU NANTES Site LAENNEC (Saint-Herblain)",
    "44 - Clinique Santé Atlantique (Saint-Herblain)",
    "44 - Hôpital Privé du Confluent (Rezé)",
    "44 - Centre d’hémodialyse – Confluent (Rezé)",
    "44 - CHU NANTES ICO Site Gauducheau (St Herblain)",
    "44 - Echo - Dialyse (St Herblain)",
    "44 - CRF Tourmaline (St Herblain)",
    "44 - GHT Maubreuil (St Herblain)",

    /* --- ÉTABLISSEMENTS BORDEAUX (33) --- */
    "33 - NOUVELLE CLINIQUE BORDEAUX TONDU (Floirac)",
    "33 - POLYCLINIQUE JEAN VILLAR (Bruges)",
    "33 - CLINIQUE MUTUALISTE DE PESSAC",
    "33 - POLYCLINIQUE BORDEAUX RIVE DROITE (Lormont)",
    "33 - CRF LA TOUR DE GASSIES (Bruges)",
    "33 - HOPITAL SUBURBAIN DU BOUSCAT",
    "33 - ANTENNE AUTODIALYSE AURAD (Le Haillan)",

    /* --- ÉTABLISSEMENTS RENNES (35) --- */
    "35 - Clinique privée Sévigné (Cesson Sévigné)",
    "35 - Centre hospitalier Privé (St Grégoire)",
    "35 - Établissement UGECAM du pôle gériatrique rennais",
    "35 - Centre de dialyse AUB Santé (Montgermont)",

    /* --- ÉTABLISSEMENTS MONTPELLIER (34) --- */
    "34 - Clinique St Jean Sud de France (St Jean de Vedas)",
    "34 - Clinique du Parc (Castelnau le Lez)",

    /* --- ÉTABLISSEMENTS TOULOUSE (31) --- */
    "31 - Clinique Croix du sud et SSR attaché (Quint Fonsegrives)",
    "31 - Clinique de l’Union (St Jean)",
    "31 - SSR attaché à la clinique de l'Union (St Jean)",

    /* --- ÉTABLISSEMENTS GRENOBLE (38) --- */
    "38 - CHU La Tronche",
    "38 - CHU Echirolles",
    "38 - AGDUC La Tronche",

    /* --- ÉTABLISSEMENTS LYON (69) --- */
    "69 - INFIRMERIE PROTESTANTE (Caluire et Cuire)",
    "69 - HOPITAL DES CHARPENNES - HCL (Villeurbanne)",
    "69 - HOPITAL LOUIS PRADEL - HCL (Bron)",
    "69 - HOPITAL PIERRE WERTHEIMER - HCL (Bron)",
    "69 - MEDIPOLE HOPITAL PRIVE (Villeurbanne)",
    "69 - MEDIPOLE HOPITAL MUTUALISTE (Villeurbanne)",
    "69 - HOPITAL FEMME MERE ENFANT - HCL (Bron)",
    "69 - LE VINATIER PSY UNIV LYON METROPOLE (Bron)",
    "69 - CLINIQUE DU VAL D'OUEST VENDOME (Ecully)",
    "69 - CLINIQUE MEDICO-CHIRURGICALE CHARCOT (Ste Foy les Lyon)",

    /* --- ÉTABLISSEMENTS LILLE (59) --- */
    "59 - SANTELYS SITE CHU LILLE (Loos)",
    "59 - SSR PEDIATRIQUE MARC SAUTELET (Villeneuve d'Ascq)",
    "59 - UNITE DE DIALYSE DE LOOS",
    "59 - UNITE DE DIALYSE DE FACHES-THUMESNIL",
    "59 - SANTELYS UNITE DE DIALYSE LAMBERSART",
    "59 - UNITE DE DIALYSE DE MONS EN BAROEUL",

    /* --- ÉTABLISSEMENTS STRASBOURG (67) --- */
    "67 - Centre Médico-Chirurgical Obstétrique (Schiltigheim)",
    "67 - UGECAM Alsace (Illkirch)",
    "67 - Clinique du Ried (Schiltigheim)"
];