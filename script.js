document.addEventListener('DOMContentLoaded', () => {
  // CONFIGURAÇÃO DA SENHA DE ACESSO DOS FUNCIONÁRIOS
  const SENHA_MESTRE = "1234";

  // Elementos do Acesso
  const screenAcesso = document.getElementById('screen-acesso');
  const formAcesso = document.getElementById('form-acesso');
  const acessoErro = document.getElementById('acesso-erro');
  const btnBloquear = document.getElementById('btn-bloquear');
  const inputSenhaModal = document.getElementById('senha-acesso');
  const btnToggleSenha = document.getElementById('btn-toggle-senha');

  // Elementos do Modal de Cadastro
  const btnAdd = document.querySelector('.add-cadastro');
  const modalCadastro = document.getElementById('modal-cadastro');
  const btnFecharCadastro = document.getElementById('btn-fechar');
  const formCadastro = document.getElementById('form-cadastro');

  // Elementos do Modal de Empréstimo
  const modalEmprestimo = document.getElementById('modal-emprestimo');
  const btnFecharEmprestimo = document.getElementById('btn-fechar-emprestimo');
  const formEmprestimo = document.getElementById('form-emprestimo');
  const inputUserIdEmprestimo = document.getElementById('emprestimo-user-id');
  const txtLeitorEmprestimo = document.getElementById('nome-leitor-emprestimo');

  // Elementos da Pesquisa, Métricas e Lista
  const searchForm = document.querySelector('.search-container');
  const searchInput = document.querySelector('.search-input');
  const listaContainer = document.getElementById('lista-cadastros');
  const emptyState = document.getElementById('empty-state');
  const totalLeitoresEl = document.getElementById('total-leitores');
  const totalEmprestimosEl = document.getElementById('total-emprestimos');

  // --- MOSTRAR / OCULTAR SENHA ---
  if (btnToggleSenha && inputSenhaModal) {
    btnToggleSenha.addEventListener('click', () => {
      const eSenha = inputSenhaModal.type === 'password';
      inputSenhaModal.type = eSenha ? 'text' : 'password';
      btnToggleSenha.textContent = eSenha ? '🙈' : '👁️';
    });
  }

  // --- 1. VERIFICAÇÃO DE SENHA DE ACESSO ---
  function verificarAcesso() {
    const acessoLiberado = localStorage.getItem('acessoBiblioteca');
    if (acessoLiberado === 'true') {
      screenAcesso.classList.add('hidden');
      carregarDados();
    } else {
      screenAcesso.classList.remove('hidden');
    }
  }

  if (formAcesso) {
    formAcesso.addEventListener('submit', (e) => {
      e.preventDefault();
      const senhaDigitada = inputSenhaModal?.value.trim();

      if (senhaDigitada === SENHA_MESTRE) {
        localStorage.setItem('acessoBiblioteca', 'true');
        acessoErro.style.display = 'none';
        formAcesso.reset();
        verificarAcesso();
      } else {
        acessoErro.style.display = 'block';
      }
    });
  }

  if (btnBloquear) {
    btnBloquear.addEventListener('click', () => {
      localStorage.removeItem('acessoBiblioteca');
      verificarAcesso();
    });
  }

  // Normalizador de texto sem acentos
  function normalizarTexto(texto) {
    return texto
      ? texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
      : '';
  }

  // --- ATUALIZAR CONTADORES E ESTADO VAZIO ---
  function atualizarMétricasEEstadoVazio(listaFiltrada) {
    // 1. Alterna o cartão de Estado Vazio
    if (emptyState) {
      emptyState.style.display = (listaFiltrada && listaFiltrada.length > 0) ? 'none' : 'block';
    }

    // 2. Calcula métricas gerais de todos os cadastros
    const todosCadastros = JSON.parse(localStorage.getItem('cadastros')) || [];

    if (totalLeitoresEl) {
      totalLeitoresEl.textContent = todosCadastros.length;
    }

    if (totalEmprestimosEl) {
      const totalEmprestimos = todosCadastros.reduce((acc, leitor) => {
        return acc + (leitor.emprestimos ? leitor.emprestimos.length : 0);
      }, 0);
      totalEmprestimosEl.textContent = totalEmprestimos;
    }
  }

  // --- 2. RENDERIZAR CARDS ---
  function renderizar(lista) {
    if (!listaContainer) return;
    listaContainer.innerHTML = '';

    // Atualiza estatísticas e estado do cartão vazio
    atualizarMétricasEEstadoVazio(lista);

    if (!lista || lista.length === 0) {
      return; // O cartão #empty-state estilizado já se encarrega de avisar
    }

    lista.forEach(pessoa => {
      let dataFormatada = 'Não informada';
      if (pessoa.dataNascimento) {
        dataFormatada = pessoa.dataNascimento.split('-').reverse().join('/');
      }

      const emprestimos = pessoa.emprestimos || [];
      let htmlEmprestimos = '';

      if (emprestimos.length > 0) {
        htmlEmprestimos = `
          <div class="lista-emprestimos-card">
            <h4>📖 Livros Emprestados (${emprestimos.length})</h4>
            ${emprestimos.map(emp => {
              const dataDev = emp.dataDevolucao ? emp.dataDevolucao.split('-').reverse().join('/') : 'S/D';
              return `
                <div class="item-emprestimo">
                  <div class="info-livro">
                    <span class="titulo-livro">${emp.livro}</span>
                    <span class="data-livro">Devolver até: ${dataDev}</span>
                  </div>
                  <button class="btn-devolver" data-userid="${pessoa.id}" data-empid="${emp.id}">Devolver</button>
                </div>
              `;
            }).join('')}
          </div>
        `;
      }

      const card = document.createElement('div');
      card.classList.add('card-cadastro');
      card.innerHTML = `
        <div class="card-header">
          <h3>${pessoa.nome}</h3>
          <button class="btn-excluir" data-id="${pessoa.id}" title="Excluir leitor">🗑️</button>
        </div>
        <p><strong>RG:</strong> ${pessoa.rg || 'N/A'}</p>
        <p><strong>Endereço:</strong> ${pessoa.endereco || 'N/A'}</p>
        <p><strong>Data de Nasc.:</strong> ${dataFormatada}</p>
        
        ${htmlEmprestimos}

        <div class="card-actions">
          <button class="btn-add-emprestimo" data-id="${pessoa.id}" data-nome="${pessoa.nome}">+ Empréstimo</button>
        </div>
      `;

      listaContainer.appendChild(card);
    });
  }

  function carregarDados() {
    const cadastros = JSON.parse(localStorage.getItem('cadastros')) || [];
    renderizar(cadastros);
  }

  // --- 3. CONTROLE DOS MODAIS ---
  if (btnAdd) btnAdd.addEventListener('click', () => modalCadastro.classList.add('active'));
  if (btnFecharCadastro) btnFecharCadastro.addEventListener('click', () => modalCadastro.classList.remove('active'));
  if (btnFecharEmprestimo) btnFecharEmprestimo.addEventListener('click', () => modalEmprestimo.classList.remove('active'));

  window.addEventListener('click', (e) => {
    if (e.target === modalCadastro) modalCadastro.classList.remove('active');
    if (e.target === modalEmprestimo) modalEmprestimo.classList.remove('active');
  });

  // --- 4. SALVAR LEITOR ---
  if (formCadastro) {
    formCadastro.addEventListener('submit', (e) => {
      e.preventDefault();

      const novoUtilizador = {
        id: Date.now(),
        nome: document.getElementById('nome')?.value.trim() || '',
        rg: document.getElementById('rg')?.value.trim() || '',
        endereco: document.getElementById('endereco')?.value.trim() || '',
        dataNascimento: document.getElementById('data-nasc')?.value || '',
        emprestimos: []
      };

      const cadastros = JSON.parse(localStorage.getItem('cadastros')) || [];
      cadastros.push(novoUtilizador);
      localStorage.setItem('cadastros', JSON.stringify(cadastros));

      if (searchInput) searchInput.value = '';
      carregarDados();

      modalCadastro.classList.remove('active');
      formCadastro.reset();
    });
  }

  // --- 5. AÇÕES DOS CARDS ---
  listaContainer?.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-excluir')) {
      const idParaExcluir = Number(e.target.getAttribute('data-id'));
      if (confirm('Tem certeza que deseja excluir este leitor?')) {
        let cadastros = JSON.parse(localStorage.getItem('cadastros')) || [];
        cadastros = cadastros.filter(item => item.id !== idParaExcluir);
        localStorage.setItem('cadastros', JSON.stringify(cadastros));
        pesquisar();
      }
    }

    if (e.target.classList.contains('btn-add-emprestimo')) {
      const id = e.target.getAttribute('data-id');
      const nome = e.target.getAttribute('data-nome');

      inputUserIdEmprestimo.value = id;
      txtLeitorEmprestimo.textContent = `Leitor: ${nome}`;
      modalEmprestimo.classList.add('active');
    }

    if (e.target.classList.contains('btn-devolver')) {
      const userId = Number(e.target.getAttribute('data-userid'));
      const empId = Number(e.target.getAttribute('data-empid'));

      let cadastros = JSON.parse(localStorage.getItem('cadastros')) || [];
      const leitor = cadastros.find(u => u.id === userId);

      if (leitor && leitor.emprestimos) {
        leitor.emprestimos = leitor.emprestimos.filter(emp => emp.id !== empId);
        localStorage.setItem('cadastros', JSON.stringify(cadastros));
        pesquisar();
      }
    }
  });

  // --- 6. REGISTRAR EMPRÉSTIMO ---
  if (formEmprestimo) {
    formEmprestimo.addEventListener('submit', (e) => {
      e.preventDefault();

      const userId = Number(inputUserIdEmprestimo.value);
      const nomeLivro = document.getElementById('nome-livro')?.value.trim();
      const dataDevolucao = document.getElementById('data-devolucao')?.value;

      if (!nomeLivro || !dataDevolucao) return;

      let cadastros = JSON.parse(localStorage.getItem('cadastros')) || [];
      const leitor = cadastros.find(u => u.id === userId);

      if (leitor) {
        if (!leitor.emprestimos) leitor.emprestimos = [];
        
        leitor.emprestimos.push({
          id: Date.now(),
          livro: nomeLivro,
          dataDevolucao: dataDevolucao
        });

        localStorage.setItem('cadastros', JSON.stringify(cadastros));
        pesquisar();
      }

      modalEmprestimo.classList.remove('active');
      formEmprestimo.reset();
    });
  }

  // --- 7. PESQUISA ---
  function pesquisar() {
    const termoBusca = searchInput ? normalizarTexto(searchInput.value.trim()) : '';
    const cadastros = JSON.parse(localStorage.getItem('cadastros')) || [];

    if (!termoBusca) {
      renderizar(cadastros);
      return;
    }

    const resultado = cadastros.filter(user =>
      normalizarTexto(user.nome).includes(termoBusca)
    );

    renderizar(resultado);
  }

  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      pesquisar();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', pesquisar);
  }

  // Inicializa checando o acesso
  verificarAcesso();
});