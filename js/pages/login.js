/**
 * PAGES/LOGIN.JS - PREMIUM LOGIN PAGE
 * ------------------------------------
 * Visual redesign only.
 * Authentication logic tetap menggunakan auth.js.
 */

import { showError } from "../ui.js";
import { login, isAuthenticated } from "../auth.js";
import { navigate } from "../router.js";
import { icon } from "../icons.js";

export function renderLoginPage(container) {
  if (isAuthenticated()) {
    navigate("/dashboard");
    return;
  }

  container.innerHTML = `
    <div class="login-page">
      <div class="login-shell">

        <!-- =========================
             LEFT / VISUAL PANEL
        ========================== -->
        <section class="login-visual" aria-hidden="true">

          <div class="login-orb login-orb--1"></div>
          <div class="login-orb login-orb--2"></div>
          <div class="login-grid"></div>

          <div class="login-visual__top">
            <div class="login-brand">
              <div class="login-brand__mark">
                ${icon("monitor", { size: 25 })}
              </div>

              <div>
                <div class="login-brand__name">Dashboard IT</div>
                <span class="login-brand__sub">IT Platform</span>
              </div>
            </div>

            <div class="login-live">
              <span class="login-live__dot"></span>
              <span class="login-live__label login-live__label--desktop">System Online</span>
              <span class="login-live__label login-live__label--mobile">Live Report</span>
            </div>
          </div>

          <div class="login-visual__content">

            <div class="login-visual__eyebrow">
              ${icon("shield", { size: 14 })}
              SECURE IT MANAGEMENT
            </div>

            <h1>
              Manage your IT.
              <span>Smarter.</span>
            </h1>

            <p class="login-visual__description">
              Satu platform untuk membantu Anda memantau,
              mengelola, dan menjaga operasional IT tetap berjalan
              dengan lebih cepat dan terkontrol.
            </p>

            <div class="login-feature-list">
              <div class="login-feature">
                <div class="login-feature__icon">
                  ${icon("video", { size: 17 })}
                </div>
                <div>
                  <strong>CCTV Management</strong>
                  <span>Kelola data CCTV toko dengan mudah</span>
                </div>
              </div>

              <div class="login-feature">
                <div class="login-feature__icon">
                  ${icon("shield", { size: 17 })}
                </div>
                <div>
                  <strong>Secure Access</strong>
                  <span>Akses sesuai role dan kewenangan</span>
                </div>
              </div>
            </div>

          </div>

          <!-- Decorative dashboard mockup -->
          <div class="login-dashboard">

            <div class="login-dashboard__header">
              <div class="login-dashboard__brand">
                <span class="login-dashboard__brand-dot"></span>
                IT Dashboard
              </div>

              <div class="login-dashboard__dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>

            <div class="login-dashboard__stats">

              <div class="login-stat">
                <span>Total Store</span>
                <strong>248</strong>
                <small>+12 bulan ini</small>
              </div>

              <div class="login-stat">
                <span>CCTV Online</span>
                <strong>96.8%</strong>
                <small>System healthy</small>
              </div>

            </div>

            <div class="login-dashboard__chart">
              <div class="login-chart-title">
                <span>System Activity</span>
                <small>Live</small>
              </div>

              <svg viewBox="0 0 420 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="loginChartFill"
                    x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="rgba(125,211,252,.30)" />
                    <stop offset="100%" stop-color="rgba(125,211,252,0)" />
                  </linearGradient>
                </defs>

                <path
                  d="M0 92
                     C30 82 38 88 62 72
                     S95 65 120 74
                     S150 54 175 61
                     S205 78 228 54
                     S260 43 284 50
                     S315 28 340 42
                     S375 50 395 25
                     S410 24 420 12
                     L420 120 L0 120 Z"
                  fill="url(#loginChartFill)"
                />

                <path
                  d="M0 92
                     C30 82 38 88 62 72
                     S95 65 120 74
                     S150 54 175 61
                     S205 78 228 54
                     S260 43 284 50
                     S315 28 340 42
                     S375 50 395 25
                     S410 24 420 12"
                  fill="none"
                  stroke="rgba(186,230,253,.95)"
                  stroke-width="3"
                  stroke-linecap="round"
                />
              </svg>
            </div>

            <div class="login-dashboard__footer">
              <span>
                <i></i> Network
              </span>

              <span>
                <i></i> CCTV
              </span>

              <span>
                <i></i> Server
              </span>
            </div>

          </div>

        </section>


        <!-- =========================
             RIGHT / LOGIN FORM
        ========================== -->
        <section class="login-card">

          <div class="login-card__mobile-brand">
            <div class="login-card__mobile-icon">
              ${icon("monitor", { size: 21 })}
            </div>

            <span>Dashboard IT</span>
          </div>

          <div class="login-card__header">

            <div class="login-card__badge">
              ${icon("lock", { size: 23 })}
            </div>

            <span class="login-card__brand">
              Secure Sign In
            </span>

          </div>

          <div class="login-card__banner" id="loginBanner"></div>

          <div class="login-heading-wrap">
            <h2 class="login-card__heading">
              Selamat Datang
            </h2>

            <p class="login-card__subtitle">
              Masuk menggunakan akun IT Anda untuk
              melanjutkan ke Dashboard IT.
            </p>
          </div>


          <form id="loginForm" novalidate>

            <!-- NIK -->
            <div class="form-group">

              <label for="nikInput" class="login-field-label">
                NIK
              </label>

              <div class="input-wrapper input-wrapper--icon">

                <span class="input-icon">
                  ${icon("user", { size: 18 })}
                </span>

                <input
                  type="text"
                  id="nikInput"
                  name="nik"
                  class="input input--icon"
                  placeholder="Masukkan NIK Anda"
                  autocomplete="username"
                  inputmode="numeric"
                />

              </div>

              <span
                class="form-error-text"
                id="nikError">
              </span>

            </div>


            <!-- PASSWORD -->
            <div class="form-group">

              <label for="passwordInput" class="login-field-label">
                Password
              </label>

              <div class="input-wrapper input-wrapper--icon">

                <span class="input-icon">
                  ${icon("lock", { size: 18 })}
                </span>

                <input
                  type="password"
                  id="passwordInput"
                  name="password"
                  class="input input--icon"
                  placeholder="Masukkan password"
                  autocomplete="current-password"
                />

                <button
                  type="button"
                  class="password-toggle-btn"
                  id="togglePasswordBtn"
                  aria-label="Tampilkan password">
                  ${icon("eye-off", { size: 16 })}
                </button>

              </div>

              <span
                class="form-error-text"
                id="passwordError">
              </span>

            </div>


            <!-- SUBMIT -->
            <button
              type="submit"
              class="btn btn-primary btn-pill login-submit-btn"
              id="loginSubmitBtn">

              <span>Masuk ke Dashboard</span>

              ${icon("arrow-right", { size: 18 })}

            </button>

          </form>


          <div class="login-card__footer">

            <span class="login-security">
              ${icon("shield", { size: 14 })}
              Secure connection
            </span>

            <span class="login-version">
              IT Platform
            </span>

          </div>

        </section>

      </div>
    </div>
  `;

  bindLoginForm(container);
}


