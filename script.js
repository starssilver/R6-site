document.addEventListener('DOMContentLoaded', () => {
    const attackersDiv = document.getElementById('attackers');
    const defendersDiv = document.getElementById('defenders');
    const operatorDetailsDiv = document.getElementById('operatorDetails'); // La cible du défilement

    const showAttackersBtn = document.getElementById('showAttackersBtn');
    const showDefendersBtn = document.getElementById('showDefendersBtn');
    const attackersSection = document.getElementById('attackersSection');
    const defendersSection = document.getElementById('defendersSection');

    let activeOperatorItem = null; // Pour garder une trace de l'opérateur sélectionné
    let allOperators = { attackers: [], defenders: [] }; // Stocke toutes les données chargées

    // Fonction pour charger les données des opérateurs depuis le fichier JSON
    async function loadOperatorsData() {
        try {
            const response = await fetch('operators.json'); // Chemin vers ton fichier JSON
            if (!response.ok) {
                console.error(`Erreur HTTP: ${response.status} - Le fichier operators.json n'a pas pu être chargé.`);
                throw new Error('Le fichier operators.json est introuvable ou inaccessible.');
            }
            const data = await response.json();
            if (!data.attackers || !Array.isArray(data.attackers) || !data.defenders || !Array.isArray(data.defenders)) {
                console.error("Structure JSON inattendue : 'attackers' ou 'defenders' manquant ou n'est pas un tableau.");
                throw new Error("Format de données JSON incorrect.");
            }
            return data;
        } catch (error) {
            console.error("Erreur lors du chargement ou de l'analyse des données des opérateurs :", error);
            operatorDetailsDiv.innerHTML = `<p style="color: red; text-align: center;">Impossible de charger les données des opérateurs. Veuillez vérifier le fichier 'operators.json' et la console pour plus de détails.</p>`;
            return { attackers: [], defenders: [] };
        }
    }

    // Fonction pour créer un élément d'opérateur dans la liste
    function createOperatorItem(operator, type) {
        const item = document.createElement('div');
        item.classList.add('operator-item');
        item.dataset.operatorName = operator.name;
        item.dataset.operatorType = type;

        // NOUVEAU : Création de l'élément image
        const img = document.createElement('img');
        img.src = `AgentPng/${operator.name}.avif`;
        img.alt = `Image de l'opérateur ${operator.name}`;
        img.classList.add('operator-image'); // Ajout d'une classe pour le style

        // NOUVEAU : Création de l'élément pour le nom
        const nameSpan = document.createElement('span');
        nameSpan.textContent = operator.name;
        nameSpan.classList.add('operator-name'); // Ajout d'une classe pour le style

        // Ajout de l'image et du nom à l'élément d'opérateur
        item.appendChild(img);
        item.appendChild(nameSpan);


        item.addEventListener('click', () => {
            // Supprime la classe 'active' de l'ancien élément sélectionné
            if (activeOperatorItem) {
                activeOperatorItem.classList.remove('active');
            }

            // Ajoute la classe 'active' au nouvel élément sélectionné
            item.classList.add('active');
            activeOperatorItem = item;

            displayOperatorDetails(operator);

            // Fait défiler la page vers la section des détails de l'opérateur
            operatorDetailsDiv.scrollIntoView({
                behavior: 'smooth', // Animation de défilement douce
                block: 'start'      // Aligne le haut de l'élément avec le haut de la fenêtre
            });
        });
        return item;
    }

    // Fonction pour formater le texte des counters/synergies et gérer les parenthèses
    function formatInfoWithParentheses(infoArray, mainColor) {
        if (!infoArray || infoArray.length === 0) {
            return 'Pas d\'informations spécifiques disponibles.';
        }

        return infoArray.map(item => {
            const match = item.match(/^(.*?)\s*(\(.*?\))?$/);
            if (match) {
                const textBeforeParen = match[1].trim();
                const parenContent = match[2] || '';
                return `<span style="color: ${mainColor};">${textBeforeParen}</span><span style="color: #f8f9fa;">${parenContent}</span>`;
            }
            return `<span style="color: ${mainColor};">${item}</span>`;
        }).join(', ');
    }

    // Fonction pour afficher les détails d'un opérateur
    function displayOperatorDetails(operator) {
        const countersHtml = `
            <div class="counters-box">
                <p><strong>Counters :</strong> ${formatInfoWithParentheses(operator.counters, '#dc3545')}</p>
            </div>
        `;

        const synergiesHtml = `
            <div class="synergies-box">
                <p><strong>Meilleures Synergies :</strong> ${formatInfoWithParentheses(operator.synergies, '#007bff')}</p>
            </div>
        `;

        operatorDetailsDiv.innerHTML = `
            <h3>${operator.name}</h3>
            <p><strong>Nationalité :</strong> ${operator.nationality}</p>
            <p><strong>Organisation :</strong> ${operator.organization}</p>
            <p class="ability-name">Compétence Unique : ${operator.abilityName}</p>
            <p>${operator.abilityDetails}</p>
            ${countersHtml}
            ${synergiesHtml}
        `;
    }

    // Fonction pour afficher la liste des opérateurs d'un type donné
    function showOperatorList(type) {
        // Gère l'activation/désactivation des boutons
        showAttackersBtn.classList.remove('active');
        showDefendersBtn.classList.remove('active');

        // Cache toutes les sections d'opérateurs
        attackersSection.classList.add('hidden');
        defendersSection.classList.add('hidden');

        // Réinitialise les détails de l'opérateur et la sélection active
        operatorDetailsDiv.innerHTML = `<p>Sélectionnez un opérateur pour voir ses détails.</p>`;
        if (activeOperatorItem) {
            activeOperatorItem.classList.remove('active');
            activeOperatorItem = null;
        }

        // Affiche la section et active le bouton correspondant
        if (type === 'attackers') {
            showAttackersBtn.classList.add('active');
            attackersSection.classList.remove('hidden');
        } else if (type === 'defenders') {
            showDefendersBtn.classList.add('active');
            defendersSection.classList.remove('hidden');
        }
    }

    // Fonction principale pour initialiser l'application
    async function initializeApp() {
        allOperators = await loadOperatorsData(); // Charge et stocke les données

        // Remplir les listes d'opérateurs
        attackersDiv.innerHTML = ''; // Nettoyer avant d'ajouter
        allOperators.attackers.forEach(op => {
            attackersDiv.appendChild(createOperatorItem(op, 'attackers'));
        });

        defendersDiv.innerHTML = ''; // Nettoyer avant d'ajouter
        allOperators.defenders.forEach(op => {
            defendersDiv.appendChild(createOperatorItem(op, 'defenders'));
        });

        // Attache les écouteurs d'événements aux boutons de type
        showAttackersBtn.addEventListener('click', () => showOperatorList('attackers'));
        showDefendersBtn.addEventListener('click', () => showOperatorList('defenders'));

        // Initialisation : Afficher la section "Attaquants" par défaut au chargement
        // ou un message si aucune donnée n'est là
        if (allOperators.attackers.length > 0 || allOperators.defenders.length > 0) {
            showOperatorList('attackers'); // Affiche la liste des attaquants par défaut
        } else {
            operatorDetailsDiv.innerHTML = `<p style="text-align: center; color: red;">Aucun opérateur à afficher. Vérifiez votre fichier 'operators.json'.</p>`;
        }
    }

    initializeApp(); // Lance l'initialisation de l'application
});