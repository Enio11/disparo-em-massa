// API Base URL
const API_URL = '/api';

// Estado global
let campanhas = [];
let instancias = [];
let campanhaAtual = null;

// Função de Logout
function logout() {
    if (confirm('Deseja realmente sair?')) {
        localStorage.removeItem('authenticated');
        localStorage.removeItem('user_email');
        window.location.href = 'login.html';
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    inicializarTabs();
    inicializarFormularios();
    carregarCampanhas();
    carregarInstancias();
    inicializarModais();
});

// Tabs
function inicializarTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;

            // Remover active de todos
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));

            // Adicionar active no clicado
            btn.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');

            // Recarregar dados se necessário
            if (tabName === 'campanhas') carregarCampanhas();
            if (tabName === 'instancias') carregarInstancias();
        });
    });
}

// Estado global para clientes selecionados
let clientesSelecionados = [];

// Formulários
function inicializarFormularios() {
    // Form de Campanha
    const formCampanha = document.getElementById('form-campanha');
    const tipoSelect = document.getElementById('tipo');
    const mediaFields = document.getElementById('media-fields');

    tipoSelect.addEventListener('change', (e) => {
        if (e.target.value === 'texto') {
            mediaFields.style.display = 'none';
        } else {
            mediaFields.style.display = 'block';

            // Atualizar mimetype baseado no tipo
            const mimetypeSelect = document.getElementById('mimetype');
            if (e.target.value === 'imagem') {
                mimetypeSelect.innerHTML = `
                    <option value="image/jpeg">image/jpeg</option>
                    <option value="image/png">image/png</option>
                `;
            } else if (e.target.value === 'video') {
                mimetypeSelect.innerHTML = `
                    <option value="video/mp4">video/mp4</option>
                `;
            }
        }
    });

    formCampanha.addEventListener('submit', async (e) => {
        e.preventDefault();
        await criarCampanha();
    });

    // Form de Instância
    const formInstancia = document.getElementById('form-instancia');
    formInstancia.addEventListener('submit', async (e) => {
        e.preventDefault();
        await criarInstancia();
    });

    // Toggle entre Supabase e Manual
    const origemRadios = document.querySelectorAll('input[name="origem_contatos"]');
    origemRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const supabaseSection = document.getElementById('supabase-section');
            const manualSection = document.getElementById('manual-section');

            if (e.target.value === 'supabase') {
                supabaseSection.style.display = 'block';
                manualSection.style.display = 'none';
            } else {
                supabaseSection.style.display = 'none';
                manualSection.style.display = 'block';
            }
        });
    });
}

// API - Campanhas
async function carregarCampanhas() {
    try {
        const response = await fetch(`${API_URL}/campanhas`);
        const data = await response.json();

        if (data.success) {
            campanhas = data.data;
            renderizarCampanhas();
        }
    } catch (error) {
        console.error('Erro ao carregar campanhas:', error);
        mostrarErro('Erro ao carregar campanhas');
    }
}

