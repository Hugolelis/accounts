// módulos externos
const inquirer = require('inquirer')
const chalk = require('chalk')

// módulos internos
const fs = require('fs')

operation()

function operation() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'O que você deseja fazer?',
            choices: [
                'Criar conta',
                'Consultar saldo',
                'Depositar',
                'Sacar',
                'Sair'
            ]
        }
    ])
    .then(resp => {
        const action = resp['action']

        if(action === 'Criar conta') createAccount()
        else if (action === 'Consultar saldo') checkAmount()
        else if (action === 'Depositar') deposit()
        else if (action === 'Sacar') checkWithdraw()
        else {
            console.log(chalk.bgBlue.black('Obrigado por usar o Accounts!'))
            process.exit()
        }
    })
    .catch(e => console.log(e))
}

// create account
function createAccount() {
    console.log(chalk.bgGreen.black('Párabens por escolher o nosso banco!'))
    console.log(chalk.green('Defina as opçoes de conta!'))

    buildAccount()
}

function buildAccount() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Digite um nome para sua conta:'
        }
    ]).then(resp => {
        const accountName = resp['accountName']

        console.log(chalk.bgBlue.black(`Sua conta possui o nome de ${accountName}`))

        if(!fs.existsSync('accounts')) {
            fs.mkdirSync('accounts')
        }

        if(fs.existsSync(`accounts/${accountName}.json`)) {
            console.log(chalk.bgRed('Erro: Esta conta ja existe, escolha outro nome!'))
            return buildAccount()
        } 

        fs.writeFileSync(`accounts/${accountName}.json`, '{"balance": 0}', (e) => {
            console.log(e)
        })
    
        console.log(chalk.green('Parabéns, sua conta foi criada!'))
        operation()
        
    }).catch(e => console.log(e))
}

// add an amount to user account
function deposit() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da sua conta?'
        }
    ]).then(resp => {
        const accountName = resp['accountName']

        if(!checkAccount(accountName)) {
            return deposit()
        }

        inquirer.prompt([
            {
                name: 'amount',
                message: 'Quanto você deseja depósitar?'
            }
        ]).then(resp => {
            const amount = resp['amount']

            addAmount(accountName, amount)

        }).catch(e => console.log(e))

    }).catch(e => console.log(e))
}

function addAmount(accountName, amount) {
    const accountData = getAccount(accountName)

    if(!amount) {
        console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!'))
        return deposit()
    }

    accountData.balance = parseFloat(amount) + parseFloat(accountData.balance)

    fs.writeFileSync(`accounts/${accountName}.json`, JSON.stringify(accountData), (e) => console.log(e))

    console.log(chalk.green(`Foi depositado o valor de R$${amount} na sua conta!`))

    operation()
}

// view amount
function checkAmount() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'De qual conta deseja consultar o saldo?'
        }
    ]).then(resp => {
        const accountName = resp['accountName']

        if(!checkAccount(accountName)) {
            return checkAmount()
        }

        const amount = getAccount(accountName).balance

        console.log(chalk.bgBlue.black(`A conta possui um valor de R$${amount}!`))
        operation()

    }).catch(e => console.log(e))
}

// withdraw ammount
function checkWithdraw() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'De qual conta você deseja sacar? '
        }
    ]).then(resp => {
        const accountName = resp['accountName']

        if(!checkAccount(accountName)) {
            return checkWithdraw()
        }

        withdraw(accountName)

    }).catch(e => console.log(e))
}

function withdraw(accountName) {
    inquirer.prompt([
        {
            name: 'withdraw',
            message: 'Qual valor deseja sacar?'
        }
    ]).then(resp => {
        const withdraw = resp['withdraw']
        const accountData = getAccount(accountName)

        if(withdraw > accountData.balance || !withdraw) {
            console.log(chalk.bgRed.black('Não é possivel sacar esse valor, tente novamente!'))
            return checkWithdraw()
        }

        accountData.balance = parseFloat(accountData.balance) - parseFloat(withdraw)

        fs.writeFileSync(`accounts/${accountName}.json`, JSON.stringify(accountData), (e) => {
            console.log(e)
        })

        console.log(chalk.green(`Você sacou um valor de R$${withdraw} e possui na sua conta atualmente R$${accountData.balance}!`))

        operation()

    }).catch(e => console.log(e))
}

// helpers

// check acount exist
function checkAccount(accountName) {
    if(!fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(chalk.bgRed.black('Essa conta não existe, tente novamente!'))
        return false
    }

    return true
}

// get account
function getAccount(accountName) { 
    const accoutJson = fs.readFileSync(`accounts/${accountName}.json`, {encoding: 'utf-8', flag: 'r'})

    return JSON.parse(accoutJson)
}
