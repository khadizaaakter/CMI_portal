<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { message } from "ant-design-vue";
import dayjs from "dayjs";
import {
  PaperClipOutlined,
  RightOutlined,
  UploadOutlined,
} from "@ant-design/icons-vue";

import MainLayout from "@/components/layouts/main_layout.vue";
import {
  STUDY_TYPES,
  addStudy,
  getAccessibleBusinesses,
} from "@/data/business";

const router = useRouter();

const businesses = getAccessibleBusinesses();

/* attachment fields: form key -> label */
const ATTACHMENTS = [
  { key: "studyBrief", label: "Study Brief" },
  { key: "studyProposal", label: "Study Proposal" },
  { key: "finalReport", label: "Study Reports" },
];

/* ---------- form state ---------- */
const form = reactive({
  slug: undefined,
  topic: "",
  studyType: undefined,
  brand: "",
  category: "",
  completionTime: null,
});

const files = reactive({
  studyBrief: [],
  studyProposal: [],
  finalReport: [],
});

const errors = reactive({});
const saving = ref(false);

/* ant-design keeps the picked files in the list instead of uploading them */
const holdFile = (key) => (file) => {
  files[key] = [...files[key], file];
  return false;
};

const removeFile = (key) => (file) => {
  files[key] = files[key].filter((f) => f.uid !== file.uid);
};

/* ---------- submit ---------- */
const validate = () => {
  Object.keys(errors).forEach((k) => delete errors[k]);

  if (!form.slug) errors.slug = "Select a business.";
  if (!form.topic.trim()) errors.topic = "Study topic is required.";
  if (!form.studyType) errors.studyType = "Select a study type.";
  if (!form.brand.trim()) errors.brand = "Brand is required.";
  if (!form.category.trim()) errors.category = "Category is required.";
  if (!form.completionTime) errors.completionTime = "Select a completion date.";

  for (const { key, label } of ATTACHMENTS) {
    if (!files[key].length) errors[key] = `Attach at least one ${label} file.`;
  }

  return !Object.keys(errors).length;
};

const fileType = (name) => {
  const ext = name.split(".").pop().toLowerCase();
  if (ext === "pdf") return "pdf";
  if (["xls", "xlsx", "csv"].includes(ext)) return "excel";
  if (["doc", "docx"].includes(ext)) return "word";
  if (["ppt", "pptx"].includes(ext)) return "ppt";
  return "other";
};

/* picked files carry no server path yet — store the name and today's date */
const toFileList = (key) =>
  files[key].map((f) => ({
    name: f.name,
    date: dayjs().format("YYYY-MM-DD"),
    type: fileType(f.name),
  }));

const submit = () => {
  if (!validate()) return;

  saving.value = true;
  const created = addStudy(form.slug, {
    topic: form.topic.trim(),
    studyType: form.studyType,
    brand: form.brand.trim(),
    category: form.category.trim(),
    completionTime: form.completionTime.endOf("month").format("YYYY-MM-DD"),
    studyBrief: toFileList("studyBrief"),
    studyProposal: toFileList("studyProposal"),
    finalReport: toFileList("finalReport"),
  });
  saving.value = false;

  if (!created) {
    errors.slug = "That business is no longer available.";
    return;
  }

  message.success("Report uploaded");
  router.push({ name: "business-detail", params: { slug: form.slug } });
};

const goHome = () => router.push({ name: "home" });
</script>

