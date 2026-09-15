<script setup>
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import dayjs from "dayjs";
import {
  SearchOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  FileWordOutlined,
  FilePptOutlined,
  FileOutlined,
  EyeOutlined,
  EditOutlined,
  DownloadOutlined,
  InboxOutlined,
  RightOutlined,
} from "@ant-design/icons-vue";

import MainLayout from "@/components/layouts/main_layout.vue";
import TablePagination from "@/components/common/TablePagination.vue";
import { usePagination } from "@/composables/usePagination";
import { getBusinessBySlug, getStudies } from "@/data/business";

const route = useRoute();
const router = useRouter();

const business = computed(() => getBusinessBySlug(route.params.slug));
const studies = computed(() => getStudies(route.params.slug));

const search = ref("");

/* dayjs month picked in the completion-time filter; null while unset */
const completionDate = ref(null);

/* ---------- formatting ---------- */
const FILE_META = {
  pdf: { icon: FilePdfOutlined, label: "PDF", cls: "ft-pdf" },
  excel: { icon: FileExcelOutlined, label: "EXCEL", cls: "ft-excel" },
  word: { icon: FileWordOutlined, label: "WORD", cls: "ft-word" },
  ppt: { icon: FilePptOutlined, label: "PPTX", cls: "ft-ppt" },
};

const fileMeta = (type) =>
  FILE_META[type] || { icon: FileOutlined, label: "FILE", cls: "ft-other" };

const monthYear = (iso) =>
  new Date(iso).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

const fullDate = (iso) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

/* ---------- filters: search + completion time ---------- */
const matchesSearch = (s, q) =>
  [
    s.topic,
    s.studyType,
    s.brand,
    s.category,
    monthYear(s.completionTime),
    String(new Date(s.completionTime).getFullYear()),
  ]
    .join(" ")
    .toLowerCase()
    .includes(q);

/* Matched by month — the table shows completion time as month + year. */
const matchesDate = (s, month) =>
  dayjs(s.completionTime).isSame(month, "month");

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase();
  const month = completionDate.value;
  if (!q && !month) return studies.value;

  return studies.value.filter(
    (s) => (!q || matchesSearch(s, q)) && (!month || matchesDate(s, month))
  );
});

const hasFilters = computed(
  () => !!search.value.trim() || !!completionDate.value
);

const clearFilters = () => {
  search.value = "";
  completionDate.value = null;
};

const { page, pageSize, paginated } = usePagination(filtered, { pageSize: 10 });

/* ---------- file popup ---------- */
const modalOpen = ref(false);
const modalTitle = ref("");
const modalSubtitle = ref("");
const modalFiles = ref([]);

const openFiles = (study, kind) => {
  const LABEL = {
    studyBrief: "Study Brief",
    studyProposal: "Study Proposal",
    finalReport: "Final Report",
  };
  modalTitle.value = LABEL[kind];
  modalSubtitle.value = study.topic;
  modalFiles.value = study[kind] || [];
  modalOpen.value = true;
};

/* ---------- row actions ---------- */
const editStudy = (study) => {
  router.push({
    name: "edit-report",
    params: { slug: route.params.slug, id: study.id },
  });
};

/* Wire to the real document endpoint once uploads are live. */
const openFile = (file) => {
  window.open(`/reports/${encodeURIComponent(file.name)}`, "_blank", "noopener");
};

watch(
  () => route.params.slug,
  () => {
    clearFilters();
    modalOpen.value = false;
  }
);

const goBack = () => router.push({ name: "home" });
</script>

