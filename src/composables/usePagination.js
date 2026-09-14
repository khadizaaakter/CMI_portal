import { computed, ref, unref, watch } from "vue";

/**
 * Client-side pagination over any array (ref, computed, or plain).
 *
 * const { page, pageSize, paginated, total } = usePagination(filtered);
 * ...then render `paginated` and bind page/pageSize to <TablePagination>.
 */
export function usePagination(source, options = {}) {
  const { pageSize: initialPageSize = 10, resetOnSourceChange = true } = options;

  const page = ref(1);
  const pageSize = ref(initialPageSize);

  const items = computed(() => unref(source) || []);
  const total = computed(() => items.value.length);

  const pageCount = computed(() =>
    Math.max(1, Math.ceil(total.value / pageSize.value))
  );

  const paginated = computed(() => {
    const start = (page.value - 1) * pageSize.value;
    return items.value.slice(start, start + pageSize.value);
  });

  const rangeStart = computed(() =>
    total.value ? (page.value - 1) * pageSize.value + 1 : 0
  );

  const rangeEnd = computed(() =>
    Math.min(page.value * pageSize.value, total.value)
  );

  const reset = () => {
    page.value = 1;
  };

  /* A shrinking list must never strand the viewer on an empty page. */
  watch(pageCount, (last) => {
    if (page.value > last) page.value = last;
  });

  watch(pageSize, reset);

  /* A re-filtered list starts over at page 1. */
  if (resetOnSourceChange) watch(items, reset);

  return {
    page,
    pageSize,
    pageCount,
    paginated,
    total,
    rangeStart,
    rangeEnd,
    reset,
  };
}
