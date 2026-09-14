<script setup>
defineProps({
  size: { type: Number, default: 40 },
  rounded: { type: Boolean, default: true },
});
</script>

<template>
  <span
    class="inline-flex items-center justify-center shrink-0 bg-white overflow-hidden"
    :class="rounded ? 'rounded-full' : 'rounded-md'"
    :style="{ width: size + 'px', height: size + 'px' }"
  >
    <img
      src="/images/aci-logo.png"
      alt="ACI Consumer Brands"
      class="w-full h-full object-contain"
    />
  </span>
</template>
