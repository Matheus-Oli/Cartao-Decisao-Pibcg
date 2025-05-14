const form = document.getElementById("decision-form");
const page1 = document.getElementById("page1");
const page2 = document.getElementById("page2");
const nextBtn = document.getElementById("next-btn");
const prevBtn = document.getElementById("prev-btn");
const submitBtn = document.getElementById("submit-btn");
const successMessage = document.getElementById("success-message");
const newFormBtn = document.getElementById("new-form-btn");
const loadingOverlay = document.getElementById("loading-overlay");

// Corrigir problema de seleção de sexo
document.addEventListener("DOMContentLoaded", () => {
  const sexoF = document.getElementById("sexo-f");
  const sexoM = document.getElementById("sexo-m");

  if (sexoF && sexoM) {
    sexoF.addEventListener("click", () => {
      sexoM.checked = false;
      sexoF.checked = true;
    });

    sexoM.addEventListener("click", () => {
      sexoF.checked = false;
      sexoM.checked = true;
    });
  }

  // Melhorar campo outro motivo
  const outroMotivoCheck = document.querySelector('input[name="oracao"][value="outro"]');
  const outroMotivoInput = document.getElementById("outro-motivo");

  if (outroMotivoCheck && outroMotivoInput) {
    outroMotivoCheck.addEventListener("change", function () {
      if (this.checked) {
        outroMotivoInput.focus();
      }
    });
  }
});

// Navegação entre páginas
nextBtn.addEventListener("click", () => {
  if (validatePage1()) {
    page1.style.display = "none";
    page2.style.display = "block";
    window.scrollTo(0, 0);
  }
});

prevBtn.addEventListener("click", () => {
  page2.style.display = "none";
  page1.style.display = "block";
  window.scrollTo(0, 0);
});

// Validação da página 1
function validatePage1() {
  const nome = document.getElementById("nome");

  if (!nome.value.trim()) {
    alert("Por favor, informe seu nome.");
    nome.focus();
    return false;
  }

  return true;
}

// Manipulação do formulário
form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  submitForm();
});

// Validação completa do formulário
function validateForm() {
  const nome = document.getElementById("nome");

  if (!nome.value.trim()) {
    alert("Por favor, informe seu nome.");
    page2.style.display = "none";
    page1.style.display = "block";
    nome.focus();
    return false;
  }

  return true;
}

function submitForm() {
  showLoading();

  const form = document.querySelector('form');
  const formData = new FormData(form);
  const formValues = {};

  // Converter os dados do formulário em objeto
  for (const [key, value] of formData.entries()) {
    if (formValues[key]) {
      if (!Array.isArray(formValues[key])) {
        formValues[key] = [formValues[key]];
      }
      formValues[key].push(value);
    } else {
      formValues[key] = value;
    }
  }

  const emailData = {
    to: "secretaria@pibcg.org.br",
    subject: "Novo Cartão de Decisão - " + formValues.nome,
    body: formatEmailBody(formValues),
    replyTo: formValues.email,
  };

  fetch('/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(emailData),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Erro no servidor");
      hideLoading();
      showSuccess();
    })
    .catch((err) => {
      hideLoading();
      alert("Erro ao enviar o formulário: " + err.message);
    });
}