function renderizarCampanhas() {
    const container = document.getElementById('campanhas-list');

    if (campanhas.length === 0) {
        container.innerHTML = '<p class="loading">Nenhuma campanha criada ainda.</p>';
        return;
    }

    container.innerHTML = campanhas.map(campanha => `
        <div class="campanha-card">
            <h3>${campanha.nome}</h3>
            <span class="campanha-tipo tipo-${campanha.tipo}">${campanha.tipo}</span>
            <span class="campanha-status status-${campanha.status}">${campanha.status}</span>

            <div class="campanha-info">
                <p><strong>Instância:</strong> ${campanha.instancia_nome || 'N/A'}</p>
                <p><strong>Delay:</strong> ${(campanha.delay_entre_envios / 1000)}s</p>
                ${campanha.total_contatos ? `
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${(campanha.total_enviados / campanha.total_contatos * 100)}%"></div>
                    </div>
                    <p><strong>Progresso:</strong> ${campanha.total_enviados}/${campanha.total_contatos}</p>
                ` : ''}
            </div>

            <div class="campanha-actions">
                ${campanha.status === 'rascunho' || campanha.status === 'pausada' ?
                    `<button class="btn btn-success btn-small" onclick="iniciarCampanha(${campanha.id})">▶ Iniciar</button>` : ''}
                ${campanha.status === 'enviando' ?
                    `<button class="btn btn-warning btn-small" onclick="pausarCampanha(${campanha.id})">⏸ Pausar</button>` : ''}
                <button class="btn btn-primary btn-small" onclick="verDetalhes(${campanha.id})">👁 Detalhes</button>
                ${campanha.status !== 'enviando' ?
                    `<button class="btn btn-danger btn-small" onclick="deletarCampanha(${campanha.id})">🗑 Deletar</button>` : ''}
            </div>
        </div>
    `).join('');
}

async function criarCampanha() {
    const form = document.getElementById('form-campanha');
    const formData = new FormData(form);

    const instanceName = formData.get('instance_name');

    // Validar se uma instância foi selecionada
    if (!instanceName || instanceName === '' || instanceName === 'Carregando...') {
        alert('⚠️ Por favor, selecione uma instância do WhatsApp válida!');
        return;
    }

    const campanhaData = {
        nome: formData.get('nome'),
        tipo: formData.get('tipo'),
        mensagem: formData.get('mensagem'),
        instance_name: instanceName,
        delay_entre_envios: parseInt(formData.get('delay_entre_envios')) * 1000
    };

    if (campanhaData.tipo !== 'texto') {
        campanhaData.media_url = formData.get('media_url');
        campanhaData.media_filename = formData.get('media_filename');
        campanhaData.mimetype = formData.get('mimetype');
    }

    try {
        const response = await fetch(`${API_URL}/campanhas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(campanhaData)
        });

        const data = await response.json();

        if (data.success) {
            const campanhaId = data.data.id;

            // Verificar origem dos contatos
            const origemContatos = document.querySelector('input[name="origem_contatos"]:checked').value;

            if (origemContatos === 'supabase') {
                // Importar clientes do Supabase
                if (clientesSelecionados.length === 0) {
                    alert('⚠️ Selecione pelo menos um cliente do Supabase!');
                    return;
                }

                const whatsapps = clientesSelecionados.map(c => c.whatsapp);

                await fetch(`${API_URL}/clientes-supabase/importar`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        cliente_whatsapps: whatsapps,
                        campanha_id: campanhaId
                    })
                });

                alert(`✅ Campanha criada com ${clientesSelecionados.length} clientes do Supabase!`);

                // Limpar seleção
                clientesSelecionados = [];
                document.getElementById('clientes-result').innerHTML = '<p style="color: #666;">Clique em "Buscar Clientes" para carregar...</p>';
                document.getElementById('clientes-selecionados').style.display = 'none';

            } else {
                // Importar contatos manuais
                const contatosText = document.getElementById('contatos').value.trim();
                if (contatosText) {
                    const telefones = contatosText.split('\n').filter(t => t.trim());
                    const contatos = telefones.map(tel => ({
                        telefone: tel.trim(),
                        nome: ''
                    }));

                    await fetch(`${API_URL}/contatos/importar`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            campanha_id: campanhaId,
                            contatos
                        })
                    });

                    alert(`✅ Campanha criada com ${contatos.length} contatos!`);
                } else {
                    alert('⚠️ Digite pelo menos um número de telefone!');
                    return;
                }
            }

            form.reset();
            carregarCampanhas();

            // Ir para a tab de campanhas
            document.querySelector('[data-tab="campanhas"]').click();
        } else {
            mostrarErro(data.error || 'Erro ao criar campanha');
        }
    } catch (error) {
        console.error('Erro ao criar campanha:', error);
        mostrarErro('Erro ao criar campanha');
    }
}

async function iniciarCampanha(id) {
    if (!confirm('Deseja iniciar esta campanha?')) return;

    try {
        const response = await fetch(`${API_URL}/campanhas/${id}/iniciar`, {
            method: 'POST'
        });

        const data = await response.json();

        if (data.success) {
            alert('Campanha iniciada!');
            carregarCampanhas();
        } else {
            mostrarErro(data.error || 'Erro ao iniciar campanha');
        }
    } catch (error) {
        console.error('Erro ao iniciar campanha:', error);
        mostrarErro('Erro ao iniciar campanha');
    }
}

async function pausarCampanha(id) {
    if (!confirm('Deseja pausar esta campanha?')) return;

    try {
        const response = await fetch(`${API_URL}/campanhas/${id}/pausar`, {
            method: 'POST'
        });

        const data = await response.json();

        if (data.success) {
            alert('Campanha pausada!');
            carregarCampanhas();
        } else {
            mostrarErro(data.error);
        }
    } catch (error) {
        console.error('Erro ao pausar campanha:', error);
        mostrarErro('Erro ao pausar campanha');
    }
}

async function deletarCampanha(id) {
    if (!confirm('Tem certeza que deseja deletar esta campanha? Esta ação não pode ser desfeita.')) return;

    try {
        const response = await fetch(`${API_URL}/campanhas/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            alert('Campanha deletada!');
            carregarCampanhas();
        } else {
            mostrarErro(data.error);
        }
    } catch (error) {
        console.error('Erro ao deletar campanha:', error);
        mostrarErro('Erro ao deletar campanha');
    }
}

