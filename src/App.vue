<script setup>
import { RouterView } from "vue-router";

const themeConfig = {
  token: {
    colorPrimary: "#0D47A1",
    colorInfo: "#2196F3",
    colorLink: "#0D47A1",
    colorLinkHover: "#2196F3",
    borderRadius: 10,
    fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`,
  },
  components: {
    Menu: {
      darkItemBg: "transparent",
      darkSubMenuItemBg: "transparent",
      darkItemSelectedBg: "#2196F3",
      darkItemHoverBg: "rgba(255, 255, 255, 0.12)",
      darkItemColor: "rgba(227, 242, 253, 0.78)",
      darkItemHoverColor: "#ffffff",
      darkItemSelectedColor: "#ffffff",
      itemBorderRadius: 10,
      itemMarginInline: 12,
      itemHeight: 44,
    },
    Layout: {
      headerBg: "#ffffff",
      bodyBg: "#F4F8FE",
      siderBg: "transparent",
    },
  },
};
</script>

<template>
  <a-config-provider :theme="themeConfig">
    <RouterView />
  </a-config-provider>
</template>
