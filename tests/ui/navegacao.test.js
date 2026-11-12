import { Builder, By, until } from 'selenium-webdriver'
import chrome from 'selenium-webdriver/chrome.js'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

// Teste de interface: abre o Mediary no Chrome (sem janela) e navega como um usuário.
// O servidor precisa estar rodando antes (npm run build && npm start).
const URL_APP = process.env.URL_APP ?? 'http://localhost:3000'
const ESPERA = 10000

let driver

async function clicarNoBotao(texto) {
  const botao = await driver.findElement(By.xpath(`//nav//button[normalize-space()="${texto}"]`))
  await botao.click()
}

async function textoDoTitulo() {
  const titulo = await driver.wait(until.elementLocated(By.css('main h1')), ESPERA)
  return titulo.getText()
}

describe('navegação no Mediary', () => {
  beforeAll(async () => {
    const opcoes = new chrome.Options()
    opcoes.addArguments('--headless=new', '--no-sandbox', '--disable-dev-shm-usage')

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(opcoes)
      .build()
  }, 60000)

  afterAll(async () => {
    await driver?.quit()
  })

  test('página inicial abre com o título do Mediary', async () => {
    await driver.get(URL_APP)
    await driver.wait(until.titleContains('Mediary'), ESPERA)

    expect(await textoDoTitulo()).toContain('Cuide das suas informações')
  }, 30000)

  test('menu Sobre abre a página sobre o projeto', async () => {
    await clicarNoBotao('Sobre')

    await driver.wait(until.elementTextIs(driver.findElement(By.css('main h1')), 'Conheça o Mediary'), ESPERA)
    expect(await textoDoTitulo()).toBe('Conheça o Mediary')
  }, 30000)

  test('menu Entrar abre a tela de login', async () => {
    await clicarNoBotao('Entrar')

    await driver.wait(until.elementLocated(By.id('login-email')), ESPERA)
    expect(await textoDoTitulo()).toBe('Entre na sua conta')
  }, 30000)
})