<template>
  <MainLayout
    :title="business ? business.name : 'Business'"
  >
    <!-- ---------- not found ---------- -->
    <div v-if="!business" class="empty-state">
      <InboxOutlined class="empty-icon" />
      <p class="empty-title">Business module not found</p>
      <a-button type="primary" @click="goBack">Back to overview</a-button>
    </div>

    <template v-else>
      <!-- ---------- breadcrumb + title ---------- -->
      <nav class="crumbs" aria-label="Breadcrumb">
        <button type="button" class="crumb-link" @click="goBack">Home</button>
        <RightOutlined class="crumb-sep" />
        <span class="crumb-current">{{ business.name }}</span>
      </nav>

      

      <!-- ---------- search + date filter ---------- -->
      <div class="toolbar">
        <div class="search-box">
          <SearchOutlined class="search-icon" />
          <input
            v-model="search"
            type="search"
            class="search-input"
            placeholder="Search: Topic, Type, Brand, Category"
            aria-label="Search research studies"
          />
        </div>

        <a-date-picker
          v-model:value="completionDate"
          class="date-filter"
          picker="month"
          format="MMMM YYYY"
          placeholder="Completion Time"
          aria-label="Filter by completion time"
          :allow-clear="true"
        />

        <button
          v-if="hasFilters"
          type="button"
          class="reset-btn"
          @click="clearFilters"
        >
          Reset
        </button>

        <span v-if="hasFilters" class="result-count">
          {{ filtered.length }} of {{ studies.length }}
        </span>
      </div>

      <!-- ---------- table ---------- -->
      <div class="table-card">
        <div class="table-scroll">
          <table class="study-table">
            <thead>
              <tr>
                <th class="col-sl">Serial No</th>
                <th class="col-topic">Research Topics</th>
                <th class="col-type">Study Type</th>
                <th>Brand</th>
                <th>Category</th>
                <th class="col-file">Study Brief</th>
                <th class="col-file">Study Proposal</th>
                <th class="col-time">Completion Time</th>
                <th class="col-file">Final Report</th>
                <th class="col-file">Action</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="study in paginated" :key="study.id">
                <td class="cell-sl">{{ study.id }}</td>

                <td class="cell-topic">
                  <span class="topic-text">{{ study.topic }}</span>
                </td>

                <td class="cell-plain">{{ study.studyType }}</td>

                <td class="cell-plain">{{ study.brand }}</td>
                <td class="cell-plain">{{ study.category }}</td>

                <td
                  v-for="kind in ['studyBrief', 'studyProposal']"
                  :key="kind"
                  class="cell-center"
                >
                  <button
                    v-if="study[kind].length"
                    type="button"
                    class="view-link"
                    @click="openFiles(study, kind)"
                  >
                    <EyeOutlined class="view-icon" />
                    View
                  </button>
                  <span v-else class="cell-dash">—</span>
                </td>

                <td class="cell-time">{{ monthYear(study.completionTime) }}</td>

                <td class="cell-center">
                  <button
                    v-if="study.finalReport.length"
                    type="button"
                    class="view-link"
                    @click="openFiles(study, 'finalReport')"
                  >
                    <EyeOutlined class="view-icon" />
                    View
                  </button>
                  <span v-else class="cell-dash">—</span>
                </td>

                <td class="cell-center">
                  <button
                    type="button"
                    class="edit-link"
                    :aria-label="`Edit ${study.topic}`"
                    @click="editStudy(study)"
                  >
                    <EditOutlined class="view-icon" />
                    Edit
                  </button>
                </td>
              </tr>

              <tr v-if="!filtered.length">
                <td colspan="10">
                  <div class="table-empty">
                    <InboxOutlined class="empty-icon" />
                    <p class="empty-title">
                      No studies match the current filters
                    </p>
                    <button
                      type="button"
                      class="clear-btn"
                      @click="clearFilters"
                    >
                      Clear filters
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <TablePagination
          v-model:page="page"
          v-model:page-size="pageSize"
          :total="filtered.length"
          item-label="studies"
        />
      </div>
    </template>

    <!-- ---------- file popup ---------- -->
    <a-modal
      v-model:open="modalOpen"
      :footer="null"
      :width="560"
      centered
      wrap-class-name="files-modal"
    >
      <template #title>
        <div class="modal-head">
          <p class="modal-kicker">{{ modalTitle }}</p>
          <p class="modal-topic">{{ modalSubtitle }}</p>
        </div>
      </template>

      <div class="files-head">
        <span>Reports</span>
        <span>Uploaded Date</span>
      </div>

      <ul class="file-list">
        <li v-for="file in modalFiles" :key="file.name" class="file-row">
          <button type="button" class="file-main" @click="openFile(file)">
            <span class="file-icon" :class="fileMeta(file.type).cls">
              <component :is="fileMeta(file.type).icon" />
            </span>
            <span class="file-text">
              <span class="file-name">{{ file.name }}</span>
              <span class="file-type">{{ fileMeta(file.type).label }}</span>
            </span>
          </button>

          <span class="file-date">{{ fullDate(file.date) }}</span>

          <button
            type="button"
            class="file-dl"
            :aria-label="`Download ${file.name}`"
            @click="openFile(file)"
          >
            <DownloadOutlined />
          </button>
        </li>
      </ul>
    </a-modal>
  </MainLayout>
</template>

<style scoped lang="scss">
$brand-900: #0d47a1;
$brand-700: #1565c0;
$brand-500: #2196f3;
$brand-200: #90caf9;
$brand-50: #e3f2fd;
$ink: #0d2f5e;
$muted: #6b87a6;
$line: #e7effb;
$border: #dfe4ea;