async function verDetalhes(id) {
    try {
        const [campanhaRes, statsRes] = await Promise.all([
            fetch(`${API_URL}/campanhas/${id}`),
            fetch(`${API_URL}/campanhas/${id}/estatisticas`)
        ]);

        const campanhaData = await campanhaRes.json();
        const statsData = await statsRes.json();

        if (campanhaData.success && statsData.success) {
            const campanha = campanhaData.data;
            const stats = statsData.data;

            const modal = document.getElementById('modal-campanha');
            const modalBody = document.getElementById('modal-body');

            modalBody.innerHTML = `
                <div class="stats">
                    <div class="stat-card">
                        <h4>Pendentes</h4>
                        <p>${stats.pendente || 0}</p>
                    </div>
                    <div class="stat-card">
                        <h4>Enviados</h4>
                        <p>${stats.enviado || 0}</p>
                    </div>
                    <div class="stat-card">
                        <h4>Erros</h4>
                        <p>${stats.erro || 0}</p>
                    </div>
                </div>

                <h3>Informações</h3>
                <p><strong>Nome:</strong> ${campanha.nome}</p>
                <p><strong>Tipo:</strong> ${campanha.tipo}</p>
                <p><strong>Status:</strong> ${campanha.status}</p>
                <p><strong>Instância:</strong> ${campanha.instancia_nome}</p>
                <p><strong>Delay:</strong> ${(campanha.delay_entre_envios / 1000)}s</p>

                <h3>Mensagem</h3>
                <p style="white-space: pre-wrap; background: #f5f5f5; padding: 15px; border-radius: 5px;">${campanha.mensagem}</p>

                ${campanha.media_url ? `
                    <h3>Mídia</h3>
                    <p><strong>URL:</strong> <a href="${campanha.media_url}" target="_blank">${campanha.media_url}</a></p>
                    <p><strong>Tipo:</strong> ${campanha.mimetype}</p>
                ` : ''}
            `;

            modal.classList.add('show');
        }
    } catch (error) {
        console.error('Erro ao buscar detalhes:', error);
        mostrarErro('Erro ao buscar detalhes');
    }
}