// Formatar o corpo do email
function formatEmailBody(data) {
  let body = `<h2>Cartão de Decisão - PIBCG</h2>`;

  // Informações Pessoais
  body += `<h3>Informações Pessoais</h3>`;
  body += `<p><strong>Nome:</strong> ${data.nome || "-"}</p>`;
  body += `<p><strong>Data de Nascimento:</strong> ${data["data-nascimento"] || "-"}</p>`;
  body += `<p><strong>Sexo:</strong> ${data.sexo || "-"}</p>`;

  // Endereço
  body += `<p><strong>Endereço:</strong> ${data.endereco || "-"}, ${data.numero || "-"}`;
  if (data.bloco) body += `, Bl: ${data.bloco}`;
  if (data.apto) body += `, Apto: ${data.apto}`;
  if (data.conjunto) body += `, Conjunto: ${data.conjunto}`;
  body += `</p>`;

  body += `<p><strong>CEP:</strong> ${data.cep || "-"}</p>`;
  body += `<p><strong>Bairro:</strong> ${data.bairro || "-"}</p>`;
  body += `<p><strong>Cidade/UF:</strong> ${data.cidade || "-"}/${data.uf || "-"}</p>`;

  // Contato
  body += `<p><strong>Telefone:</strong> ${data.telefone || "-"}</p>`;
  body += `<p><strong>WhatsApp:</strong> ${data.whatsapp || "-"}</p>`;
  body += `<p><strong>Email:</strong> ${data.email || "-"}</p>`;

  // Tipo de Visitante
  body += `<h3>Informações de Visita</h3>`;
  body += `<p><strong>Visita:</strong> ${getVisitaLabel(data.visita)}</p>`;
  body += `<p><strong>Tipo de Visitante:</strong> ${getTipoVisitanteLabel(data.tipo_visitante)}</p>`;
  body += `<p><strong>Faixa Etária:</strong> ${getFaixaEtariaLabel(data.faixa_etaria)}</p>`;
  body += `<p><strong>Estado Civil:</strong> ${getEstadoCivilLabel(data.estado_civil)}</p>`;
  body += `<p><strong>Data da Visita:</strong> ${data["data-visita"] || "-"}</p>`;
  body += `<p><strong>Tem parentes/amigos na PIBCG:</strong> ${data.tem_parentes || "Não"}</p>`;
  if (data.tem_parentes === "sim") {
    body += `<p><strong>Quem:</strong> ${data.quem || "-"}</p>`;
  }

  // Decisões
  body += `<h3>Decisões</h3>`;
  const decisoes = Array.isArray(data.decisao) ? data.decisao : [data.decisao].filter(Boolean);

  if (decisoes.length > 0) {
    body += `<ul>`;
    decisoes.forEach((decisao) => {
      body += `<li>${getDecisaoLabel(decisao)}</li>`;
    });
    body += `</ul>`;
  } else {
    body += `<p>Nenhuma decisão selecionada</p>`;
  }

  // Dias e horários para estudos bíblicos
  if (decisoes.includes("estudo_biblico")) {
    body += `<p><strong>Melhor dia para estudo:</strong> ${data["melhor-dia"] || "-"}</p>`;
    body += `<p><strong>Melhor hora para estudo:</strong> ${data["melhor-hora"] || "-"}</p>`;
  }

  // Dias e horários para falar com liderança
  if (decisoes.includes("falar_pastor") || decisoes.includes("falar_diacono") || decisoes.includes("falar_vice")) {
    body += `<p><strong>Melhor dia para conversa:</strong> ${data["falar-dia"] || "-"}</p>`;
    body += `<p><strong>Melhor hora para conversa:</strong> ${data["falar-hora"] || "-"}</p>`;
  }

  // Visitas
  body += `<p><strong>Aceita visitas:</strong> ${data["aceito-visitas"] || "-"}</p>`;
  body += `<p><strong>Dia para visita:</strong> ${data["visita-dia"] || "-"}</p>`;
  body += `<p><strong>Horário para visita:</strong> ${data["visita-hora"] || "-"}</p>`;

  // Culto em casa
  body += `<p><strong>Dia para culto em casa:</strong> ${data["culto-dia"] || "-"}</p>`;
  body += `<p><strong>Horário para culto:</strong> ${data["culto-hora"] || "-"}</p>`;

  // Oração
  body += `<h3>Pedidos de Oração</h3>`;
  const oracoes = Array.isArray(data.oracao) ? data.oracao : [data.oracao].filter(Boolean);

  if (oracoes.length > 0) {
    body += `<ul>`;
    oracoes.forEach((oracao) => {
      const texto = getOracaoLabel(oracao);
      if (oracao === "outro") {
        body += `<li>${texto}</li>`;
        if (data["outro-motivo"]) {
          body += `<li>Especificação: ${data["outro-motivo"]}</li>`;
        }
      } else {
        body += `<li>${texto}</li>`;
      }
    });
    body += `</ul>`;
  } else {
    body += `<p>Nenhum pedido de oração selecionado</p>`;
  }

  // Opiniões
  body += `<h3>Opiniões</h3>`;
  body += `<p><strong>Recepção:</strong> ${data.recepcao || "-"}</p>`;
  body += `<p><strong>Música:</strong> ${data.musica || "-"}</p>`;
  body += `<p><strong>Pregação:</strong> ${data.pregacao || "-"}</p>`;
  body += `<p><strong>Convidado por:</strong> ${data["convidado-por"] || "-"}</p>`;

  // Comentário
  body += `<h3>Comentário</h3>`;
  body += `<p>${data.comentario || "Nenhum comentário"}</p>`;

  return body;
}