/* ---------- breadcrumb ---------- */
.crumbs {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 14px;
  font-size: 12.5px;
}

.crumb-link {
  padding: 0;
  border: none;
  background: none;
  font: inherit;
  font-weight: 600;
  color: $brand-700;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
}

.crumb-sep {
  font-size: 9px;
  color: #a9c0dc;
}

.crumb-current {
  font-weight: 600;
  color: #000;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ---------- page head ---------- */
.page-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border: 1px solid $brand-50;
  border-radius: 12px;
  background: #fff;
  color: $brand-700;
  font-size: 15px;
  cursor: pointer;
  box-shadow: 0 10px 20px -18px rgba(13, 71, 161, 0.7);
  transition: background 0.22s ease, transform 0.22s ease;

  &:hover {
    background: $brand-50;
    transform: translateX(-2px);
  }
}

.head-copy {
  min-width: 0;
}

.head-title {
  margin: 0;
  font-size: clamp(17px, 2.6vw, 22px);
  font-weight: 700;
  letter-spacing: -0.015em;
  color: $ink;
}

.head-sub {
  margin: 2px 0 0;
  font-size: 12.5px;
  color: #000;
}

/* ---------- toolbar ---------- */
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.search-box {
  position: relative;
  flex: 1 1 0;
  max-width: 320px;
}

.search-icon {
  position: absolute;
  top: 50%;
  inset-inline-start: 15px;
  transform: translateY(-50%);
  font-size: 15px;
  color: $brand-500;
  pointer-events: none;
}

.search-input {
  width: 100%;
  height: 46px;
  padding: 0 16px 0 42px;
  border: 1px solid $brand-50;
  border-radius: 14px;
  background: #fff;
  font-size: 13.5px;
  color: $ink;
  box-shadow: 0 12px 26px -24px rgba(13, 71, 161, 0.8);
  transition: border-color 0.22s ease, box-shadow 0.22s ease;

  &::placeholder {
    color: #9fb3c8;
  }

  &:focus {
    outline: none;
    border-color: $brand-200;
    box-shadow: 0 0 0 3px rgba(144, 202, 249, 0.35);
  }

  &::-webkit-search-cancel-button {
    cursor: pointer;
  }
}

.date-filter {
  flex: 1 1 0;
  max-width: 320px;
  height: 46px;
  border-radius: 14px;
  border-color: $brand-50;
  box-shadow: 0 12px 26px -24px rgba(13, 71, 161, 0.8);

  :deep(input) {
    font-size: 13.5px;
    color: $ink;

    &::placeholder {
      color: #9fb3c8;
    }
  }

  &:hover,
  &:focus-within {
    border-color: $brand-200;
  }
}

.reset-btn {
  flex-shrink: 0;
  height: 46px;
  padding: 0 18px;
  border: 1px solid $brand-50;
  border-radius: 14px;
  background: #fff;
  font-size: 12.5px;
  font-weight: 600;
  color: $brand-700;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;

  &:hover {
    background: $brand-50;
    border-color: $brand-200;
  }
}

.result-count {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 600;
  color: #000;
}

/* ---------- table ---------- */
.table-card {
  border: 1px solid $border;
  background: #fff;
}

.table-scroll {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.study-table {
  width: 100%;
  min-width: 1040px;
  border-collapse: collapse;
  font-size: 15px;

  th,
  td {
    padding: 10px 14px;
    text-align: start;
    border-right: 1px solid $border;
    vertical-align: middle;

    &:last-child {
      border-right: none;
    }
  }

  thead th {
    position: sticky;
    top: 0;
    z-index: 2;
    border-bottom: 1px solid $border;
    background: #f5f7fa;
    font-size: 15px;
    font-weight: 600;
    color: $ink;
    white-space: nowrap;
  }

  tbody td {
    border-top: 1px solid $border;
    color: $ink;
  }

  tbody tr:hover {
    background: #fafbfc;
  }
}

.col-sl {
  width: 92px;
}

.col-topic {
  min-width: 280px;
}

.col-type,
.col-time {
  width: 140px;
}

.col-file {
  width: 128px;
  text-align: center !important;
}

.cell-sl {
  color: $muted;
}

.topic-text {
  line-height: 1.45;
}

.cell-plain,
.cell-time {
  white-space: nowrap;
}

.cell-center {
  text-align: center;
}

.cell-dash {
  color: #b6c6da;
}

%table-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 78px;
  height: 28px;
  padding: 0 12px;
  border: 1px solid transparent;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease,
    box-shadow 0.2s ease;

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.35);
  }

  &:active {
    transform: translateY(1px);
  }
}

