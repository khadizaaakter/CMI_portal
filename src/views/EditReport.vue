<script setup>
import { computed, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { message } from "ant-design-vue";
import dayjs from "dayjs";
import {
  InboxOutlined,
  PaperClipOutlined,
  RightOutlined,
  UploadOutlined,
} from "@ant-design/icons-vue";

import MainLayout from "@/components/layouts/main_layout.vue";
import {
  STUDY_TYPES,
  getBusinessBySlug,
  getStudy,
  updateStudy,
} from "@/data/business";

const route = useRoute();
const router = useRouter();

const business = computed(() => getBusinessBySlug(route.params.slug));
const study = computed(() => getStudy(route.params.slug, route.params.id));

/* attachment fields: form key -> label */
const ATTACHMENTS = [
  { key: "studyBrief", label: "Study Brief" },
  { key: "studyProposal", label: "Study Proposal" },
  { key: "finalReport", label: "Study Report" },
];

/* ---------- form state ---------- */
const form = reactive({
  topic: "",
  studyType: undefined,
  brand: "",
  category: "",
  completionTime: null,
});

/* per attachment: newly picked files + add / replace mode */
const files = reactive({
  studyBrief: [],
  studyProposal: [],
  finalReport: [],
});

const mode = reactive({
  studyBrief: "add",
  studyProposal: "add",
  finalReport: "add",
});

const errors = reactive({});
const saving = ref(false);

const resetForm = () => {
  const s = study.value;
  form.topic = s?.topic || "";
  form.studyType = s?.studyType || undefined;
  form.brand = s?.brand || "";
  form.category = s?.category || "";
  form.completionTime = s?.completionTime ? dayjs(s.completionTime) : null;

  for (const { key } of ATTACHMENTS) {
    files[key] = [];
    mode[key] = "add";
  }
  Object.keys(errors).forEach((k) => delete errors[k]);
};

watch(study, resetForm, { immediate: true });

/* existing files stay unless the field is set to "Replace" */
const keptCount = (key) =>
  mode[key] === "replace" ? 0 : study.value?.[key]?.length || 0;

/* ant-design keeps the picked files in the list instead of uploading them */
const holdFile = (key) => (file) => {
  files[key] = [...files[key], file];
  return false;
};

const removeFile = (key) => (file) => {
  files[key] = files[key].filter((f) => f.uid !== file.uid);
};

/* ---------- save ---------- */
const validate = () => {
  Object.keys(errors).forEach((k) => delete errors[k]);

  if (!form.topic.trim()) errors.topic = "Study topic is required.";
  if (!form.studyType) errors.studyType = "Select a study type.";
  if (!form.completionTime) errors.completionTime = "Select a complete date.";

  return !Object.keys(errors).length;
};

/* picked files carry no server path yet — store the name and today's date */
const mergeFiles = (key) => {
  const kept = mode[key] === "replace" ? [] : study.value[key] || [];
  const added = files[key].map((f) => ({
    name: f.name,
    date: dayjs().format("YYYY-MM-DD"),
    type: fileType(f.name),
  }));
  return [...kept, ...added];
};

const fileType = (name) => {
  const ext = name.split(".").pop().toLowerCase();
  if (ext === "pdf") return "pdf";
  if (["xls", "xlsx", "csv"].includes(ext)) return "excel";
  if (["doc", "docx"].includes(ext)) return "word";
  if (["ppt", "pptx"].includes(ext)) return "ppt";
  return "other";
};

const save = () => {
  if (!validate()) return;

  saving.value = true;
  updateStudy(route.params.slug, route.params.id, {
    topic: form.topic.trim(),
    studyType: form.studyType,
    brand: form.brand.trim(),
    category: form.category.trim(),
    completionTime: form.completionTime.endOf("month").format("YYYY-MM-DD"),
    studyBrief: mergeFiles("studyBrief"),
    studyProposal: mergeFiles("studyProposal"),
    finalReport: mergeFiles("finalReport"),
  });
  saving.value = false;

  message.success("Report updated");
  goToBusiness();
};

const goHome = () => router.push({ name: "home" });

const goToBusiness = () =>
  router.push({ name: "business-detail", params: { slug: route.params.slug } });
</script>

<template>
  <MainLayout title="Edit Report">
    <!-- ---------- not found ---------- -->
    <div v-if="!business || !study" class="empty-state">
      <InboxOutlined class="empty-icon" />
      <p class="empty-title">Report not found</p>
      <a-button type="primary" @click="goHome">Back to overview</a-button>
    </div>

    <template v-else>
      <!-- ---------- breadcrumb ---------- -->
      <nav class="crumbs" aria-label="Breadcrumb">
        <button type="button" class="crumb-link" @click="goHome">Home</button>
        <RightOutlined class="crumb-sep" />
        <button type="button" class="crumb-link" @click="goToBusiness">
          {{ business.name }}
        </button>
        <RightOutlined class="crumb-sep" />
        <span class="crumb-current">Edit Report</span>
      </nav>

      <!-- ---------- form ---------- -->
      <form class="form-card" @submit.prevent="save">
        <div class="field">
          <label class="field-label" for="business-name">Business Name</label>
          <div class="field-control">
            <a-input
              id="business-name"
              :value="business.name"
              disabled
              class="locked-input"
            />
          </div>
        </div>

        <div class="field">
          <label class="field-label" for="study-topic">Study Topic</label>
          <div class="field-control">
            <a-input
              id="study-topic"
              v-model:value="form.topic"
              placeholder="Study topic"
            />
            <p v-if="errors.topic" class="field-error">{{ errors.topic }}</p>
          </div>
        </div>

        <div class="field">
          <label class="field-label" for="study-type">Study Type</label>
          <div class="field-control">
            <a-select
              id="study-type"
              v-model:value="form.studyType"
              class="full"
              placeholder="Select study type"
              :options="STUDY_TYPES.map((t) => ({ value: t, label: t }))"
            />
            <p v-if="errors.studyType" class="field-error">
              {{ errors.studyType }}
            </p>
          </div>
        </div>

        <div class="field">
          <label class="field-label" for="brand">Brand</label>
          <div class="field-control">
            <a-input id="brand" v-model:value="form.brand" placeholder="Brand" />
          </div>
        </div>

        <div class="field">
          <label class="field-label" for="category">Category</label>
          <div class="field-control">
            <a-input
              id="category"
              v-model:value="form.category"
              placeholder="Category"
            />
          </div>
        </div>

        <!-- brief + proposal share the attachment row layout -->
        <div
          v-for="item in ATTACHMENTS.slice(0, 2)"
          :key="item.key"
          class="field"
        >
          <span class="field-label">{{ item.label }}</span>
          <div class="field-control">
            <div class="attach-row">
              <a-upload
                multiple
                :file-list="files[item.key]"
                :before-upload="holdFile(item.key)"
                :remove="removeFile(item.key)"
                class="attach-upload"
              >
                <a-button class="attach-btn">
                  <template #icon><UploadOutlined /></template>
                  Attachment
                </a-button>
              </a-upload>

              <a-radio-group v-model:value="mode[item.key]" class="attach-mode">
                <a-radio value="add">Add</a-radio>
                <a-radio value="replace">Replace</a-radio>
              </a-radio-group>
            </div>

            <p class="field-hint">
              <PaperClipOutlined />
              {{ keptCount(item.key) }} existing
              <template v-if="files[item.key].length">
                + {{ files[item.key].length }} new
              </template>
            </p>
          </div>
        </div>

        <div class="field">
          <label class="field-label" for="complete-date">Complete Date</label>
          <div class="field-control">
            <a-date-picker
              id="complete-date"
              v-model:value="form.completionTime"
              picker="month"
              format="MMMM YYYY"
              class="full"
              placeholder="Select month"
            />
            <p v-if="errors.completionTime" class="field-error">
              {{ errors.completionTime }}
            </p>
          </div>
        </div>

        <!-- study report keeps the same attachment controls -->
        <div class="field">
          <span class="field-label">Study Report</span>
          <div class="field-control">
            <div class="attach-row">
              <a-upload
                multiple
                :file-list="files.finalReport"
                :before-upload="holdFile('finalReport')"
                :remove="removeFile('finalReport')"
                class="attach-upload"
              >
                <a-button class="attach-btn">
                  <template #icon><UploadOutlined /></template>
                  Attachment
                </a-button>
              </a-upload>

              <a-radio-group v-model:value="mode.finalReport" class="attach-mode">
                <a-radio value="add">Add</a-radio>
                <a-radio value="replace">Replace</a-radio>
              </a-radio-group>
            </div>

            <p class="field-hint">
              <PaperClipOutlined />
              {{ keptCount("finalReport") }} existing
              <template v-if="files.finalReport.length">
                + {{ files.finalReport.length }} new
              </template>
            </p>
          </div>
        </div>

        <div class="form-actions">
          <a-button @click="goToBusiness">Cancel</a-button>
          <a-button
            type="primary"
            html-type="submit"
            class="save-btn"
            :loading="saving"
          >
            Save
          </a-button>
        </div>
      </form>
    </template>
  </MainLayout>
</template>

<style scoped lang="scss">
$brand-900: #0d47a1;
$brand-700: #1565c0;
$ink: #0d2f5e;
$muted: #6b87a6;
$border: #dfe4ea;

/* ---------- breadcrumb ---------- */
.crumbs {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 14px;
  font-size: 12.5px;
  flex-wrap: wrap;
}

.crumb-link {
  max-width: 100%;
  padding: 0;
  border: none;
  background: none;
  font: inherit;
  font-weight: 600;
  color: $brand-700;
  text-align: start;
  overflow-wrap: anywhere;
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
}

/* ---------- form ---------- */
.form-card {
  width: 100%;
  padding: 28px clamp(16px, 3vw, 32px);
  border: 1px solid $border;
  background: #fff;
}

.field {
  display: flex;
  align-items: flex-start;
  gap: clamp(10px, 1.6vw, 16px);
  margin-bottom: 18px;
}

/* label keeps its own column at every width, narrowing as the viewport does */
.field-label {
  width: clamp(96px, 22vw, 170px);
  flex-shrink: 0;
  padding-top: 6px;
  text-align: end;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.3;
  color: $ink;
  overflow-wrap: break-word;
}

.field-control {
  flex: 1 1 auto;
  align-self: stretch;
  min-width: 0;
}

.full {
  width: 100%;
  max-width: 100%;
}

.locked-input {
  color: $muted !important;
  background: #f5f7fa !important;
}

.field-hint {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px;
  margin: 6px 0 0;
  font-size: 11.5px;
  color: $muted;
}

.field-error {
  margin: 6px 0 0;
  font-size: 11.5px;
  color: #c62828;
}

/* ---------- attachments ---------- */
.attach-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

/* the picked-file list lives inside this wrapper, so it needs room to shrink */
.attach-upload {
  flex: 0 1 420px;
  min-width: 0;
  max-width: 100%;
}

.attach-mode {
  flex: 0 0 auto;
}

.attach-btn {
  min-width: 160px;
  max-width: 100%;
  text-align: start;
}

/* long file names stay inside the card instead of widening the row */
.attach-upload :deep(.ant-upload-list) {
  max-width: 100%;
}

.attach-upload :deep(.ant-upload-list-item-name) {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* ---------- actions ---------- */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
  padding-top: 18px;
  border-top: 1px solid $border;
}

.save-btn {
  min-width: 120px;
  background: $brand-900 !important;
  border-color: $brand-900 !important;
}

/* ---------- empty ---------- */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 70px 16px;
}