// Funções auxiliares para obter labels legíveis
function getVisitaLabel(value) {
  const labels = {
    "1": "1ª vez",
    "2": "2ª vez",
    "3": "3ª vez",
    mais: "Mais de 3 vezes",
  };
  return labels[value] || value || "Não informado";
}

function getTipoVisitanteLabel(value) {
  const labels = {
    evangelico: "Visitante evangélico",
    novo: "Novo convertido",
    afastado: "Afastado",
    frequentador: "Frequentador",
  };
  return labels[value] || value || "Não informado";
}

function getFaixaEtariaLabel(value) {
  const labels = {
    crianca: "Criança",
    junior: "Junior",
    adolescente: "Adolescente",
    jovem: "Jovem",
    adulto: "Adulto",
    idoso: "Idoso",
  };
  return labels[value] || value || "Não informado";
}

function getEstadoCivilLabel(value) {
  const labels = {
    solteiro: "Solteiro(a)",
    casado: "Casado(a)",
    viuvo: "Viúvo(a)",
    divorciado: "Divorciado(a)",
    separado: "Separado(a)",
  };
  return labels[value] || value || "Não informado";
}

function getDecisaoLabel(value) {
  const labels = {
    aceitar_jesus: "Estou recebendo a Jesus como meu Salvador e Senhor",
    reconciliacao: "Quero pedir minha reconciliação com Cristo e Igreja",
    estudo_biblico: "Quero receber estudo bíblico",
    batismo: "Quero ser batizado",
    membro: "Quero me tornar membro",
    falar_pastor: "Quero falar com o Pastor",
    falar_diacono: "Quero falar com o Diácono",
    falar_vice: "Quero falar com o Vice-presidente",
  };
  return labels[value] || value || "Não informado";
}

function getOracaoLabel(value) {
  const labels = {
    vida: "Minha Vida",
    relacionamento: "Meu relacionamento conjugal",
    filhos: "Meus filhos",
    saude: "Saúde",
    emprego: "Emprego",
    outro: "Outro motivo",
  };
  return labels[value] || value || "Não informado";
}

// Simulação de envio de email
function simulateEmailSending(emailData) {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Email enviado:", emailData);
      resolve();
    }, 2000);
  });
}

// Mostrar mensagem de sucesso
function showSuccess() {
  form.style.display = "none";
  successMessage.classList.remove("hidden");
}

// Mostrar overlay de carregamento
function showLoading() {
  loadingOverlay.classList.remove("hidden");
}

// Esconder overlay de carregamento
function hideLoading() {
  loadingOverlay.classList.add("hidden");
}

// Reset do formulário
newFormBtn.addEventListener("click", () => {
  form.reset();
  form.style.display = "block";
  successMessage.classList.add("hidden");
  page2.style.display = "none";
  page1.style.display = "block";
  window.scrollTo(0, 0);
});

// Preenchimento automático do CEP (pode ser implementado se necessário)
const cepInput = document.getElementById("cep");
if (cepInput) {
  cepInput.addEventListener("blur", () => {
    const cep = cepInput.value.replace(/\D/g, "");
    if (cep.length === 8) {
      fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then((response) => response.json())
        .then((data) => {
          if (!data.erro) {
            document.getElementById("bairro").value = data.bairro;
            document.getElementById("cidade").value = data.localidade;
            document.getElementById("uf").value = data.uf;
            document.getElementById("endereco").value = data.logradouro;
            // Foca no próximo campo após preenchimento automático
            document.getElementById("numero").focus();
          }
        })
        .catch((error) => console.error("Erro ao buscar CEP:", error));
    }
  });
}