.view-link {
  @extend %table-btn;

  border-color: #bcdffb;
  background: $brand-50;
  color: $brand-700;

  &:hover {
    background: #d3e8fd;
    border-color: $brand-200;
  }
}

.edit-link {
  @extend %table-btn;

  border-color: $brand-700;
  background: $brand-700;
  color: #fff;

  &:hover {
    background: $brand-900;
    border-color: $brand-900;
  }
}

.view-icon {
  display: inline-flex;
  flex: none;
  font-size: 13px;
  line-height: 1;

  :deep(svg) {
    width: 13px;
    height: 13px;
  }
}

.table-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 46px 16px;
}

.clear-btn {
  padding: 6px 16px;
  border: 1px solid $brand-50;
  border-radius: 999px;
  background: #fff;
  font-size: 12.5px;
  font-weight: 600;
  color: $brand-700;
  cursor: pointer;

  &:hover {
    background: $brand-50;
  }
}

.table-note {
  margin: 12px 0 0;
  font-size: 11.5px;
  color: $muted;
}

/* ---------- empty / not found ---------- */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 70px 16px;
}

.empty-icon {
  font-size: 34px;
  color: $brand-200;
}

.empty-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: $muted;
}

/* ---------- modal body ---------- */
.modal-head {
  min-width: 0;
  padding-inline-end: 22px;
}

.modal-kicker {
  margin: 0;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.11em;
  text-transform: uppercase;
  color: $brand-500;
}

.modal-topic {
  margin: 3px 0 0;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.4;
  color: $ink;
  white-space: normal;
}

.files-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px 8px;
  border-bottom: 1px solid $line;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: $muted;
}

.file-list {
  margin: 6px 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.file-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 9px 10px;
  border: 1px solid transparent;
  border-radius: 12px;
  transition: background 0.2s ease, border-color 0.2s ease;

  &:hover {
    background: #f6faff;
    border-color: $brand-50;
  }
}

.file-main {
  display: flex;
  align-items: center;
  gap: 11px;
  flex: 1 1 auto;
  min-width: 0;
  padding: 0;
  border: none;
  background: none;
  text-align: start;
  cursor: pointer;
}

.file-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 10px;
  font-size: 17px;

  &.ft-pdf {
    background: #ffebee;
    color: #c62828;
  }

  &.ft-excel {
    background: #e8f5e9;
    color: #2e7d32;
  }

  &.ft-word {
    background: #e3f2fd;
    color: #1565c0;
  }

  &.ft-ppt {
    background: #fff3e0;
    color: #e65100;
  }

  &.ft-other {
    background: #eceff1;
    color: #546e7a;
  }
}

.file-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.file-name {
  font-size: 13px;
  font-weight: 600;
  color: $ink;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  .file-main:hover & {
    color: $brand-700;
    text-decoration: underline;
  }
}

.file-type {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: $muted;
}

.file-date {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 600;
  color: $muted;
  white-space: nowrap;
}

.file-dl {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border: none;
  border-radius: 10px;
  background: $brand-50;
  color: $brand-700;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;

  &:hover {
    background: $brand-900;
    color: #fff;
  }
}

/* ---------- breakpoints ---------- */
@media (max-width: 639.98px) {
  .toolbar {
    flex-wrap: wrap;
  }

  .search-box {
    max-width: none;
    flex: 1 1 100%;
  }

  .date-filter {
    flex: 1 1 100%;
    max-width: none;
  }

  .file-row {
    flex-wrap: wrap;
    row-gap: 6px;
  }

  .file-main {
    flex: 1 1 100%;
  }

  .file-date {
    margin-inline-start: 47px;
  }

  .file-dl {
    margin-inline-start: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .back-btn,
  .view-link,
  .edit-link,
  .file-row {
    transition-duration: 0.01ms;
  }
}
</style>

<style lang="scss">
/* modal renders outside the component scope */
.files-modal {
  .ant-modal-content {
    border-radius: 18px;
    padding: 20px 22px 22px;
    box-shadow: 0 30px 70px -32px rgba(13, 71, 161, 0.6);
  }

  .ant-modal-header {
    margin-bottom: 16px;
    padding-bottom: 14px;
    border-bottom: 1px solid #e7effb;
  }

  .ant-modal-title {
    white-space: normal;
  }
}
</style>
