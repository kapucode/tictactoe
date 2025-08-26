// Seleção 
const boxes = document.querySelectorAll(".box")
const playAgainBtn = document.querySelector("#play-again")
const announcementTitle = document.querySelector("#announcement-title")
const announcementDiv = document.querySelector(".announcement")
const selectModeBtn = document.querySelectorAll(".select")
const enSelect = document.querySelector("#en")
const ptSelect = document.querySelector("#pt")
const languageSelect = document.querySelector("#language")
const gameTitle = document.querySelector(".title h1")

// Variáveis
let jogadorAtual = 'x'
let disponivel = true
let pc
let tabuleiro = [
  ["", "", ""],
  ["", "", ""],
  ["", "", ""]
]

// Setar 'pc' com base no localStorage
let pcLS = localStorage.getItem('pc')
if (!pcLS) {
  localStorage.setItem('pc', 'true')
  pcLS = 'true'
}

// Sistema de linguagem
let languageValue = localStorage.getItem('language') || languageSelect.value
if (languageValue === 'en') {
  enSelect.selected = true
  ptSelect.selected = false
  enSelect.textContent = 'English'
  ptSelect.textContent = 'Portuguese'
  localStorage.setItem('language', 'en')
} else {
  enSelect.selected = false
  ptSelect.selected = true
  enSelect.textContent = 'Inglês'
  ptSelect.textContent = 'Português'
  localStorage.setItem('language', 'pt')
}
const isTranslated = languageSelect.value === 'en'
gameTitle.textContent = language('Jogo da Velha', 'Tic Tac Toe', isTranslated)

// transforma pcLS (string) em booleano e seta pc
pc = (pcLS === 'true')

selectModeBtn.forEach((btn) => {
  if (btn.id === 'bot') {
    if (pcLS === 'true') {
      btn.classList.add('selected')
    } else {
      btn.classList.remove('selected')
    }
  } else {
    if (pcLS === 'true') {
      btn.classList.remove('selected')
    } else {
      btn.classList.add('selected')
    }
  }
})

// Funções 
function jogar(id, jogador, event) {
  if (!disponivel) return false
  
  id = Number(id); // garante que é número
  if (id < 1 || id > 9) return false; // id inválido

  const linha = Math.floor((id - 1) / 3);
  const coluna = (id - 1) % 3;
  
  if (tabuleiro[linha][coluna] === "") {
    tabuleiro[linha][coluna] = jogador.toLowerCase();
    event.target.classList.add(jogador === 'x' ? 'markedX' : 'markedO')
    return true; // jogada válida
  } else {
    return false; // posição ocupada
  }
}

function alternatePlayer() {
  if (jogadorAtual === 'x') {
    jogadorAtual = 'o'
  } else {
    jogadorAtual = "x"
  }
}

function checkGame(jogador) {
  // 0 - Nada
  // x/o - Jogador ganhou
  // 2 - Empate
  
  // Verificando se o jogador ganhou
  for (let i = 0; i < tabuleiro.length; i++) {
    if (tabuleiro[i][0] === jogador && tabuleiro[i][1] === jogador && tabuleiro[i][2] === jogador) {
      return jogador
    }
  }
  
  for  (let i = 0; i < 3; i++) {
    if (tabuleiro[0][i] === jogador && tabuleiro[1][i] === jogador && tabuleiro[2][i] === jogador) {
      return jogador
    }
  }
  
  if (tabuleiro[0][0] === jogador && tabuleiro[1][1] === jogador && tabuleiro[2][2] === jogador) {
    return jogador
  }
  
  if (tabuleiro[0][2] === jogador && tabuleiro[1][1] === jogador && tabuleiro[2][0] === jogador) {
    return jogador
  }
  
  // Verificando se NÃO deu empate
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (tabuleiro[i][j] === "") {
        return 0; // ainda tem espaço
      }
    }
  }
  
  // Deu empate
  return 2
}

function showPlays() {
  addCursor()
  let count = 1
  tabuleiro.forEach((linha) => {
    linha.forEach((jogada) => {
      const box = document.getElementById(count) // pega direto pelo id
      box.classList.remove('markedX', 'markedO') // limpa antes

      if (jogada === 'x') {
        box.classList.add('markedX')
      } else if (jogada === 'o') {
        box.classList.add('markedO')
      }

      count++
    })
  })
}

function clearTabuleiro() {
  tabuleiro = [
    ["", "", ""],
    ["", "", ""],
    ["", "", ""]
  ]
  showPlays()
}