// API - Instâncias
async function carregarInstancias() {
    try {
        const response = await fetch(`${API_URL}/instancias/evolution/listar`);
        const data = await response.json();

        if (data.success) {
            instancias = data.data;
            renderizarInstancias();
            atualizarSelectInstancias();
        }
    } catch (error) {
        console.error('Erro ao carregar instâncias:', error);
        mostrarErro('Erro ao carregar instâncias');
    }
}

function renderizarInstancias() {
    const container = document.getElementById('instancias-list');

    if (instancias.length === 0) {
        container.innerHTML = '<p class="loading">Nenhuma instância encontrada.</p>';
        return;
    }

    container.innerHTML = instancias.map(inst => `
        <div class="list-item">
            <div class="list-item-info">
                <h4>${inst.name}</h4>
                <p>Integration: ${inst.integration || 'N/A'}</p>
                <p>Number: ${inst.number || 'Não conectado'}</p>
                ${inst.profileName ? `<p>Profile: ${inst.profileName}</p>` : ''}
                <span class="status-badge status-${inst.connected ? 'ativa' : 'inativa'}">${inst.connectionStatus}</span>
            </div>
            <div class="list-item-actions">
                ${inst.connected ? '<span style="color: green;">✅ Conectada</span>' : '<span style="color: red;">❌ Desconectada</span>'}
            </div>
        </div>
    `).join('');
}

function atualizarSelectInstancias() {
    const select = document.getElementById('instancia');

    // Filtrar apenas instâncias conectadas
    const instanciasConectadas = instancias.filter(inst => inst.connected);

    if (instanciasConectadas.length === 0) {
        select.innerHTML = '<option value="">Nenhuma instância conectada</option>';
        return;
    }

    select.innerHTML = instanciasConectadas.map(inst =>
        `<option value="${inst.name}">${inst.name} (${inst.connectionStatus})</option>`
    ).join('');
}

async function criarInstancia() {
    const nome = document.getElementById('instancia_nome').value;
    const instance_name = document.getElementById('instance_name').value;

    try {
        const response = await fetch(`${API_URL}/instancias`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, instance_name })
        });

        const data = await response.json();

        if (data.success) {
            alert('Instância criada com sucesso!');
            document.getElementById('form-instancia').reset();
            carregarInstancias();
        } else {
            mostrarErro(data.error);
        }
    } catch (error) {
        console.error('Erro ao criar instância:', error);
        mostrarErro('Erro ao criar instância');
    }
}

async function verificarConexao(id) {
    try {
        const response = await fetch(`${API_URL}/instancias/${id}/verificar`);
        const data = await response.json();

        if (data.success) {
            alert(`Conexão: ${data.connected ? 'Ativa ✅' : 'Inativa ❌'}`);
            carregarInstancias();
        } else {
            mostrarErro(data.error);
        }
    } catch (error) {
        console.error('Erro ao verificar conexão:', error);
        mostrarErro('Erro ao verificar conexão');
    }
}

