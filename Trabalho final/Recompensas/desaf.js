// Dados iniciais
let users = [];
let challenges = [];
let history = {
    completed: [],  // Histórico de desafios concluídos começa vazio
    failed: []      // Histórico de desafios falhados começa vazio
};

// Inicializa a aplicação ao carregar a página
window.onload = function () {
    // Carregar usuários salvos ou inicializar dados padrão
    loadUsers();

    // Carregar desafios e histórico salvos
    loadChallenges();
    loadHistory(); // Carrega o histórico, que começará vazio se não houver dados salvos.

    updateLeaderboard();
    renderChallenges();
    renderHistory();
};

// Função para exibir notificações (Sucesso ou Erro)
function showNotification(icon, title, text) {
    Swal.fire({ icon, title, text });
}

// Função para voltar ao histórico de navegação ou redirecionar
function goBack() {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = "index.html"; // Substitua pelo caminho desejado
    }
}

// Salva os desafios no localStorage
function saveChallenges() {
    localStorage.setItem('challenges', JSON.stringify(challenges));
}

// Salva o histórico no localStorage
function saveHistory() {
    localStorage.setItem('history', JSON.stringify(history));
}

// Salva os usuários no localStorage
function saveUsers() {
    localStorage.setItem('users', JSON.stringify(users));
}

// Carrega os desafios do localStorage
function loadChallenges() {
    const storedChallenges = localStorage.getItem('challenges');
    if (storedChallenges) {
        challenges = JSON.parse(storedChallenges);
    }
}

// Carrega o histórico do localStorage
function loadHistory() {
    const storedHistory = localStorage.getItem('history');
    if (storedHistory) {
        history = JSON.parse(storedHistory);
    }
    // Caso o histórico esteja vazio, inicialize com arrays vazios
    if (!history.completed) {
        history.completed = [];
    }
    if (!history.failed) {
        history.failed = [];
    }
}

// Carrega os usuários do localStorage
function loadUsers() {
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
        users = JSON.parse(storedUsers);
    } else {
        // Inicializa usuários padrão se não existir dados no localStorage
        users = [
            { name: 'João', points: 0, maxPoints: 0 },
            { name: 'Maria', points: 0, maxPoints: 0 },
            { name: 'Carlos', points: 0, maxPoints: 0 }
        ];
        saveUsers(); // Salva os dados iniciais dos usuários
    }
}

// Renderiza os desafios
function renderChallenges() {
    const challengesList = document.getElementById('challengesList');
    challengesList.innerHTML = ''; // Limpar lista antes de renderizar

    challenges.forEach((challenge, index) => {
        const challengeDiv = document.createElement('div');
        challengeDiv.classList.add('challenge-item');

        let challengeHtml = `
            <strong>Desafio ${index + 1}:</strong> ${challenge.name} (${challenge.days} dias)
            <span class="challenge-type">${challenge.type}</span>
        `;

        if (challenge.completedDays === challenge.days) {
            challengeHtml += '<span class="completed">Concluído!</span>';
        } else if (!challenge.failed) {
            challengeHtml += `<button onclick="startChallenge(${index})" class="btn">Começar</button>`;
        }

        if (challenge.failed) {
            challengeHtml += '<span class="failed">Falhou - Não é mais possível completar</span>';
        } else if (challenge.completedDays < challenge.days) {
            challengeHtml += `<button onclick="failedChallenge(${index})" class="btn">Não Concluiu no Prazo</button>`;
        }

        challengeDiv.innerHTML = challengeHtml;
        challengesList.appendChild(challengeDiv);
    });
}

// Renderiza o histórico de desafios
function renderHistory() {
    const completedList = document.getElementById('completedChallenges');
    const failedList = document.getElementById('failedChallenges');

    completedList.innerHTML = '';
    failedList.innerHTML = '';

    history.completed.forEach(challenge => {
        const li = document.createElement('li');
        li.textContent = `${challenge.name} (${challenge.days} dias)`;
        completedList.appendChild(li);
    });

    history.failed.forEach(challenge => {
        const li = document.createElement('li');
        li.textContent = `${challenge.name} (${challenge.days} dias)`;
        failedList.appendChild(li);
    });
}

