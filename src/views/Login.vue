<template>
  <section class="login-page">
    <div class="login-card">
      <!-- Left: illustration panel -->
      <div class="art-panel">
        <img src="/images/cmi.jpg" alt="Consumer & Market Insights (CMI) Portal " class="art-image" />
        <div class="art-overlay"></div>
      </div>

      <!-- Right: form panel -->
      <div class="form-panel">
        <p class="eyebrow">Welcome!</p>
        <h1 class="title">Consumer & Market Insights (CMI) Portal</h1>

        <form class="login-form" @submit.prevent="handleLogin">
          <div class="field">
            <label>User ID</label>
            <div class="input-wrap">
              <i class="bx bx-envelope"></i>
              <input v-model="userid" type="text" placeholder="Enter your User ID" required />
            </div>
          </div>

          <div class="field">
            <label>Password</label>
            <div class="input-wrap">
              <i class="bx bx-lock-alt"></i>
              <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="••••••••"
                required />
              <i class="bx toggle-eye" :class="showPassword ? 'bx-show' : 'bx-hide'"
                @click="showPassword = !showPassword"></i>
            </div>
          </div>
          <button type="submit" class="submit-btn" :disabled="loading">
            <!-- <span>{{ loading ? "Logging in..." : "Log In" }}</span> -->
            Log In
            <i class="bx bx-right-arrow-alt"></i>
          </button>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";
// import { useRouter } from "vue-router";

// import { useLoginStore } from "@/stores/login";
// import { showNotification } from "@/utilities/notification";
// import { firstAccessibleRouteName } from "@/router";

// const router = useRouter();
// const loginStore = useLoginStore();

const userid = ref("");
const password = ref("");
const showPassword = ref(false);
const loading = ref(false);

// no-op while the store-backed implementation below is disabled;
// without it the form's @submit handler is undefined and throws.
const handleLogin = () => {};

// const handleLogin = async () => {
//   loading.value = true;

//   try {
//     const data = await loginStore.login(email.value, password.value);
//     showNotification("success", data.message || "Login Success");
//     router.push({ name: firstAccessibleRouteName(loginStore) || "login" });
//   } catch (error) {
//     const message = error.response?.data?.message || "Invalid email or password";
//     showNotification("error", message);
//   } finally {
//     loading.value = false;
//   }
// };
</script>

<style scoped lang="scss">
.login-page {
  position: relative;
  min-height: 100vh;
  min-height: 100dvh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  /* vertical scroll must stay available when the card is taller than the viewport */
  overflow-x: hidden;
  overflow-y: auto;
  background: #e3f2fd;
  padding: clamp(16px, 4vw, 24px);
  padding-bottom: calc(clamp(16px, 4vw, 24px) + env(safe-area-inset-bottom, 0px));
}

.page-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.35;
  animation: drift 18s ease-in-out infinite;
}

.blob-1 {
  width: 380px;
  height: 380px;
  top: -140px;
  left: -120px;
  background: radial-gradient(circle, #90caf9 0%, transparent 70%);
}

.blob-2 {
  width: 320px;
  height: 320px;
  bottom: -120px;
  right: -100px;
  background: radial-gradient(circle, #2196f3 0%, transparent 70%);
  animation-delay: -6s;
}

@keyframes drift {

  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }

  50% {
    transform: translate(24px, -20px) scale(1.06);
  }
}

.page-gear {
  position: absolute;
  bottom: -60px;
  right: -60px;
  font-size: 260px;
  color: #0d47a1;
  opacity: 0.08;
  animation: spin-slow 40s linear infinite;
}

@keyframes spin-slow {
  to {
    transform: rotate(360deg);
  }
}

.login-card {
  position: relative;
  z-index: 1;
  display: flex;
  /* margin:auto keeps an over-tall card centred without clipping its top */
  margin: auto;
  width: 100%;
  max-width: 860px;
  min-height: 500px;
  border-radius: clamp(16px, 3vw, 22px);
  overflow: hidden;
  background: #fff;
  box-shadow:
    0 30px 70px -20px rgba(13, 71, 161, 0.28),
    0 0 0 1px rgba(13, 71, 161, 0.06);
  animation: card-in 0.65s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes card-in {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ---------- left illustration panel ---------- */
.art-panel {
  position: relative;
  flex: 1 1 46%;
  min-width: 0;
  overflow: hidden;
  background: #0d47a1;
}

.art-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  animation: img-in 0.9s 0.1s cubic-bezier(0.22, 1, 0.36, 1) backwards, img-zoom 18s ease-in-out infinite alternate;
}

@keyframes img-in {
  from {
    opacity: 0;
    transform: scale(1.06);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes img-zoom {
  from {
    transform: scale(1);
  }

  to {
    transform: scale(1.08);
  }
}

.art-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(13, 71, 161, 0.1) 0%, rgba(13, 71, 161, 0.15) 45%, rgba(8, 40, 92, 0.55) 100%),
    linear-gradient(120deg, rgba(33, 150, 243, 0.45) 0%, rgba(33, 150, 243, 0) 60%);
}

/* ---------- right form panel ---------- */
.form-panel {
  flex: 1 1 54%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: clamp(32px, 5vw, 52px) clamp(24px, 5vw, 56px);
}

.eyebrow {
  font-size: 14px;
  font-weight: 600;
  color: #0d47a1;
  margin: 0 0 6px;
  animation: fade-up 0.6s 0.2s backwards;
}

.title {
  font-size: clamp(19px, 4.2vw, 24px);
  line-height: 1.3;
  font-weight: 700;
  color: #0d2f5e;
  letter-spacing: -0.02em;
  margin: 0 0 clamp(20px, 4vw, 30px);
  overflow-wrap: break-word;
  animation: fade-up 0.6s 0.3s backwards;

  span {
    display: block;
    font-weight: 600;
    font-size: 18px;
    color: #4a6c8c;
  }
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  animation: fade-up 0.6s backwards;

  &:nth-of-type(1) {
    animation-delay: 0.4s;
  }

  &:nth-of-type(2) {
    animation-delay: 0.48s;
  }

  label {
    font-size: 13px;
    font-weight: 600;
    color: #1b3a5c;
  }
}

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;

  i {
    position: absolute;
    left: 16px;
    font-size: 17px;
    color: #0d47a1;
    pointer-events: none;
  }

  input {
    width: 100%;
    height: 48px;
    padding: 0 44px;
    border-radius: 12px;
    border: 1px solid #cfe3f7;
    background: #f4f9fe;
    color: #0d2f5e;
    font-size: 14.5px;
    outline: none;
    transition: border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;

    &::placeholder {
      color: #85a2be;
    }

    &:focus {
      border-color: #0d47a1;
      background: #fff;
      box-shadow: 0 0 0 4px rgba(33, 150, 243, 0.18);
    }
  }

  .toggle-eye {
    left: auto;
    right: 16px;
    cursor: pointer;
    pointer-events: auto;
    transition: color 0.2s ease;

    &:hover {
      color: #0d47a1;
    }
  }
}

.form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  animation: fade-up 0.6s 0.56s backwards;
}

