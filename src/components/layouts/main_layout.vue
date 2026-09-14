<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  HomeOutlined,
  TeamOutlined,
  FileTextOutlined,
  SettingOutlined,
  BellOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CloseOutlined,
  DownOutlined,
  UserOutlined,
} from "@ant-design/icons-vue";

import AciLogo from "@/components/common/AciLogo.vue";
import { useLoginStore } from "@/stores/login";

defineProps({
  title: { type: String, default: "Dashboard" },
  subtitle: { type: String, default: "" },
});

const router = useRouter();
const route = useRoute();
const loginStore = useLoginStore();

/* Below this width the sider turns into an off-canvas drawer. */
const MOBILE_QUERY = "(max-width: 1023.98px)";

const isMobile = ref(false);
const collapsed = ref(false); // desktop: icon-rail mode
const drawerOpen = ref(false); // mobile: off-canvas drawer
/* menu key -> route name */
const MENU_ROUTES = {
  dashboard: "home",
  "control-panel": "control-panel",
};

/* routes reached from a menu item keep that item selected */
const MENU_CHILD_ROUTES = {
  dashboard: ["business-detail", "edit-report", "upload-new"],
};

const selectedKeys = ref(["dashboard"]);

const initials = computed(() => (loginStore.userId || "U").slice(0, 2).toUpperCase());

/* Labels are always visible inside the mobile drawer. */
const railMode = computed(() => !isMobile.value && collapsed.value);

let mediaQuery = null;

const applyViewport = (event) => {
  isMobile.value = event.matches;
  if (event.matches) {
    collapsed.value = false;
  } else {
    drawerOpen.value = false;
  }
};

const handleEscape = (event) => {
  if (event.key === "Escape" && drawerOpen.value) drawerOpen.value = false;
};

onMounted(() => {
  mediaQuery = window.matchMedia(MOBILE_QUERY);
  applyViewport(mediaQuery);
  mediaQuery.addEventListener("change", applyViewport);
  window.addEventListener("keydown", handleEscape);
});

onBeforeUnmount(() => {
  mediaQuery?.removeEventListener("change", applyViewport);
  window.removeEventListener("keydown", handleEscape);
  document.body.classList.remove("nav-drawer-open");
});

/* Lock background scrolling while the drawer covers the page. */
watch(drawerOpen, (open) => {
  document.body.classList.toggle("nav-drawer-open", open);
});

watch(() => route.fullPath, () => {
  drawerOpen.value = false;
});

/* highlight the item matching the active route (also on reload / back button) */
watch(
  () => route.name,
  (name) => {
    const key = Object.keys(MENU_ROUTES).find(
      (k) => name === MENU_ROUTES[k] || MENU_CHILD_ROUTES[k]?.includes(name)
    );
    if (key) selectedKeys.value = [key];
  },
  { immediate: true }
);

const toggleNav = () => {
  if (isMobile.value) drawerOpen.value = !drawerOpen.value;
  else collapsed.value = !collapsed.value;
};

const handleMenuClick = ({ key }) => {
  const target = MENU_ROUTES[key];
  if (target && target !== route.name) {
    router.push({ name: target });
  }
  if (isMobile.value) drawerOpen.value = false;
};

const handleLogout = () => {
  loginStore.logout();
  router.push({ name: "login" });
};
</script>