async function deletarInstancia(id) {
    if (!confirm('Tem certeza que deseja deletar esta instância?')) return;

    try {
        const response = await fetch(`${API_URL}/instancias/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            alert('Instância deletada!');
            carregarInstancias();
        } else {
            mostrarErro(data.error);
        }
    } catch (error) {
        console.error('Erro ao deletar instância:', error);
        mostrarErro('Erro ao deletar instância');
    }
}

// Modais
function inicializarModais() {
    const modais = document.querySelectorAll('.modal');

    modais.forEach(modal => {
        const closeBtn = modal.querySelector('.close');

        closeBtn.addEventListener('click', () => {
            modal.classList.remove('show');
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    });
}

// Utilidades
// Aplicar Filtro Rápido
function aplicarFiltroRapido(minutos) {
    const agora = new Date();
    const inicio = new Date(agora.getTime() - (minutos * 60 * 1000));

    // Formatar para datetime-local (formato: 2025-10-07T13:30)
    const formatarDatetimeLocal = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    document.getElementById('filtro_data_inicio').value = formatarDatetimeLocal(inicio);
    document.getElementById('filtro_data_fim').value = formatarDatetimeLocal(agora);

    // Buscar automaticamente
    buscarClientesSupabase();
}

function limparFiltros() {
    document.getElementById('filtro_data_inicio').value = '';
    document.getElementById('filtro_data_fim').value = '';
    document.getElementById('filtro_nome').value = '';
    document.getElementById('filtro_instancia').value = '';
    document.getElementById('clientes-result').innerHTML = '<p style="color: #666;">Clique em "Buscar Clientes" para carregar...</p>';
}

// Buscar Clientes do Supabase
async function buscarClientesSupabase() {
    const dataInicio = document.getElementById('filtro_data_inicio').value;
    const dataFim = document.getElementById('filtro_data_fim').value;
    const nome = document.getElementById('filtro_nome').value;
    const instancia = document.getElementById('filtro_instancia').value;

    const resultContainer = document.getElementById('clientes-result');
    resultContainer.innerHTML = '<p style="color: #666;">🔄 Buscando clientes...</p>';

    try {
        // Montar filtros
        const filtros = {};
        if (nome) filtros.nome = nome;
        if (instancia) filtros.ia_instancia = instancia;

        const response = await fetch(`${API_URL}/clientes-supabase/filtrar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(filtros)
        });

        const data = await response.json();

        if (data.success && data.data) {
            let clientes = data.data;

            // Filtrar por data no frontend (timezone São Paulo)
            if (dataInicio || dataFim) {
                clientes = clientes.filter(cliente => {
                    const dataCliente = new Date(cliente.create_at);

                    if (dataInicio) {
                        const inicio = new Date(dataInicio);
                        if (dataCliente < inicio) return false;
                    }

                    if (dataFim) {
                        const fim = new Date(dataFim);
                        if (dataCliente > fim) return false;
                    }

                    return true;
                });
            }

            renderizarClientesSupabase(clientes);
        } else {
            resultContainer.innerHTML = '<p style="color: red;">Erro ao buscar clientes</p>';
        }
    } catch (error) {
        console.error('Erro ao buscar clientes:', error);
        resultContainer.innerHTML = '<p style="color: red;">Erro ao buscar clientes</p>';
    }
}

function renderizarClientesSupabase(clientes) {
    const resultContainer = document.getElementById('clientes-result');

    if (clientes.length === 0) {
        resultContainer.innerHTML = '<p style="color: #666;">Nenhum cliente encontrado com os filtros aplicados.</p>';
        return;
    }

    const html = `
        <div style="margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
            <strong>${clientes.length} cliente(s) encontrado(s)</strong>
            <div>
                <button type="button" class="btn btn-small" onclick="selecionarTodosClientes(true)" style="margin-right: 5px;">
                    Selecionar Todos
                </button>
                <button type="button" class="btn btn-small" onclick="selecionarTodosClientes(false)">
                    Desmarcar Todos
                </button>
            </div>
        </div>
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background: #f5f5f5;">
                    <th style="padding: 8px; border: 1px solid #ddd;">
                        <input type="checkbox" id="select-all-checkbox" onchange="selecionarTodosClientes(this.checked)">
                    </th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Nome</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">WhatsApp</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Instância</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Data Criação</th>
                </tr>
            </thead>
            <tbody>
                ${clientes.map(cliente => {
                    const dataCriacao = new Date(cliente.create_at).toLocaleString('pt-BR', {
                        timeZone: 'America/Sao_Paulo'
                    });

                    return `
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">
                                <input type="checkbox"
                                       class="cliente-checkbox"
                                       value="${cliente.whatsapp}"
                                       data-nome="${cliente.nome || ''}"
                                       onchange="atualizarSelecaoClientes()">
                            </td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${cliente.nome || 'N/A'}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${cliente.whatsapp}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${cliente.ia_instancia || 'N/A'}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${dataCriacao}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;

    resultContainer.innerHTML = html;
}