.empty-icon {
  font-size: 34px;
  color: #90caf9;
}

.empty-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: $muted;
}

/* ---------- breakpoints ---------- */

/* tablets: label stays beside its control, the column just gets narrower */
@media (max-width: 767.98px) {
  .field {
    gap: 12px;
    margin-bottom: 16px;
  }

  .attach-upload {
    flex: 1 1 100%;
  }
}

@media (max-width: 575.98px) {
  .form-card {
    padding: 18px 12px;
  }

  .field {
    gap: 10px;
  }

  .field-label {
    padding-top: 7px;
    font-size: 13px;
  }

  /* upload trigger and the add/replace choice each get their own line */
  .attach-row {
    align-items: flex-start;
    gap: 10px;
  }

  .attach-btn {
    width: 100%;
    min-width: 0;
    text-align: center;
  }

  .form-actions {
    flex-direction: column-reverse;
    gap: 8px;
    margin-top: 20px;
  }

  .form-actions :deep(.ant-btn) {
    width: 100%;
  }

  /* 16px keeps iOS Safari from zooming in when a field takes focus */
  .field-control :deep(.ant-input),
  .field-control :deep(.ant-select-selector),
  .field-control :deep(.ant-picker-input > input) {
    font-size: 16px;
  }
}
</style>