<template>
  <a-layout class="main-layout">
    <!-- backdrop for the mobile drawer -->
    <div
      v-if="isMobile"
      class="nav-backdrop"
      :class="{ 'is-visible': drawerOpen }"
      @click="drawerOpen = false"
    ></div>

    <a-layout-sider
      v-model:collapsed="collapsed"
      :trigger="null"
      collapsible
      theme="dark"
      width="256"
      :collapsed-width="80"
      class="app-sider"
      :class="{ 'is-drawer': isMobile, 'is-open': drawerOpen }"
    >
      <div class="sider-inner">
        <div class="brand-block">
          <AciLogo :size="36" />
          <transition name="fade-slide">
            <div v-if="!railMode" class="brand-text">
              <p class="brand-title">CMI Portal</p>
            </div>
          </transition>

          <button
            v-if="isMobile"
            type="button"
            class="drawer-close"
            aria-label="Close navigation"
            @click="drawerOpen = false"
          >
            <CloseOutlined />
          </button>
        </div>

        <p class="menu-label" :class="{ 'is-hidden': railMode }">Main</p>

        <a-menu
          v-model:selectedKeys="selectedKeys"
          theme="dark"
          mode="inline"
          class="app-menu"
          @click="handleMenuClick"
        >
          <a-menu-item key="dashboard">
            <template #icon><HomeOutlined /></template>
            Dashboard
          </a-menu-item>
          <a-menu-item key="control-panel">
            <template #icon><SettingOutlined /></template>
            Control Panel
          </a-menu-item>
          <!-- <a-menu-item key="consumer-insights" disabled>
            <template #icon><TeamOutlined /></template>
            Consumer Insights
          </a-menu-item>
          <a-menu-item key="reports" disabled>
            <template #icon><FileTextOutlined /></template>
            Reports
          </a-menu-item>
          <a-menu-item key="settings" disabled>
            <template #icon><SettingOutlined /></template>
            Settings
          </a-menu-item> -->
        </a-menu>
      </div>
    </a-layout-sider>

    <a-layout class="content-shell">
      <a-layout-header class="app-header">
        <div class="header-left">
          <button
            type="button"
            class="icon-btn"
            :aria-label="isMobile ? 'Toggle navigation' : 'Collapse sidebar'"
            :aria-expanded="isMobile ? drawerOpen : !collapsed"
            @click="toggleNav"
          >
            <component :is="(isMobile ? drawerOpen : !collapsed) ? MenuFoldOutlined : MenuUnfoldOutlined" />
          </button>
          <div class="header-titles">
            <h1 class="header-title">{{ title }}</h1>
            <p v-if="subtitle" class="header-sub">{{ subtitle }}</p>
          </div>
        </div>

        <div class="header-right">
          <span class="header-divider"></span>

          <a-dropdown placement="bottomRight" :trigger="['click']">
            <div class="user-chip">
              <a-avatar :size="34" class="user-avatar">{{ initials }}</a-avatar>
              <span class="user-name">{{ loginStore.userId || "User" }}</span>
              <DownOutlined class="user-caret" />
            </div>
            <template #overlay>
              <a-menu class="user-menu" @click="handleLogout">
                <a-menu-item key="profile" disabled>
                  <UserOutlined class="mr-2" />Profile
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="logout" danger>
                  <LogoutOutlined class="mr-2" />Logout
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </a-layout-header>

      <a-layout-content class="app-content">
        <div class="content-inner">
          <slot></slot>
        </div>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<style scoped lang="scss">
$brand-900: #0d47a1;
$brand-500: #2196f3;
$brand-200: #90caf9;
$brand-50: #e3f2fd;

.main-layout {
  min-height: 100vh;
  min-height: 100dvh;
  background: #f4f8fe;
}

/* ---------- sider ---------- */
.app-sider {
  position: relative;
  background: $brand-900;
  box-shadow: 4px 0 24px -14px rgba(13, 71, 161, 0.55);
  transition: all 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}

/* off-canvas drawer below the lg breakpoint */
.app-sider.is-drawer {
  position: fixed;
  inset-block: 0;
  inset-inline-start: 0;
  z-index: 60;
  width: min(280px, 84vw) !important;
  max-width: min(280px, 84vw) !important;
  min-width: min(280px, 84vw) !important;
  flex: 0 0 auto !important;
  transform: translateX(-100%);
  box-shadow: none;
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s ease;

  &.is-open {
    transform: translateX(0);
    box-shadow: 18px 0 50px -22px rgba(8, 40, 92, 0.75);
  }
}

.nav-backdrop {
  position: fixed;
  inset: 0;
  z-index: 55;
  background: rgba(8, 40, 92, 0.45);
  backdrop-filter: blur(2px);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.28s ease, visibility 0.28s ease;

  &.is-visible {
    opacity: 1;
    visibility: visible;
  }
}

.sider-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
}

.brand-block {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  height: 68px;
  padding: 0 18px;
  border-bottom: 1px solid rgba(144, 202, 249, 0.18);
  overflow: hidden;
}

.brand-text {
  min-width: 0;
  line-height: 1.25;
}

.brand-title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.01em;
  white-space: nowrap;
}

.brand-sub {
  margin: 0;
  font-size: 11px;
  color: rgba(227, 242, 253, 0.62);
  white-space: nowrap;
}

.drawer-close {
  margin-inline-start: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border: none;
  border-radius: 10px;
  background: rgba(144, 202, 249, 0.14);
  color: #e3f2fd;
  font-size: 15px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(144, 202, 249, 0.26);
  }
}

.menu-label {
  margin: 20px 0 8px;
  padding: 0 24px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(144, 202, 249, 0.6);
  transition: opacity 0.22s ease;

  &.is-hidden {
    opacity: 0;
  }
}

