<script setup>
import { useRouter } from "vue-router";
import { PlusOutlined, SettingOutlined } from "@ant-design/icons-vue";

import MainLayout from "@/components/layouts/main_layout.vue";
import { getAccessibleBusinesses } from "@/data/business";

const router = useRouter();

const units = getAccessibleBusinesses();

const open = (slug) => router.push({ name: "business-detail", params: { slug } });

const openAdd = () => router.push({ name: "upload-new" });

const openControlPanel = () => router.push({ name: "control-panel" });
</script>

<template>
  <MainLayout title="Dashboard">
    <!-- ---------- toolbar ---------- -->
    <div class="page-toolbar">
      <a-button type="primary" class="add-btn" @click="openAdd">
        <template #icon><PlusOutlined /></template>
        Add Business
      </a-button>
      <a-button type="primary" class="add-btn" @click="openControlPanel">
        <template #icon><SettingOutlined /></template>
        Control Panel
      </a-button>
    </div>

    <!-- ---------- module grid ---------- -->
    <div class="card-grid">
      <button
        v-for="unit in units"
        :key="unit.slug"
        type="button"
        class="biz-card"
        :class="`accent-${unit.accent}`"
        @click="open(unit.slug)"
      >
        <span class="card-body">
          <span class="card-title">{{ unit.name }}</span>
        </span>
      </button>
    </div>

  </MainLayout>
</template>

<style scoped lang="scss">
$brand-900: #0d47a1;
$brand-500: #2196f3;
$brand-50: #e3f2fd;
$ink: #0d2f5e;
$muted: #6b87a6;

.page-toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.section-label {
  margin: 0;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: $muted;
}

.add-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 38px;
  padding: 0 18px;
  border: none !important;
  border-radius: 10px;
  background: $brand-900 !important;
  color: #fff !important;
  font-size: 13.5px;
  font-weight: 600;
  box-shadow: 0 10px 22px -12px rgba(13, 71, 161, 0.95);
  transition: background 0.22s ease, transform 0.18s ease, box-shadow 0.22s ease;

  &:hover,
  &:focus-visible {
    background: $brand-500 !important;
    color: #fff !important;
    box-shadow: 0 12px 26px -12px rgba(33, 150, 243, 0.95);
  }

  &:active {
    transform: scale(0.97);
  }
}

/* ---------- add business form ---------- */
.add-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 4px 0;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 12.5px;
  font-weight: 600;
  color: $ink;
}

.field-hint {
  font-weight: 500;
  color: $muted;
}

.field-error {
  margin: 0;
  font-size: 12.5px;
  font-weight: 500;
  color: #d4380d;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(224px, 1fr));
  gap: clamp(10px, 1.3vw, 14px);
}

.biz-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 26px 30px;
  text-align: start;
  border: 1px solid $brand-50;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(13, 71, 161, 0.06);
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease,
    background-color 0.2s ease;

  &:hover,
  &:focus-visible {
    transform: translateY(-2px);
    border-color: $brand-500;
    box-shadow: 0 6px 16px -8px rgba(13, 71, 161, 0.35);
    outline: none;

  }

  &:active {
    transform: translateY(0);
  }
}

.card-body {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.card-title {
  font-size: 14.5px;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.01em;
  color: $ink;
  transition: color 0.2s ease;
}

.card-brands {
  font-size: 11.5px;
  line-height: 1.45;
  color: $muted;
}

/* ---------- breakpoints ---------- */
@media (max-width: 639.98px) {
  .card-grid {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .biz-card {
    transition-duration: 0.01ms;
  }

  .biz-card:hover {
    transform: none;
  }
}
</style>
