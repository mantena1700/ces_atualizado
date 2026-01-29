# 📥 Importação de Dados

Módulo de importação em massa de dados via JSON.

---

## 📋 Visão Geral

Este módulo permite importar dados de funcionários, cargos e estruturas de forma massiva através de arquivos JSON estruturados.

---

## ⚙️ Funcionalidades

- 📄 Upload de arquivo JSON
- ✅ Validação de estrutura
- 📊 Preview dos dados antes de importar
- 🔄 Importação atômica (tudo ou nada)
- 📋 Log de erros detalhado

---

## 📐 Estrutura do JSON

### Funcionários
```json
{
  "employees": [
    {
      "name": "João Silva",
      "email": "joao.silva@empresa.com",
      "cpf": "123.456.789-00",
      "birthDate": "1990-05-15",
      "phone": "(11) 99999-9999",
      "admissionDate": "2020-03-01",
      "hiringType": "CLT",
      "salary": 5000,
      "jobRole": "Analista de Sistemas",
      "department": "Tecnologia",
      "benefits": ["VR", "Plano de Saúde"],
      "address": {
        "zipCode": "01310-100",
        "street": "Av. Paulista",
        "number": "1000",
        "neighborhood": "Bela Vista",
        "city": "São Paulo",
        "state": "SP"
      }
    }
  ]
}
```

### Cargos
```json
{
  "jobRoles": [
    {
      "title": "Analista de Sistemas",
      "department": "Tecnologia",
      "area": "Desenvolvimento",
      "cbo": "2124-05",
      "description": {
        "summary": "Responsável pelo desenvolvimento...",
        "education": "Superior em TI",
        "experience": "3 anos"
      }
    }
  ]
}
```

---

## 📁 Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `/app/importar/page.tsx` | Página de importação |
| `/app/actions/import-actions.ts` | Server Actions de importação |

---

## ⚠️ Validações

- ✅ CPF válido (se informado)
- ✅ Email único
- ✅ Data no formato ISO
- ✅ Cargo existente ou criação automática
- ✅ Tipo de contratação (CLT/PJ)

---

## 🔄 Última Atualização

**2026-01-29** - Documentação do módulo