.app-menu {
  flex: 1;
  background: transparent !important;
  border-inline-end: none !important;

  :deep(.ant-menu-item) {
    font-size: 14px;
    font-weight: 500;
    transition: background 0.24s ease, color 0.24s ease, transform 0.24s ease;
  }

  :deep(.ant-menu-item:not(.ant-menu-item-disabled):hover) {
    transform: translateX(2px);
  }

  :deep(.ant-menu-item-selected) {
    background: $brand-500 !important;
    box-shadow: 0 8px 18px -10px rgba(33, 150, 243, 0.9);
  }

  :deep(.ant-menu-item-disabled) {
    color: rgba(227, 242, 253, 0.34) !important;
  }

  :deep(.ant-menu-item .anticon) {
    font-size: 17px;
  }
}

.sider-footer {
  margin: 16px 14px 20px;
  padding: 14px 16px;
  border-radius: 14px;
  background: rgba(144, 202, 249, 0.12);
  border: 1px solid rgba(144, 202, 249, 0.2);
}

.footer-title {
  margin: 0 0 4px;
  font-size: 12.5px;
  font-weight: 600;
  color: #fff;
}

.footer-text {
  margin: 0;
  font-size: 11.5px;
  line-height: 1.5;
  color: rgba(227, 242, 253, 0.65);
}

/* ---------- header ---------- */
.content-shell {
  min-width: 0;
  background: #f4f8fe;
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  height: 68px !important;
  padding: 0 clamp(12px, 2.5vw, 20px) !important;
  line-height: normal !important;
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid $brand-50;
  box-shadow: 0 6px 20px -18px rgba(13, 71, 161, 0.55);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1 1 auto;
}

.header-titles {
  min-width: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 0 0 auto;
}

.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: rgba(13, 71, 161, 0.75);
  font-size: 17px;
  cursor: pointer;
  transition: background 0.22s ease, color 0.22s ease, transform 0.22s ease;

  &:hover {
    background: $brand-50;
    color: $brand-900;
  }

  &:active {
    transform: scale(0.94);
  }
}

.header-title {
  margin: 0;
  font-size: clamp(14.5px, 2.4vw, 16.5px);
  font-weight: 700;
  color: #0d2f5e;
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-sub {
  margin: 1px 0 0;
  font-size: 12px;
  color: #6b87a6;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-divider {
  width: 1px;
  height: 24px;
  flex-shrink: 0;
  background: $brand-50;
}

.user-chip {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 5px 10px 5px 6px;
  border-radius: 999px;
  border: 1px solid transparent;
  cursor: pointer;
  user-select: none;
  transition: background 0.22s ease, border-color 0.22s ease;

  &:hover {
    background: $brand-50;
    border-color: rgba(144, 202, 249, 0.7);
  }
}

.user-avatar {
  background: $brand-900 !important;
  color: #fff !important;
  font-size: 12.5px;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: 0 6px 14px -8px rgba(13, 71, 161, 0.9);
}

.user-name {
  max-width: 160px;
  font-size: 13.5px;
  font-weight: 600;
  color: #0d2f5e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-caret {
  font-size: 10px;
  color: rgba(13, 71, 161, 0.45);
}

/* ---------- content ---------- */
.app-content {
  position: relative;
  min-width: 0;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background: #f4f8fe;
}

.content-inner {
  max-width: 100%;
  padding: clamp(14px, 2.6vw, 24px);
  padding-bottom: calc(clamp(14px, 2.6vw, 24px) + env(safe-area-inset-bottom, 0px));
  animation: content-in 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes content-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ---------- transitions ---------- */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}

/* ---------- breakpoints ---------- */
@media (max-width: 767.98px) {
  .app-header {
    height: 60px !important;
  }

  .brand-block {
    height: 60px;
    padding: 0 14px;
  }

  .header-divider {
    display: none;
  }

  .user-name {
    display: none;
  }

  .user-chip {
    padding: 4px 8px 4px 4px;
  }
}

@media (max-width: 479.98px) {
  .header-left {
    gap: 8px;
  }

  .header-sub {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {

  .app-sider,
  .app-sider.is-drawer,
  .nav-backdrop,
  .content-inner {
    transition-duration: 0.01ms;
    animation: none;
  }
}
</style>

<style lang="scss">
/* dropdown overlay renders outside the component scope */
.user-menu {
  min-width: 168px;
  border-radius: 12px !important;
  padding: 6px !important;
  box-shadow: 0 18px 40px -18px rgba(13, 71, 161, 0.45) !important;

  .ant-dropdown-menu-item {
    border-radius: 8px;
    font-size: 13.5px;
  }
}

/* stop the page behind the mobile drawer from scrolling */
body.nav-drawer-open {
  overflow: hidden;
}
</style>