function announce(txt) {
  announcementTitle.textContent = txt
  announcementDiv.classList.remove('hide')
  removeCursor()
  disponivel = false
}

function botPlay() {
  if (!disponivel) return;

  // ===== 1. Tentar vencer =====
  let escolha = acharMelhorJogada(jogadorAtual);
  if (!escolha) {
    // ===== 2. Tentar bloquear o inimigo =====
    const inimigo = jogadorAtual === "x" ? "o" : "x";
    escolha = acharMelhorJogada(inimigo);
  }
  if (!escolha) {
    // ===== 3. Jogada aleatória =====
    let casasLivres = [];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (tabuleiro[i][j] === "") {
          casasLivres.push({ linha: i, coluna: j, id: i * 3 + j + 1 });
        }
      }
    }
    if (casasLivres.length === 0) return;
    escolha = casasLivres[Math.floor(Math.random() * casasLivres.length)];
  }

  // ===== Aplicar jogada =====
  tabuleiro[escolha.linha][escolha.coluna] = jogadorAtual;
  const casa = document.getElementById(escolha.id);
  casa.classList.add(jogadorAtual === "x" ? "markedX" : "markedO");

  // ===== Checar vitória ou empate =====
  const gameSituation = checkGame(jogadorAtual);
  if (gameSituation === jogadorAtual) {
    if (pc) {
      if (gameSituation === 'o') {
        languageAnnounce('Você perdeu!', 'You lost!')
        fadeNonWinning(jogadorAtual)
        addColor(3);
      } else {
        languageAnnounce('Você venceu!', 'You win!')
        fadeNonWinning(jogadorAtual)
        addColor(1);
      }
    } else {
      languageAnnounce(`Jogador ${jogadorAtual.toUpperCase()} ganhou!`, `Player ${jogadorAtual.toUpperCase()} wins!`)
      fadeNonWinning(jogadorAtual)
      addColor(1);
    }
    return;
  } else if (gameSituation === 2) {
    languageAnnounce('Empate!', 'Draw!')
    addColor(2);
    return;
  }

  alternatePlayer();
}

// Função auxiliar: verifica se existe jogada de vitória/bloqueio
function acharMelhorJogada(simbolo) {
  // linhas
  for (let i = 0; i < 3; i++) {
    let linha = tabuleiro[i];
    if (linha.filter(c => c === simbolo).length === 2 && linha.includes("")) {
      return { linha: i, coluna: linha.indexOf(""), id: i * 3 + linha.indexOf("") + 1 };
    }
  }

  // colunas
  for (let j = 0; j < 3; j++) {
    let coluna = [tabuleiro[0][j], tabuleiro[1][j], tabuleiro[2][j]];
    if (coluna.filter(c => c === simbolo).length === 2 && coluna.includes("")) {
      return { linha: coluna.indexOf(""), coluna: j, id: coluna.indexOf("") * 3 + j + 1 };
    }
  }

  // diagonal principal
  let diagonal1 = [tabuleiro[0][0], tabuleiro[1][1], tabuleiro[2][2]];
  if (diagonal1.filter(c => c === simbolo).length === 2 && diagonal1.includes("")) {
    let idx = diagonal1.indexOf("");
    return { linha: idx, coluna: idx, id: idx * 3 + idx + 1 };
  }

  // diagonal secundária
  let diagonal2 = [tabuleiro[0][2], tabuleiro[1][1], tabuleiro[2][0]];
  if (diagonal2.filter(c => c === simbolo).length === 2 && diagonal2.includes("")) {
    let idx = diagonal2.indexOf("");
    let linha = idx;
    let coluna = 2 - idx;
    return { linha, coluna, id: linha * 3 + coluna + 1 };
  }

  return null; // não achou nada
}

function addColor(type=1) {
  // 1 - Ganhou
  // 2 - Empate
  // 3 - Perdeu
  
  switch (type) {
    case 1:
      announcementTitle.classList.remove('empate')
      announcementTitle.classList.remove('perdeu')
      announcementTitle.classList.add('ganhou')
      break;
    case 2:
      announcementTitle.classList.remove('perdeu')
      announcementTitle.classList.remove('ganhou')  
      announcementTitle.classList.add('empate')
      break;
    case 3:
      announcementTitle.classList.remove('ganhou')  
      announcementTitle.classList.remove('empate')
      announcementTitle.classList.add('perdeu')
      break;
    default:
      announcementTitle.classList.remove('perdeu')
      announcementTitle.classList.remove('ganhou')  
      announcementTitle.classList.add('empate')
      break;
  }
}

