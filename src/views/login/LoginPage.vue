<script setup>
import { ref } from 'vue'
import { User, Lock, View, Hide } from '@element-plus/icons-vue'
import logoCityComposite from '../../assets/login/logo-city-composite-dim.png'

const logoImage = import.meta.env.BASE_URL + 'original-icons/logo-faucon-trade.png'
const customerLoginUrl = ['127.0.0.1', 'localhost'].includes(window.location.hostname)
  ? window.location.protocol + '//' + window.location.hostname + ':4177/login.html'
  : 'https://cain7760.github.io/FAUCONTRADE-Customer-PC/login.html'
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
        <div class="login-brand-scene">
          <img class="login-brand-art" :src="logoCityComposite" alt="" width="1122" height="1402" fetchpriority="high" />
          <div class="login-falcon">
            <div class="login-falcon-motion">
              <img class="login-brand-art" :src="logoCityComposite" alt="" width="1122" height="1402" />
              <div class="login-brand-shimmer">
                <img class="login-brand-art" :src="logoCityComposite" alt="" width="1122" height="1402" />
              </div>
              <div class="login-falcon-eye"></div>
            </div>
          </div>
          <div class="login-brand-stars"></div>
          <div class="login-brand-water">
            <img class="login-brand-art" :src="logoCityComposite" alt="" width="1122" height="1402" />
          </div>
        </div>
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
.login-visual {
  position: relative;
  isolation: isolate;
  min-width: 0;
  overflow: hidden;
  background: #1c232d;
}
.login-visual::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to right, transparent 73%, rgb(0 0 0 / 30%)),
    linear-gradient(180deg, rgb(42 42 42 / 32%), rgb(42 42 42 / 14%) 55%, transparent) top / 100% 36% no-repeat;
  pointer-events: none;
}
.login-brand-scene {
  position: absolute;
  inset: 50% 0 auto;
  translate: 0 -50%;
}
.login-brand-art {
  display: block;
  width: 100%;
  height: auto;
  filter: contrast(.88) brightness(1.06);
}
.login-brand-stars {
  position: absolute;
  inset: 0;
  --star: rgb(198 215 232 / 35%);
  --star-faint: rgb(198 215 232 / 22%);
  background:
    radial-gradient(circle at 9% 72%, var(--star-faint) .5px, transparent 1.3px),
    radial-gradient(circle at 17% 75%, var(--star) .65px, transparent 1.35px),
    radial-gradient(circle at 29% 73%, var(--star-faint) .4px, transparent 1.15px),
    radial-gradient(circle at 36% 76%, var(--star-faint) .45px, transparent 1.1px),
    radial-gradient(circle at 48% 73%, var(--star) .6px, transparent 1.35px),
    radial-gradient(circle at 60% 74%, var(--star-faint) .55px, transparent 1.25px),
    radial-gradient(circle at 68% 71%, var(--star-faint) .45px, transparent 1.15px),
    radial-gradient(circle at 83% 71%, var(--star) .65px, transparent 1.4px),
    radial-gradient(circle at 89% 75%, var(--star-faint) .5px, transparent 1.2px);
}
.login-brand-water {
  /* The mirrored image and its clip share the source image's waterline. */
  --waterline: 87.8%;
  position: absolute;
  inset: var(--waterline) 0 0;
  overflow: hidden;
  mix-blend-mode: screen;
  mask-image: linear-gradient(#000, rgb(0 0 0 / 64%) 54%, transparent);
}
.login-brand-water .login-brand-art {
  position: absolute;
  bottom: 0;
  transform: scaleY(-.58);
  transform-origin: center var(--waterline);
  filter: contrast(1.16) blur(.85px);
  opacity: .76;
}
.login-brand-water::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    repeating-linear-gradient(transparent 0 2px, rgb(9 15 23 / 16%) 3px 4px),
    linear-gradient(rgb(193 159 101 / 9%), rgb(105 134 170 / 7%) 54%, transparent);
}
.login-falcon {
  --falcon-offset: -36px;
  position: absolute;
  inset: 0;
  pointer-events: none;
  /* Feather the overlay into the original sky and leave the skyline fixed. */
  mask-image:
    linear-gradient(to right, transparent, #000 8% 84%, transparent 96%),
    linear-gradient(transparent 9%, #000 17% 70.6%, transparent 73%);
  mask-composite: intersect;
  background: linear-gradient(to right, #20242b, #25272c 48%, #1c2028);
}
.login-falcon-motion {
  position: absolute;
  inset: 0;
  translate: 0 var(--falcon-offset);
}
.login-falcon-motion > .login-brand-art {
  mask-image: linear-gradient(#000 70.4%, transparent 71.8%);
}
.login-brand-shimmer { display: none; }
@media (prefers-reduced-motion: no-preference) {
  .login-falcon-motion { animation: login-falcon-lift 2.4s linear infinite alternate; }
  .login-brand-shimmer {
    position: absolute;
    inset: 0;
    display: block;
    pointer-events: none;
    mix-blend-mode: lighten;
    opacity: 0;
    /* Constrain the moving highlight to the falcon, above the skyline. */
    mask-image:
      linear-gradient(110deg, transparent 40%, #000 48% 52%, transparent 60%),
      radial-gradient(ellipse 42% 25% at 47% 48%, #000 74%, transparent);
    mask-size: 260% 100%, 100% 100%;
    mask-position: 100% 0, center;
    mask-repeat: no-repeat;
    mask-composite: intersect;
    animation: login-brand-shimmer 5.5s linear .15s infinite;
  }
  .login-brand-shimmer .login-brand-art { filter: contrast(1.43) brightness(1.47) saturate(1.08); }
  .login-falcon-eye {
    position: absolute;
    /* Follow the eye opening in the source artwork. */
    top: 35.65%;
    left: 58.6%;
    width: 10.7%;
    height: 5.5%;
    clip-path: polygon(2% 28%, 10% 14%, 26% 5%, 43% 6%, 60% 12%, 79% 23%, 99% 32%, 91% 50%, 78% 67%, 60% 86%, 43% 94%, 27% 95%, 14% 84%, 5% 67%);
  }
  .login-falcon-eye::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 0 0 55% 53%;
    background: linear-gradient(154deg, #10151c 21%, #25282a 73%, #796f5d);
    transform-origin: center top;
    animation: login-falcon-blink 5s linear infinite;
  }
}
@keyframes login-falcon-lift {
  from { transform: translateY(0); }
  to { transform: translateY(-1.65%); }
}
@keyframes login-falcon-blink {
  0%, 32.4%, 38.4%, 100% { transform: scaleY(0); opacity: 0; }
  34.08%, 35.16% { transform: scaleY(1); opacity: 1; }
}
@keyframes login-brand-shimmer {
  from { mask-position: 100% 0, center; opacity: 0; }
  5%, 46% { opacity: .95; }
  54%, to { mask-position: 0 0, center; opacity: 0; }
}
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
  .login-brand-scene {
    mask-image: linear-gradient(transparent, #000 12%, #000 94%, transparent);
  }
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