function selecionarTodosClientes(selecionar) {
    const checkboxes = document.querySelectorAll('.cliente-checkbox');
    checkboxes.forEach(cb => cb.checked = selecionar);

    const selectAllCheckbox = document.getElementById('select-all-checkbox');
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = selecionar;
    }

    atualizarSelecaoClientes();
}

function atualizarSelecaoClientes() {
    const checkboxes = document.querySelectorAll('.cliente-checkbox:checked');
    clientesSelecionados = Array.from(checkboxes).map(cb => ({
        whatsapp: cb.value,
        nome: cb.dataset.nome
    }));

    const countElement = document.getElementById('count-selecionados');
    const selecionadosDiv = document.getElementById('clientes-selecionados');

    if (clientesSelecionados.length > 0) {
        countElement.textContent = clientesSelecionados.length;
        selecionadosDiv.style.display = 'block';
    } else {
        selecionadosDiv.style.display = 'none';
    }
}

function mostrarErro(mensagem) {
    alert('Erro: ' + mensagem);
}

// ========== FUNÇÕES DE MÉTRICAS E AQUECIMENTO ==========

// Carregar instâncias no select de métricas
async function carregarInstanciasMetricas() {
    try {
        const response = await fetch(`${API_URL}/instancias/evolution/listar`);
        const data = await response.json();

        const select = document.getElementById('instance-metrics');
        select.innerHTML = '<option value="">-- Selecione uma instância --</option>';

        if (data.success && data.data) {
            data.data.forEach(inst => {
                const option = document.createElement('option');
                option.value = inst.instance.instanceName;
                option.textContent = `${inst.instance.instanceName} (${inst.instance.status})`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Erro ao carregar instâncias:', error);
    }
}

// Carregar métricas da instância selecionada
async function carregarMetricas() {
    const instanceName = document.getElementById('instance-metrics').value;

    if (!instanceName) {
        alert('Selecione uma instância primeiro!');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/warmup/metrics/${instanceName}`);
        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Erro ao carregar métricas');
        }

        const { warmup, antiBan } = result.data;

        // Atualizar cards
        document.getElementById('daily-count').textContent = antiBan.dailyCount || 0;
        document.getElementById('daily-limit').textContent = `de ${antiBan.limits?.daily || 500}`;
        document.getElementById('hourly-count').textContent = antiBan.hourlyCount || 0;
        document.getElementById('business-hours').textContent = antiBan.isBusinessHours ? '✅ Sim' : '❌ Não';

        // Aquecimento
        if (warmup.isWarmingUp) {
            document.getElementById('warmup-status').textContent = `Dia ${warmup.currentDay}/28`;
            document.getElementById('warmup-day').textContent = warmup.description || '';
            document.getElementById('warmup-progress').style.display = 'block';
            document.getElementById('warmup-progress-bar').style.width = warmup.progress + '%';
            document.getElementById('warmup-description').textContent =
                `${warmup.maxMessagesPerDay} mensagens permitidas hoje (${warmup.progress}% completo)`;
        } else if (warmup.isComplete) {
            document.getElementById('warmup-status').textContent = '✅ Completo';
            document.getElementById('warmup-day').textContent = 'Aquecimento finalizado!';
            document.getElementById('warmup-progress').style.display = 'none';
        } else {
            document.getElementById('warmup-status').textContent = 'Não ativo';
            document.getElementById('warmup-day').textContent = 'Clique em "Iniciar Aquecimento"';
            document.getElementById('warmup-progress').style.display = 'none';
        }

    } catch (error) {
        console.error('Erro ao carregar métricas:', error);
        alert('Erro ao carregar métricas: ' + error.message);
    }
}

// Iniciar aquecimento
async function iniciarAquecimento() {
    const instanceName = document.getElementById('instance-metrics').value;

    if (!instanceName) {
        alert('Selecione uma instância primeiro!');
        return;
    }

    if (!confirm(`Tem certeza que deseja iniciar o aquecimento de 28 dias para a instância "${instanceName}"?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/warmup/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ instance_name: instanceName })
        });

        const data = await response.json();

        if (data.success) {
            alert('✅ Aquecimento iniciado! O progresso será acompanhado automaticamente nos próximos 28 dias.');
            carregarMetricas();
        } else {
            alert('❌ ' + (data.error || 'Erro ao iniciar aquecimento'));
        }
    } catch (error) {
        console.error('Erro ao iniciar aquecimento:', error);
        alert('Erro ao iniciar aquecimento: ' + error.message);
    }
}