const combinacoesVitoria = [
  [1,2,3], // linha 1
  [4,5,6], // linha 2
  [7,8,9], // linha 3
  [1,4,7], // coluna 1
  [2,5,8], // coluna 2
  [3,6,9], // coluna 3
  [1,5,9], // diagonal principal
  [3,5,7]  // diagonal secundária
];

function fadeNonWinning(jogador) {
  // primeiro descobre qual combinação ele venceu
  let count = 1;
  let vencedora = null;

  for (let combo of combinacoesVitoria) {
    if (combo.every(id => {
      const box = document.getElementById(id);
      return box.classList.contains(jogador === 'x' ? 'markedX' : 'markedO');
    })) {
      vencedora = combo;
      break;
    }
  }

  // agora deixa cinza tudo que não tá na linha vencedora
  boxes.forEach((box) => {
    if (vencedora && vencedora.includes(Number(box.id))) {
      box.classList.remove('faded')
    } else {
      box.classList.add('faded')
    }
  });
}

function resetFaded() {
  boxes.forEach((box) => {
    box.classList.remove('faded')
  })
}

function removeCursor() {
  boxes.forEach((box) => {
    box.classList.add('without-cursor')
  });
}

function addCursor() {
  boxes.forEach((box) => {
    box.classList.remove('without-cursor')
  });
}

function languageAnnounce(pt, en) {
  if (languageSelect.value === 'pt') {
    announce(pt)
  } else {
    announce(en)
  }
}

function language(pt, en, translated) {
  return translated ? en : pt
}

// Eventos
boxes.forEach((box) => {
  box.addEventListener("click", (e) => {
    if (!pc) {
      const casa = e.target
      const id = casa.id
      const valid = jogar(id, jogadorAtual, e)
      if (!valid) return
      showPlays()
      
      const gameSituation = checkGame(jogadorAtual)
      if (gameSituation === jogadorAtual) { // Ganhou
        languageAnnounce(`Jogador ${jogadorAtual.toUpperCase()} ganhou!`, `Player ${jogadorAtual.toUpperCase()} wins!`)
      } else if (gameSituation === 2) { // Empate
        languageAnnounce('Empate!', 'Draw!')
      }
      
      alternatePlayer()
    } else {
      const valid = jogar(e.target.id, jogadorAtual, e);
      if (!valid) return;
      showPlays();
    
      let gameSituation = checkGame(jogadorAtual);
      if (gameSituation === jogadorAtual) {if (gameSituation === jogadorAtual) {
          if (pc) {
            if (gameSituation === 'o') {
              languageAnnounce('Você perdeu!', 'You lost!')
              fadeNonWinning(jogadorAtual)
              addColor(3);
            } else {
              languageAnnounce('Você ganhou!', 'You win!')
              fadeNonWinning(jogadorAtual)
              addColor(1);
            }
          } else {
            languageAnnounce(`Jogador ${jogadorAtual.toUpperCase()} ganhou!`, `Player ${jogadorAtual.toUpperCase()} wins!`)
            fadeNonWinning(jogadorAtual)
            addColor(1)
          }
          return;
          }
        
        return;
      } else if (gameSituation === 2) {
        languageAnnounce('Empate!', 'Draw!')
        addColor(2)
        return;
      }
    
      alternatePlayer();
    
      // Jogada do bot (um pequeno delay fica mais legal)
      setTimeout(() => {
        botPlay();
        showPlays();
      }, 500);
    }
  })
});

playAgainBtn.addEventListener('click', () => {
  announcementDiv.classList.add('hide')
  clearTabuleiro()
  disponivel = true
  jogadorAtual = 'x'
  resetFaded()
})

selectModeBtn.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    selectModeBtn.forEach((btnForToggle) => {
      btnForToggle.classList.toggle('selected')
    })
    clearTabuleiro()
    
    if (selectModeBtn[0].classList.contains('selected')) {
      pc = true
    } else {
      pc = false
    }
    jogadorAtual = 'x'
    localStorage.setItem('pc', String(pc))
  })
});

languageSelect.addEventListener('change', (e) => {
  const newValue = e.target.value
  const isTranslated = newValue === 'en'
  gameTitle.textContent = language('Jogo da Velha', 'Tic Tac Toe', isTranslated)
  if (isTranslated) {
    enSelect.textContent = 'English'
    ptSelect.textContent = 'Portuguese'
    playAgainBtn.textContent = 'Play again'
  } else {
    enSelect.textContent = 'Inglês'
    ptSelect.textContent = 'Português'
    playAgainBtn.textContent = 'Jogar de jovo'
  }
  localStorage.setItem('language', newValue)
})