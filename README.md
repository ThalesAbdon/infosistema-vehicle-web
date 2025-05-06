# VehicleApp

Este repositório contém o frontend para o projeto de avaliação técnica, com foco em backend utilizando Node.js (preferencialmente com NestJS), testes automatizados com Jest e containerização com Docker. O objetivo principal é implementar a tela de listagem de veículos, consumindo dados do backend via recursos RESTful.

Para rodar o backend desse projeto, acesse: [Backend-vehicle](https://github.com/ThalesAbdon/infosistema-vehicle-api)

Esse projeto usa: [Angular CLI](https://github.com/angular/angular-cli) version 19.2.10.

## Instalação e Execução
 
### 1. Clonar o Repositório

Clone o repositório do GitHub para sua máquina local:

```bash
git clone https://github.com/ThalesAbdon/infosistema-vehicle-web
```

### 2. Instalar Dependências
Acesse a pasta root
```
cd vehicles-app
```
Execute o comando:
```
npm install
```
### 3. Execute o script do Docker
```
sudo docker compose up
```

## Features

As principais funncionalidades são:
- Listagem com filtros
- Adição de novo veículo
- Edição de veículo
- Remoção de um veículo
