document.addEventListener('DOMContentLoaded', () => {
    const attackersDiv = document.getElementById('attackers');
    const defendersDiv = document.getElementById('defenders');
    const operatorDetailsDiv = document.getElementById('operatorDetails');

    const showAttackersBtn = document.getElementById('showAttackersBtn');
    const showDefendersBtn = document.getElementById('showDefendersBtn');
    const attackersSection = document.getElementById('attackersSection');
    const defendersSection = document.getElementById('defendersSection');

    let activeOperatorItem = null;
    let allOperatorsData = { attackers: [], defenders: [], gadgetDefinitions: [] };

    async function loadOperatorsData() {
        try {
            const response = await fetch('operators.json');
            if (!response.ok) {
                console.error(`Erreur HTTP: ${response.status} - Le fichier operators.json n'a pas pu être chargé.`);
                throw new Error('Le fichier operators.json est introuvable ou inaccessible.');
            }
            const data = await response.json();
            if (!data.attackers || !Array.isArray(data.attackers) ||
                !data.defenders || !Array.isArray(data.defenders) ||
                !data.gadgetDefinitions || !Array.isArray(data.gadgetDefinitions)) {
                console.error("Structure JSON inattendue : 'attackers', 'defenders' ou 'gadgetDefinitions' manquant ou n'est pas un tableau.");
                throw new Error("Format de données JSON incorrect.");
            }
            return data;
        } catch (error) {
            console.error("Erreur lors du chargement ou de l'analyse des données des opérateurs :", error);
            operatorDetailsDiv.innerHTML = `<p style="color: red; text-align: center;">Impossible de charger les données des opérateurs. Veuillez vérifier le fichier 'operators.json' et la console pour plus de détails.</p>`;
            return { attackers: [], defenders: [], gadgetDefinitions: [] };
        }
    }

    function createOperatorItem(operator, type) {
        const item = document.createElement('div');
        item.classList.add('operator-item');
        item.dataset.operatorName = operator.name;
        item.dataset.operatorType = type;

        const img = document.createElement('img');
        // --- CORRECTION OPERATEUR : Utilise .avif par défaut ou l'extension du JSON ---
        img.src = `AgentPng/${operator.name}.${operator.imageExtension || 'avif'}`; 
        img.alt = `Image de l'opérateur ${operator.name}`;
        img.classList.add('operator-image');
        img.onerror = function() {
            this.onerror = null;
            this.src = 'placeholder.avif'; // --- CORRECTION PLACEHOLDER OPERATEUR : placeholder en .avif ---
        };

        const nameSpan = document.createElement('span');
        nameSpan.textContent = operator.name;
        nameSpan.classList.add('operator-name');

        item.appendChild(img);
        item.appendChild(nameSpan);

        item.addEventListener('click', () => {
            if (activeOperatorItem) {
                activeOperatorItem.classList.remove('active');
            }
            item.classList.add('active');
            activeOperatorItem = item;

            displayOperatorDetails(operator);

            operatorDetailsDiv.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
        return item;
    }

    function formatInfoWithParentheses(infoArray, mainColor) {
        if (!infoArray || infoArray.length === 0) {
            return 'Pas d\'informations spécifiques disponibles.';
        }

        return infoArray.map(item => {
            const match = item.match(/^(.*?)\s*(\(.*?\))?$/);
            if (match) {
                const textBeforeParen = match[1].trim();
                const parenContent = match[2] || '';
                return `<span style="color: ${mainColor};">${textBeforeParen}</span><span style="color: #e0e0e0;">${parenContent}</span>`;
            }
            return `<span style="color: ${mainColor};">${item}</span>`;
        }).join(', ');
    }

    function displayOperatorDetails(operator) {
        const countersHtml = `
            <div class="counters-box">
                <p><strong>Counters :</strong> ${formatInfoWithParentheses(operator.counters, '#e74c3c')}</p>
            </div>
        `;

        const synergiesHtml = `
            <div class="synergies-box">
                <p><strong>Meilleures Synergies :</strong> ${formatInfoWithParentheses(operator.synergies, '#3498db')}</p>
            </div>
        `;

        const operatorGadgets = allOperatorsData.gadgetDefinitions.filter(gadget =>
            gadget.users && gadget.users.includes(operator.name)
        );

        let gadgetsHtml = '';
        if (operatorGadgets.length > 0) {
            gadgetsHtml = `
                <h3 class="gadget-section-title">Gadgets</h3>
                <div class="gadgets-container">
            `;
            operatorGadgets.forEach(gadget => {
                // --- CORRECTION GADGETS : Utilise .png pour les images de gadgets ---
                const gadgetImagePath = `GadgetPng/${gadget.name}.png`; 
                gadgetsHtml += `
                    <div class="gadget-item">
                        <img src="${gadgetImagePath}" alt="${gadget.name}" class="gadget-image" onerror="this.onerror=null;this.src='placeholder_gadget.png';">
                        <p class="gadget-name"><strong>${gadget.name}</strong></p>
                        <p class="gadget-description">${gadget.description}</p>
                    </div>
                `;
            });
            gadgetsHtml += `</div>`;
        } else {
            gadgetsHtml = `<p class="gadget-section-title">Aucun gadget spécifique listé pour cet opérateur.</p>`;
        }

        operatorDetailsDiv.innerHTML = `
            <h3>${operator.name}</h3>
            <p><strong>Nationalité :</strong> ${operator.nationality}</p>
            <p><strong>Organisation :</strong> ${operator.organization}</p>
            <p class="ability-name">Compétence Unique : ${operator.abilityName}</p>
            <p>${operator.abilityDetails}</p>
            ${countersHtml}
            ${synergiesHtml}
            ${gadgetsHtml}
        `;
    }

    function showOperatorList(type) {
        document.querySelectorAll('.type-button').forEach(button => button.classList.remove('active'));
        document.querySelectorAll('.operator-list').forEach(section => section.classList.add('hidden'));

        operatorDetailsDiv.innerHTML = `<p>Sélectionnez une catégorie (Attaquants/Défenseurs) puis un opérateur pour voir ses détails.</p>`;
        if (activeOperatorItem) {
            activeOperatorItem.classList.remove('active');
            activeOperatorItem = null;
        }

        if (type === 'attackers') {
            showAttackersBtn.classList.add('active');
            attackersSection.classList.remove('hidden');
        } else if (type === 'defenders') {
            showDefendersBtn.classList.add('active');
            defendersSection.classList.remove('hidden');
        }
    }

    async function initializeApp() {
        allOperatorsData = await loadOperatorsData();

        attackersDiv.innerHTML = '';
        allOperatorsData.attackers.forEach(op => {
            attackersDiv.appendChild(createOperatorItem(op, 'attackers'));
        });

        defendersDiv.innerHTML = '';
        allOperatorsData.defenders.forEach(op => {
            defendersDiv.appendChild(createOperatorItem(op, 'defenders'));
        });

        showAttackersBtn.addEventListener('click', () => showOperatorList('attackers'));
        showDefendersBtn.addEventListener('click', () => showOperatorList('defenders'));

        if (allOperatorsData.attackers.length > 0 || allOperatorsData.defenders.length > 0) {
            showOperatorList('attackers');
        } else {
            operatorDetailsDiv.innerHTML = `<p style="text-align: center; color: red;">Aucun opérateur à afficher. Vérifiez votre fichier 'operators.json'.</p>`;
        }
    }

    initializeApp();
});