<template>
  <MainLayout title="Upload New">
    <!-- ---------- breadcrumb ---------- -->
    <nav class="crumbs" aria-label="Breadcrumb">
      <button type="button" class="crumb-link" @click="goHome">Home</button>
      <RightOutlined class="crumb-sep" />
      <span class="crumb-current">Upload New</span>
    </nav>

    <!-- ---------- form ---------- -->
    <form class="form-card" @submit.prevent="submit">
      <div class="field">
        <label class="field-label" for="business-name">
          Business Name<span class="req">*</span>
        </label>
        <div class="field-control">
          <a-select
            id="business-name"
            v-model:value="form.slug"
            class="full"
            placeholder="Select business module"
            :options="businesses.map((b) => ({ value: b.slug, label: b.name }))"
          />
          <p v-if="errors.slug" class="field-error">{{ errors.slug }}</p>
        </div>
      </div>

      <div class="field">
        <label class="field-label" for="study-topic">
          Study Topic<span class="req">*</span>
        </label>
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
        <label class="field-label" for="study-type">
          Study Type<span class="req">*</span>
        </label>
        <div class="field-control">
          <a-select
            id="study-type"
            v-model:value="form.studyType"
            class="full"
            placeholder="Qualitative / Quantitative / Mixed Method"
            :options="STUDY_TYPES.map((t) => ({ value: t, label: t }))"
          />
          <p v-if="errors.studyType" class="field-error">
            {{ errors.studyType }}
          </p>
        </div>
      </div>

      <div class="field">
        <label class="field-label" for="brand">
          Brand<span class="req">*</span>
        </label>
        <div class="field-control">
          <a-input id="brand" v-model:value="form.brand" placeholder="Brand" />
          <p v-if="errors.brand" class="field-error">{{ errors.brand }}</p>
        </div>
      </div>

      <div class="field">
        <label class="field-label" for="category">
          Category<span class="req">*</span>
        </label>
        <div class="field-control">
          <a-input
            id="category"
            v-model:value="form.category"
            placeholder="Category"
          />
          <p v-if="errors.category" class="field-error">{{ errors.category }}</p>
        </div>
      </div>

      <!-- brief + proposal sit above the date, study reports below it -->
      <div v-for="item in ATTACHMENTS.slice(0, 2)" :key="item.key" class="field">
        <span class="field-label">
          {{ item.label }}<span class="req">*</span>
        </span>
        <div class="field-control">
          <a-upload
            multiple
            :file-list="files[item.key]"
            :before-upload="holdFile(item.key)"
            :remove="removeFile(item.key)"
          >
            <a-button class="attach-btn">
              <template #icon><UploadOutlined /></template>
              Attachment
            </a-button>
          </a-upload>

          <p v-if="errors[item.key]" class="field-error">
            {{ errors[item.key] }}
          </p>
          <p v-else-if="files[item.key].length" class="field-hint">
            <PaperClipOutlined />
            {{ files[item.key].length }} file(s) selected
          </p>
        </div>
      </div>

      <div class="field">
        <label class="field-label" for="completion-date">
          Completion Date<span class="req">*</span>
        </label>
        <div class="field-control">
          <a-date-picker
            id="completion-date"
            v-model:value="form.completionTime"
            picker="month"
            format="MMMM YYYY"
            class="full"
            placeholder="Month & year (e.g. August 2026)"
          />
          <p v-if="errors.completionTime" class="field-error">
            {{ errors.completionTime }}
          </p>
        </div>
      </div>

      <div class="field">
        <span class="field-label">Study Reports<span class="req">*</span></span>
        <div class="field-control">
          <a-upload
            multiple
            :file-list="files.finalReport"
            :before-upload="holdFile('finalReport')"
            :remove="removeFile('finalReport')"
          >
            <a-button class="attach-btn">
              <template #icon><UploadOutlined /></template>
              Attachment
            </a-button>
          </a-upload>

          <p v-if="errors.finalReport" class="field-error">
            {{ errors.finalReport }}
          </p>
          <p v-else-if="files.finalReport.length" class="field-hint">
            <PaperClipOutlined />
            {{ files.finalReport.length }} file(s) selected
          </p>
        </div>
      </div>

      <div class="form-actions">
        <a-button @click="goHome">Cancel</a-button>
        <a-button
          type="primary"
          html-type="submit"
          class="submit-btn"
          :loading="saving"
        >
          Submit
        </a-button>
      </div>
    </form>
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
  gap: 16px;
  margin-bottom: 18px;
}

.field-label {
  width: 170px;
  flex-shrink: 0;
  padding-top: 6px;
  text-align: end;
  font-size: 14px;
  font-weight: 600;
  color: $ink;
}

.req {
  margin-inline-start: 2px;
  color: #c62828;
}

.field-control {
  flex: 1 1 auto;
  min-width: 0;
}

.full {
  width: 100%;
}

.field-hint {
  display: flex;
  align-items: center;
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

.attach-btn {
  min-width: 160px;
  text-align: start;
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

.submit-btn {
  min-width: 120px;
  background: $brand-900 !important;
  border-color: $brand-900 !important;
}

/* ---------- breakpoints ---------- */
@media (max-width: 639.98px) {
  .form-card {
    padding: 18px 14px;
  }

  .field {
    flex-direction: column;
    gap: 6px;
  }

  .field-label {
    width: auto;
    padding-top: 0;
    text-align: start;
  }
}
</style>
