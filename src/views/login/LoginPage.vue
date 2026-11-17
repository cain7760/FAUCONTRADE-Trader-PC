<script setup>
import { ref } from 'vue'
import { User, Lock, View, Hide } from '@element-plus/icons-vue'
import heroImage from '../../assets/login/falcon-trader-head-simplified.png'

const logoImage = import.meta.env.BASE_URL + 'original-icons/logo-faucon-trade.png'
const customerLoginUrl = ['127.0.0.1', 'localhost'].includes(window.location.hostname)
  ? window.location.protocol + '//' + window.location.hostname + ':4177/login.html'
  : 'https://cain7760.github.io/FAUCONTRADE-Customer-PC/'
const username = ref(localStorage.getItem('faucon-trader-remembered-user') || '')
const password = ref('')
const rememberUsername = ref(Boolean(username.value))
const showPassword = ref(false)
const message = ref('')

function submitLogin() {
  if (!username.value.trim() || !password.value) {
    message.value = '请输入用户名和密码。'
    return
  }
  message.value = ''
  if (rememberUsername.value) localStorage.setItem('faucon-trader-remembered-user', username.value.trim())
  else localStorage.removeItem('faucon-trader-remembered-user')
  sessionStorage.setItem('faucon-demo-login-account', username.value.trim())
  window.location.assign(new URL('equity-variants.html?layout=classic', window.location.href))
}

function showResetHelp() {
  message.value = '请联系系统管理员重置密码。'
}
</script>

