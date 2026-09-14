<script setup>
import { computed } from "vue";

const props = defineProps({
  page: { type: Number, required: true },
  pageSize: { type: Number, default: 10 },
  total: { type: Number, required: true },
  pageSizeOptions: { type: Array, default: () => ["10", "20", "50", "100"] },
  showSizeChanger: { type: Boolean, default: true },
  /* Noun used in the "Showing 1–10 of 24 studies" line. */
  itemLabel: { type: String, default: "items" },
});

const emit = defineEmits(["update:page", "update:pageSize"]);

const rangeStart = computed(() =>
  props.total ? (props.page - 1) * props.pageSize + 1 : 0
);

const rangeEnd = computed(() =>
  Math.min(props.page * props.pageSize, props.total)
);
</script>

<template>
  <div v-if="total" class="pager">
    <p class="pager-count">
      Showing {{ rangeStart }}–{{ rangeEnd }} of {{ total }} {{ itemLabel }}
    </p>

    <a-pagination
      size="small"
      :current="page"
      :page-size="pageSize"
      :total="total"
      :show-size-changer="showSizeChanger"
      :page-size-options="pageSizeOptions"
      @update:current="emit('update:page', $event)"
      @update:page-size="emit('update:pageSize', $event)"
    />
  </div>
</template>

<style scoped lang="scss">
$brand-700: #1565c0;
$brand-200: #90caf9;
$brand-50: #e3f2fd;
$muted: #6b87a6;
$border: #dfe4ea;

.pager {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  padding: 12px 14px;
  border-top: 1px solid $border;
  background: #fff;
}

.pager-count {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: $muted;
}

:deep(.ant-pagination-item-active) {
  border-color: $brand-200;
  background: $brand-50;

  a {
    color: $brand-700;
  }
}
</style>