.remember {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #3b5b7d;
  cursor: pointer;
  user-select: none;

  input {
    display: none;
  }

  .checkmark {
    width: 16px;
    height: 16px;
    border-radius: 5px;
    border: 1px solid #b8d4ef;
    display: inline-block;
    position: relative;
    transition: all 0.2s ease;
  }

  input:checked+.checkmark {
    background: #0d47a1;
    border-color: #0d47a1;

    &::after {
      content: '';
      position: absolute;
      left: 5px;
      top: 1px;
      width: 4px;
      height: 8px;
      border: solid #fff;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
  }
}

.forgot {
  color: #0d47a1;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;

  &:hover {
    color: #082f6e;
  }
}

.submit-btn {
  position: relative;
  height: 48px;
  margin-top: 4px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #0d47a1, #2196f3);
  background-size: 200% 200%;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-position 0.4s ease;
  box-shadow: 0 12px 26px -8px rgba(13, 71, 161, 0.55);
  animation: fade-up 0.6s 0.64s backwards;

  i {
    font-size: 18px;
    transition: transform 0.25s ease;
  }

  &:hover {
    background-position: 100% 0;
    transform: translateY(-2px);
    box-shadow: 0 16px 30px -8px rgba(33, 150, 243, 0.6);

    i {
      transform: translateX(4px);
    }
  }

  &:active {
    transform: translateY(0);
  }
}

/* ---------- breakpoints ---------- */

/* tablets: keep both panels, give the form more room */
@media (max-width: 900px) and (min-width: 721px) {
  .login-card {
    max-width: 680px;
    min-height: 460px;
  }

  .art-panel {
    flex: 1 1 38%;
  }

  .form-panel {
    flex: 1 1 62%;
  }
}

/* small tablets & phones: stack, art becomes a banner strip */
@media (max-width: 720px) {
  .login-card {
    flex-direction: column;
    max-width: 440px;
    min-height: 0;
  }

  .art-panel {
    flex: 0 0 auto;
    height: clamp(120px, 26vw, 160px);
  }

  .art-image {
    animation: img-in 0.9s 0.1s cubic-bezier(0.22, 1, 0.36, 1) backwards;
  }
}

@media (max-width: 400px) {
  .art-panel {
    height: 110px;
  }

  .input-wrap input {
    font-size: 16px; /* keeps iOS from zooming the page on focus */
  }
}

/* short/landscape phones: drop the banner so the form fits without scrolling */
@media (max-height: 620px) and (orientation: landscape) {
  .login-page {
    align-items: flex-start;
  }

  .art-panel {
    display: none;
  }

  .login-form {
    gap: 14px;
  }
}

@media (prefers-reduced-motion: reduce) {

  .login-card,
  .art-image,
  .eyebrow,
  .title,
  .field,
  .form-row,
  .submit-btn {
    animation: none !important;
  }

  .submit-btn:hover {
    transform: none;
  }
}
</style>