// Função para adicionar desafios
function addChallenge(name, days, type) {
    challenges.push({ name, days, type, completedDays: 0, completed: false, failed: false });
    saveChallenges();
    renderChallenges();
}

// Função para atualizar o usuário
function updateUser(index, key, value) {
    users[index][key] = value;
    saveUsers();
    updateLeaderboard();
}

// Função para atualizar o desafio
function updateChallenge(index, key, value) {
    challenges[index][key] = value;
    saveChallenges();
    renderChallenges();
}

// Função para adicionar no histórico
function addToHistory(type, challenge) {
    history[type].push(challenge);
    saveHistory();
    renderHistory();
}

// Cria um novo desafio
document.getElementById('challengeForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const name = document.getElementById('challengeName').value;
    const days = parseInt(document.getElementById('challengeDays').value);
    const type = document.getElementById('challengeType').value;

    if (name && days > 0 && type) {
        addChallenge(name, days, type);
        showNotification('success', 'Desafio Criado!', `Agora você pode começar o desafio: ${name}`);
    } else {
        showNotification('error', 'Erro', 'Preencha todos os campos corretamente!');
    }
});

// Começa ou avança um desafio
function startChallenge(index) {
    const challenge = challenges[index];
    updateChallenge(index, 'completedDays', challenge.completedDays + 1);

    if (challenge.completedDays === challenge.days) {
        addToHistory('completed', challenge);
        challenges.splice(index, 1);
        saveChallenges();
        showNotification('success', 'Parabéns!', `Você completou o desafio: ${challenge.name}`);
        addReward('Medalha de Ouro', 10 * challenge.days);
    } else {
        showNotification('info', 'Continue!', `Você completou ${challenge.completedDays} de ${challenge.days} dias.`);
    }

    renderChallenges();
    renderHistory();
}

// Marca um desafio como falhado
function failedChallenge(index) {
    const challenge = challenges[index];
    updateChallenge(index, 'failed', true);

    addToHistory('failed', challenge);
    challenges.splice(index, 1);
    saveChallenges();

    showNotification('error', 'Falhou!', `Você não concluiu o desafio: ${challenge.name}`);
    renderChallenges();
    renderHistory();
}

// Adiciona uma recompensa ao usuário
function addReward(name, points) {
    const rewardsList = document.getElementById('rewardsList');
    const rewardDiv = document.createElement('div');
    rewardDiv.innerHTML = `${name} - +${points} pontos`;
    rewardsList.appendChild(rewardDiv);

    // Atualiza os pontos do usuário
    updateUser(0, 'points', users[0].points + points);

    // Se os pontos do usuário ultrapassarem a maior pontuação já registrada, atualiza a maior pontuação
    if (users[0].points > users[0].maxPoints) {
        updateUser(0, 'maxPoints', users[0].points);
    }
}

// Atualiza o quadro de líderes
function updateLeaderboard() {
    const currentUser = users[0];
    const leaderboard = document.getElementById('leaderboard').getElementsByTagName('tbody')[0];
    leaderboard.innerHTML = '';

    const completedChallenges = history.completed.length;
    const failedChallenges = history.failed.length;
    const totalChallenges = completedChallenges + failedChallenges;
    const averagePoints = totalChallenges > 0 ? (currentUser.points / totalChallenges).toFixed(2) : 0;

    const row = leaderboard.insertRow();
    row.innerHTML = `
        <td>Pontos: ${currentUser.points}</td>
        <td>Máximo: ${currentUser.maxPoints}</td>
        <td>Desafios Concluídos: ${completedChallenges}</td>
        <td>Desafios Falhados: ${failedChallenges}</td>
        <td>Média de Pontos/Desafio: ${averagePoints}</td>
    `;
}