// Parar aquecimento
async function pararAquecimento() {
    const instanceName = document.getElementById('instance-metrics').value;

    if (!instanceName) {
        alert('Selecione uma instância primeiro!');
        return;
    }

    if (!confirm('Tem certeza que deseja parar o aquecimento? O progresso será perdido.')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/warmup/stop`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ instance_name: instanceName })
        });

        const data = await response.json();

        if (data.success) {
            alert('✅ Aquecimento parado!');
            carregarMetricas();
        } else {
            alert('❌ ' + (data.error || 'Erro ao parar aquecimento'));
        }
    } catch (error) {
        console.error('Erro ao parar aquecimento:', error);
        alert('Erro ao parar aquecimento: ' + error.message);
    }
}

// Ver cronograma completo
async function verCronograma() {
    const cronogramaSection = document.getElementById('cronograma-section');

    // Toggle visibility
    if (cronogramaSection.style.display === 'block') {
        cronogramaSection.style.display = 'none';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/warmup/schedule`);
        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Erro ao carregar cronograma');
        }

        const schedule = result.data;
        const html = schedule.map(day => `
            <div style="padding: 15px; border: 1px solid #e0e0e0; margin: 10px 0; border-radius: 8px; background: ${day.day % 7 === 0 ? '#f8f9fa' : 'white'};">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong style="font-size: 16px; color: #667eea;">Dia ${day.day}</strong>
                        <p style="margin: 5px 0; color: #666;">${day.description}</p>
                    </div>
                    <div style="text-align: right;">
                        <span style="font-size: 24px; font-weight: bold; color: #764ba2;">${day.maxMessages}</span>
                        <p style="margin: 0; color: #999; font-size: 12px;">mensagens</p>
                    </div>
                </div>
            </div>
        `).join('');

        document.getElementById('warmup-schedule').innerHTML = html;
        cronogramaSection.style.display = 'block';

        // Scroll suave até o cronograma
        cronogramaSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    } catch (error) {
        console.error('Erro ao carregar cronograma:', error);
        alert('Erro ao carregar cronograma: ' + error.message);
    }
}

// Carregar instâncias quando a aba de métricas for aberta
document.addEventListener('DOMContentLoaded', () => {
    // Observer para detectar quando a tab de métricas é aberta
    const observer = new MutationObserver(() => {
        const metricasTab = document.getElementById('metricas-tab');
        if (metricasTab && metricasTab.classList.contains('active')) {
            carregarInstanciasMetricas();
        }
    });

    const metricasTab = document.getElementById('metricas-tab');
    if (metricasTab) {
        observer.observe(metricasTab, { attributes: true, attributeFilter: ['class'] });
    }
});

// Auto-refresh das campanhas a cada 10 segundos se houver campanhas enviando
setInterval(() => {
    const tabCampanhasAtiva = document.getElementById('campanhas-tab').classList.contains('active');
    const temCampanhaEnviando = campanhas.some(c => c.status === 'enviando');

    if (tabCampanhasAtiva && temCampanhaEnviando) {
        carregarCampanhas();
    }
}, 10000);
