export function valida(input) {
    const tipoDeInput = input.dataset.tipo

    if(validadores[tipoDeInput]) {
        validadores[tipoDeInput](input)
    }

    if(input.validity.valid)  {
        input.parentElement.classList.remove('input-container--invalido')
        input.parentElement.querySelector('.input-mensagem-erro').innerHTML = ''
    } else {
        input.parentElement.classList.add('input-container--invalido')
        input.parentElement.querySelector('.input-mensagem-erro').innerHTML = mostraMensagemDeErro(tipoDeInput, input)
    }
}

const validadores = {
    dataNascimento: input => validaDataNascimento(input),
    cpf: input => validaCPF(input),
    cep: input => recuperarCEP(input)
}

const mostraMensagemDeErro = (tipoDeInput, input) => {
    let mensagem = ''

    tiposDeErro.forEach(erro => {
        if(input.validity[erro]) {
            mensagem = mensagensDeErro[tipoDeInput][erro]
        }
    })

    return mensagem
}

const tiposDeErro = [
    'customError',
    'valueMissing',
    'typeMismatch',
    'patternMismatch'
]

const mensagensDeErro = {
    nome: {
        valueMissing: 'O campo nome não pode estar vazio.'
    },
    email: {
        valueMissing: 'O campo email não pode estar vazio.',
        typeMismatch: 'O email digitado não é válido.'
    },
    senha: {
        valueMissing: 'O campo de senha não pode estar vazio',
        patternMismatch: 'A senha deve conter entre 6 a 12 caracteres, deve conter pelo menos uma letra maiúscula, um número e ao mínimo um caracter especial'
    },
    dataNascimento: {
        valueMissing: 'O campo de data de nascimento não pode estar vazio',
        customError: 'Você deve ser maior que 18 anos para cadastrar'
    },
    cpf: {
        valueMissing: 'O campo de CPF não pode estar vazio',
        customError: 'O CPF não é valido'
    },
    cep: {
        valueMissing: 'O campo de CEP não pode estar vazio.',
        patternMismatch: 'O CEP digitado não é valido',
        customError: 'Não foi possivel buscar CEP'
    },
    logradouro: {
        valueMissing: 'O campo de logradouro não pode estar vazio.'
    },
    cidade: {
        valueMissing: 'O campo de cidade não pode estar vazio.'
    },
    estado: {
        valueMissing: 'O campo de estado não pode estar vazio.'
    },
    preco: {
        valueMissing: 'O campo de preço não pode estar vazio'
    }
}

const validaDataNascimento = input => {
    const dataRecebida = new Date(input.value)
    let mensagem = ''
    maiorQue18(dataRecebida)

    if(!maiorQue18(dataRecebida)) {
        mensagem = 'Você deve ser maior que 18 anos para se cadastrar.'
    }
    input.setCustomValidity(mensagem)
}

const maiorQue18 = data => {
    const dataAtual = new Date()
    const dataMais18 = new Date(data.getUTCFullYear() + 18, data.getUTCMonth(), data.getUTCDate())
    return dataMais18 <= dataAtual
}

const validaCPF = input => {
    const cpfFormatado = input.value.replace(/\D/g, '')
    let mensagem = ''
    
    if(!checaCPFRepedito(cpfFormatado) || !checaEstruturaCPF(cpfFormatado))  {
        mensagem = 'O CPF digitado não é valido.'
    }

    input.setCustomValidity(mensagem)
}

const checaCPFRepedito = cpf => {
    const valoresRepetidos = [
        '00000000000',
        '11111111111',
        '22222222222',
        '33333333333',
        '44444444444',
        '55555555555',
        '66666666666',
        '77777777777',
        '88888888888',
        '99999999999'
    ]

    let cpfValido = true

    valoresRepetidos.forEach(valor => {
        if(valor == cpf) {
            cpfValido = false
        }
    })

    return cpfValido
}

const checaEstruturaCPF = cpf => {
    const multiplicador = 10

    return checaDigitoVerificador(cpf, multiplicador)
}

const checaDigitoVerificador = (cpf, multiplicador) => {
    if(multiplicador >= 12) {
        return true
    }
    
    let multiplicadorInicial = multiplicador
    let soma = 0

    const cpfSemDigitos = cpf.substr(0, multiplicador - 1).split('')
    const digitoVerificador = cpf.charAt(multiplicador - 1)

    for(let contador = 0; multiplicadorInicial > 1; multiplicadorInicial--) {
        soma = soma + cpfSemDigitos[contador] * multiplicadorInicial
        contador++
    }

    if(digitoVerificador == confirmaDigito(soma)) {
        return checaDigitoVerificador(cpf, multiplicador + 1)
    }

    return false
}

const confirmaDigito = soma => {
    return 11 - (soma % 11)
}

const recuperarCEP = input => {
     const cep = input.value.replace(/\D/g, '')
     const url = `https://viacep.com.br/ws/${cep}/json`
     const options = {
         method: 'GET',
         mode: 'cors',
         headers: {
            'content-type': 'application/json;charset=utf-8'
         }
     }

    if(!input.validity.patternMismatch && !input.validity.valueMissing) {
        fetch(url, options)
            .then(response => response.json())
            .then(data => {
                if(data.erro) {
                    input.setCustomValidity('Não foi possivel buscar CEP')
                    return
                }
                input.setCustomValidity('')
                preencheCamposComCEP(data)
                return
            })
    }
}

const preencheCamposComCEP = data => {
    const logradouro = document.querySelector('[data-tipo="logradouro"]')
    const estado = document.querySelector('[data-tipo="estado"]')
    const cidade = document.querySelector('[data-tipo="cidade"]')

    logradouro.value = data.logradouro
    cidade.value = data.localidade
    estado.value = data.uf
}