function bindLoginForm(container) {

  const form = container.querySelector("#loginForm");
  const nikInput = container.querySelector("#nikInput");
  const passwordInput = container.querySelector("#passwordInput");
  const toggleBtn = container.querySelector("#togglePasswordBtn");
  const submitBtn = container.querySelector("#loginSubmitBtn");
  const banner = container.querySelector("#loginBanner");


  toggleBtn.addEventListener("click", () => {

    const isHidden = passwordInput.type === "password";

    passwordInput.type = isHidden
      ? "text"
      : "password";

    // Icon mata: disilang saat password disembunyikan,
    // mata normal saat password sedang ditampilkan.
    toggleBtn.innerHTML = icon(
      isHidden ? "eye" : "eye-off",
      { size: 16 }
    );

    toggleBtn.setAttribute(
      "aria-label",
      isHidden
        ? "Sembunyikan password"
        : "Tampilkan password"
    );

  });


  form.addEventListener("submit", async (event) => {

    event.preventDefault();

    // Cegah submit ganda (mis. Enter ditekan berulang saat request
    // masih berjalan) karena kolom input tetap bisa diklik.
    if (submitBtn.disabled) {
      return;
    }

    const nik = nikInput.value.trim();
    const password = passwordInput.value;

    hideBanner(banner);

    if (!validateLoginForm(
      container,
      nik,
      password
    )) {
      return;
    }

    document.activeElement?.blur();
    container.querySelector(".login-page")?.classList.add("is-loading");
    submitBtn.disabled = true;

    const originalContent =
      submitBtn.innerHTML;

    submitBtn.innerHTML = `
      <span class="btn-spinner"></span>
      Memverifikasi...
    `;


    try {

      const result = await login(
        nik,
        password
      );

      if (result.success) {

        navigate("/dashboard");

      } else {

        showBanner(
          banner,
          result.message ||
          "NIK atau password tidak valid."
        );

        showError(
          result.message ||
          "Login gagal."
        );

      }

    } catch (error) {

      showBanner(
        banner,
        "Tidak dapat menghubungi server. Silakan coba lagi."
      );

      showError(
        "Login gagal. Tidak dapat menghubungi server."
      );

    } finally {

      container.querySelector(".login-page")?.classList.remove("is-loading");
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalContent;

    }

  });

}


function showBanner(banner, message) {

  banner.textContent = message;
  banner.classList.add("is-visible");

}


function hideBanner(banner) {

  banner.textContent = "";
  banner.classList.remove("is-visible");

}


function validateLoginForm(
  container,
  nik,
  password
) {

  const nikError =
    container.querySelector("#nikError");

  const passwordError =
    container.querySelector("#passwordError");

  let isValid = true;


  if (!nik) {

    nikError.textContent =
      "NIK wajib diisi.";

    isValid = false;

  } else {

    nikError.textContent = "";

  }


  if (!password) {

    passwordError.textContent =
      "Password wajib diisi.";

    isValid = false;

  } else {

    passwordError.textContent = "";

  }


  return isValid;
}