<template>
  <main class="login-page">
    <div class="login-ambient login-ambient-left" aria-hidden="true"></div>

    <div class="login-panel">
      <div class="login-visual" aria-hidden="true">
        <img class="login-brand-art" :src="heroImage" alt="" width="1254" height="1254" fetchpriority="high" />
      </div>

      <section class="login-access" aria-labelledby="login-title">
        <div class="login-form-content">
          <header class="login-heading">
            <div class="login-brand-row">
              <img class="login-logo" :src="logoImage" alt="FAUCON TRADE" width="132" height="34" />
              <details class="login-terminal-switch">
                <summary aria-label="选择交易终端">交易员终端 <span aria-hidden="true">⌄</span></summary>
                <nav class="login-terminal-menu" aria-label="交易终端">
                  <span class="current-terminal">交易员终端</span>
                  <a :href="customerLoginUrl">客户交易终端</a>
                </nav>
              </details>
            </div>
            <div class="login-heading-title">
              <h1 id="login-title">欢迎登录</h1>
            </div>
            <p class="login-intro">登录猎盈交易端，继续把握每一个交易机会。</p>
          </header>

          <form class="login-form" novalidate @submit.prevent="submitLogin">
            <label for="login-username">用户名</label>
            <div class="login-field">
              <User class="field-icon" aria-hidden="true" />
              <input id="login-username" v-model="username" type="text" name="username" autocomplete="username" maxlength="128" placeholder="请输入用户名" @input="message = ''" />
            </div>

            <label for="login-password">密码</label>
            <div class="login-field">
              <Lock class="field-icon" aria-hidden="true" />
              <input id="login-password" v-model="password" :type="showPassword ? 'text' : 'password'" name="password" autocomplete="current-password" maxlength="256" placeholder="请输入密码" @input="message = ''" />
              <button type="button" class="visibility-button" :aria-label="showPassword ? '隐藏密码' : '显示密码'" :aria-pressed="showPassword" @click="showPassword = !showPassword">
                <Hide v-if="showPassword" aria-hidden="true" />
                <View v-else aria-hidden="true" />
              </button>
            </div>

            <div class="login-options">
              <label class="remember"><input v-model="rememberUsername" type="checkbox" /><span>记住用户名</span></label>
              <button type="button" class="text-button" @click="showResetHelp">忘记密码？</button>
            </div>
            <p v-if="message" class="form-message" role="status">{{ message }}</p>
            <button class="submit-button" type="submit">登录</button>
          </form>
          <p class="login-demo-note">demo环境，随意输入用户名与密码即可登录</p>
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
:global(*) { box-sizing: border-box; }
:global(html), :global(body), :global(#app) { margin: 0; min-height: 100%; font-family: Inter, "PingFang SC", "Microsoft YaHei", sans-serif; }
:global(button), :global(input) { font: inherit; }
:global(button) { cursor: pointer; }
.login-page { --accent: #c49b45; --text: #eef0f2; --muted: #9098a3; position: relative; min-height: 100dvh; display: grid; place-items: center; padding: 40px 32px; background: radial-gradient(circle at 12% 14%, #282720 0%, transparent 36%), linear-gradient(130deg, #111316, #0b0d10 60%); color: var(--text); overflow: hidden; font-size: 14px; }
.login-ambient { position: absolute; pointer-events: none; border-radius: 50%; }
.login-ambient-left { width: 58vw; height: 58vw; left: -25vw; top: -30vw; border: 1px solid rgba(201, 165, 91, .17); box-shadow: 0 0 0 90px rgba(202, 165, 90, .025), 0 0 0 180px rgba(202, 165, 90, .018); transform: rotate(-18deg); }
.login-page::before { content: ""; position: absolute; inset: 0; opacity: .23; background-image: linear-gradient(rgba(190, 166, 111, .14) 1px, transparent 1px), linear-gradient(90deg, rgba(190, 166, 111, .14) 1px, transparent 1px); background-size: 78px 78px; mask-image: linear-gradient(90deg, #000, transparent 40%, transparent 60%, #000); }
.login-panel { position: relative; display: grid; grid-template-columns: minmax(0, 52fr) minmax(0, 38.4fr); width: min(1012px, 100%); aspect-ratio: 1.61803398875 / 1; overflow: hidden; border-radius: 8px; background: #1e2023; box-shadow: 0 24px 72px rgb(0 0 0 / 30%); }
.login-visual { position: relative; min-width: 0; overflow: hidden; background: #0d1114; }
.login-brand-art { display: block; width: 100%; height: 100%; object-fit: cover; object-position: center; }
.login-access { position: relative; display: flex; flex-direction: column; align-items: flex-start; justify-content: center; min-width: 0; padding: 48px 56px; }
.login-terminal-switch { position: relative; z-index: 2; flex: none; color: #c6aa6c; font-size: 11px; }
.login-terminal-switch summary { display: flex; align-items: center; gap: 4px; height: 24px; padding: 0 7px; border: 1px solid #544831; border-radius: 4px; background: rgb(187 152 74 / 12%); list-style: none; cursor: pointer; white-space: nowrap; }
.login-terminal-switch summary::-webkit-details-marker { display: none; }
.login-terminal-switch summary:hover { border-color: #bb984a; color: #d3ad64; }
.login-terminal-switch summary span { font-size: 14px; line-height: 1; }
.login-terminal-menu { position: absolute; top: 30px; right: 0; display: grid; min-width: 116px; padding: 5px; border: 1px solid #3a3e45; border-radius: 4px; background: #24272c; box-shadow: 0 8px 24px rgb(0 0 0 / 35%); }
.login-terminal-menu a, .login-terminal-menu span { padding: 7px 8px; color: #cdd1d7; text-decoration: none; white-space: nowrap; }
.login-terminal-menu .current-terminal { color: #bb984a; }
.login-terminal-menu a:hover { background: #30343a; color: #bb984a; }
.login-form-content { width: 100%; }
.login-heading { margin-bottom: 14px; }
.login-brand-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 28px; }
.login-logo { display: block; width: 132px; height: 34px; object-fit: contain; }
.login-heading-title { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.login-heading h1 { margin: 0; font-size: 26px; line-height: 1.4; font-weight: 600; }
.login-intro { margin: 6px 0 0; color: #9098a3; font-size: 12px; line-height: 18px; }
.login-form { display: flex; flex-direction: column; }
.login-form > label { margin-bottom: 10px; color: #cdd1d7; font-size: 14px; line-height: 20px; }
.login-field { position: relative; display: flex; align-items: center; min-height: 44px; margin-bottom: 28px; border: 1px solid #353a42; border-radius: 4px; background: #24272c; }
.login-field:focus-within { border-color: #b68d3c; box-shadow: 0 0 0 1px #b68d3c; }
.field-icon { flex: none; width: 14px; height: 14px; margin-left: 14px; color: #79818d; }
.login-field input { width: 100%; height: 42px; min-width: 0; padding: 0 12px; border: 0; outline: 0; background: transparent; color: #eef0f2; font-size: 14px; }
.login-field input::placeholder { color: #9098a3; }
.visibility-button { flex: none; display: grid; place-items: center; width: 28px; height: 28px; margin-right: 10px; padding: 0; border: 0; border-radius: 4px; background: transparent; color: #9098a3; }
.visibility-button:hover { color: #eef0f2; }
.visibility-button svg { width: 16px; height: 16px; }
.login-options { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-top: -8px; }
.remember { display: flex; align-items: center; gap: 8px; min-height: 24px; color: #cdd1d7; cursor: pointer; font-size: 12px; }
.remember input { appearance: none; width: 14px; height: 14px; margin: 0; border: 1px solid #4d535b; border-radius: 2px; background: transparent; cursor: pointer; }
.remember input:checked { border-color: #bb984a; background: #bb984a; }
.remember input:checked::after { content: ""; display: block; width: 7px; height: 4px; margin: 3px 0 0 2px; border-left: 2px solid #17191c; border-bottom: 2px solid #17191c; transform: rotate(-45deg); }
.text-button { min-height: 24px; padding: 0; border: 0; background: transparent; color: var(--accent); font-size: 12px; }
.text-button:hover { color: #d3ad64; }
.form-message { margin: 12px 0 0; color: #e3ac74; font-size: 12px; line-height: 18px; }
.submit-button { display: grid; place-items: center; width: 100%; height: 46px; margin-top: 24px; padding: 0 18px; border: 1px solid #d2aa5d; border-radius: 5px; background: linear-gradient(100deg, #b78b3d, #d3ad64); color: #fff; font-size: 14px; font-weight: 650; transition: filter .15s, transform .15s; }
.submit-button:hover { filter: brightness(1.09); transform: translateY(-1px); }
.submit-button:active { transform: translateY(0); }
.login-demo-note { margin: 20px 0 0; color: #9098a3; font-size: 12px; line-height: 1.6; text-align: center; }
button:focus-visible, input:focus-visible, summary:focus-visible, a:focus-visible { outline: 2px solid #d3ad64; outline-offset: 2px; }
@media (max-width: 1000px) {
  .login-panel { aspect-ratio: auto; min-height: 640px; }
  .login-visual { background: #0c0e17; }
  .login-brand-art { position: absolute; top: 50%; height: auto; transform: translateY(-50%); mask-image: linear-gradient(transparent, #000 16%, #000 84%, transparent); }
  .login-access { padding: 40px 32px; }
  .login-logo { width: 116px; }
}
@media (max-width: 740px) {
  .login-page { padding: 24px 20px; }
  .login-panel { width: min(440px, 100%); min-height: 600px; grid-template-columns: minmax(0, 1fr); }
  .login-access { padding: 40px 28px; }
  .login-visual { display: none; }
}
</style>
