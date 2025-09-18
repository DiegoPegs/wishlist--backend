# Estrutura da Clean Architecture

Este projeto foi reestruturado seguindo os princípios da Clean Architecture, organizando o código em camadas bem definidas:

## Estrutura de Pastas

```
src/
├── domain/                    # Camada de Domínio (regras de negócio)
│   ├── entities/             # Entidades do domínio
│   ├── repositories/         # Interfaces dos repositórios
│   └── index.ts
├── application/              # Camada de Aplicação (casos de uso)
│   ├── use-cases/           # Casos de uso da aplicação
│   ├── dtos/                # Data Transfer Objects
│   └── index.ts
├── infrastructure/           # Camada de Infraestrutura (implementações)
│   ├── controllers/         # Controladores HTTP
│   │   └── app/
│   │       ├── app.controller.ts
│   │       └── app.controller.spec.ts
│   └── services/            # Serviços de infraestrutura
│       └── app.service.ts
├── app.module.ts            # Módulo principal da aplicação
└── main.ts                  # Ponto de entrada da aplicação
```

## Princípios da Clean Architecture

### 1. **Domain** (Domínio)
- Contém as regras de negócio puras
- Não depende de nenhuma outra camada
- Inclui entidades e interfaces de repositórios

### 2. **Application** (Aplicação)
- Contém os casos de uso da aplicação
- Depende apenas da camada de domínio
- Inclui DTOs e casos de uso

### 3. **Infrastructure** (Infraestrutura)
- Contém as implementações concretas
- Pode depender das camadas de domínio e aplicação
- Inclui controladores, serviços e implementações de repositórios

## Benefícios

- **Separação de responsabilidades**: Cada camada tem uma responsabilidade específica
- **Testabilidade**: Fácil de testar cada camada isoladamente
- **Manutenibilidade**: Mudanças em uma camada não afetam as outras
- **Flexibilidade**: Fácil trocar implementações de infraestrutura
- **Independência de frameworks**: O domínio não depende de frameworks externos
