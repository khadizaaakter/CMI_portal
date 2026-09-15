<script setup>
import { computed, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { message } from "ant-design-vue";
import {
  DeleteOutlined,
  EditOutlined,
  InboxOutlined,
  PlusOutlined,
  RightOutlined,
  SearchOutlined,
} from "@ant-design/icons-vue";

import MainLayout from "@/components/layouts/main_layout.vue";
import TablePagination from "@/components/common/TablePagination.vue";
import { usePagination } from "@/composables/usePagination";
import { getAccessibleBusinesses } from "@/data/business";
import {
  ROLES,
  addUser,
  getUsers,
  hasFullAccess,
  removeUser,
  updateUser,
} from "@/data/users";

const router = useRouter();

const businesses = getAccessibleBusinesses();
const businessOptions = computed(() =>
  businesses.map((b) => ({ value: b.slug, label: b.name }))
);

/* the mock store is reactive, so mutations flow straight through */
const users = computed(() => getUsers());

const search = ref("");

const businessName = (slug) =>
  businesses.find((b) => b.slug === slug)?.name || slug;

const accessLabels = (user) =>
  hasFullAccess(user.role) ? ["All"] : user.access.map(businessName);

/* ---------- search: name, user id, role, access ---------- */
const filtered = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return users.value;

  return users.value.filter((u) =>
    [u.name, u.userId, u.role, ...accessLabels(u)]
      .join(" ")
      .toLowerCase()
      .includes(q)
  );
});

const { page, pageSize, paginated } = usePagination(filtered, { pageSize: 10 });

/* ---------- password reveal (per row) ---------- */
const revealed = reactive({});
const toggleReveal = (id) => {
  revealed[id] = !revealed[id];
};

/* ---------- add / edit modal ---------- */
const modalOpen = ref(false);
const editingId = ref(null);
const saving = ref(false);

const form = reactive({
  name: "",
  userId: "",
  password: "",
  role: undefined,
  access: [],
});

const errors = reactive({});

const isEditing = computed(() => editingId.value !== null);
const accessDisabled = computed(() => hasFullAccess(form.role));

const resetForm = () => {
  Object.assign(form, {
    name: "",
    userId: "",
    password: "",
    role: undefined,
    access: [],
  });
  Object.keys(errors).forEach((k) => delete errors[k]);
};

const openAdd = () => {
  editingId.value = null;
  resetForm();
  modalOpen.value = true;
};

const openEdit = (user) => {
  editingId.value = user.id;
  Object.keys(errors).forEach((k) => delete errors[k]);
  Object.assign(form, {
    name: user.name,
    userId: user.userId,
    password: user.password,
    role: user.role,
    access: [...user.access],
  });
  modalOpen.value = true;
};

const validate = () => {
  Object.keys(errors).forEach((k) => delete errors[k]);

  if (!form.name.trim()) errors.name = "User name is required.";
  if (!form.userId.trim()) errors.userId = "User ID is required.";
  if (!form.password.trim()) errors.password = "Password is required.";
  if (!form.role) errors.role = "Select a role.";
  if (!accessDisabled.value && !form.access.length) {
    errors.access = "Select at least one business.";
  }

  return !Object.keys(errors).length;
};

const submit = () => {
  if (!validate()) return;

  saving.value = true;
  const payload = {
    name: form.name,
    userId: form.userId,
    password: form.password,
    role: form.role,
    access: form.access,
  };

  const saved = isEditing.value
    ? updateUser(editingId.value, payload)
    : addUser(payload);
  saving.value = false;

  if (!saved) {
    errors.userId = "That User ID is already taken.";
    return;
  }

  message.success(isEditing.value ? "User updated" : "User added");
  modalOpen.value = false;
};

/* ---------- delete ---------- */
const deleteUser = (user) => {
  if (!removeUser(user.id)) return;

  message.success(`${user.name} removed`);
};

const goHome = () => router.push({ name: "home" });
</script>

<template>
  <MainLayout title="Portal Control">
    <!-- ---------- breadcrumb ---------- -->
    <nav class="crumbs" aria-label="Breadcrumb">
      <button type="button" class="crumb-link" @click="goHome">Home</button>
      <RightOutlined class="crumb-sep" />
      <span class="crumb-current">Control Panel</span>
    </nav>

    <h2 class="page-title">Portal Control Panel</h2>

    <!-- ---------- toolbar ---------- -->
    <div class="toolbar">
      <div class="search-box">
        <SearchOutlined class="search-icon" />
        <input
          v-model="search"
          type="search"
          class="search-input"
          placeholder="Search: User Name, User ID, Role, Access"
          aria-label="Search portal users"
        />
      </div>

      <span v-if="search" class="result-count">
        {{ filtered.length }} of {{ users.length }}
      </span>

      <a-button type="primary" class="add-btn" @click="openAdd">
        <template #icon><PlusOutlined /></template>
        Add User
      </a-button>
    </div>

    <!-- ---------- table ---------- -->
    <div class="table-card">
      <div class="table-scroll">
        <table class="user-table">
          <thead>
            <tr>
              <th class="col-name">User Name</th>
              <th class="col-id">User ID</th>
              <th class="col-role">Role</th>
              <th class="col-access">Access Limit</th>
              <th class="col-action">Action</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="user in paginated" :key="user.id">
              <td class="cell-name">{{ user.name }}</td>
              <td class="cell-plain">{{ user.userId }}</td>

              <td class="cell-plain">
                <span class="role-tag" :class="`role-${user.role.toLowerCase()}`">
                  {{ user.role }}
                </span>
              </td>

              <td class="cell-access">
                <span
                  v-for="label in accessLabels(user)"
                  :key="label"
                  class="access-chip"
                >
                  {{ label }}
                </span>
              </td>

              <td class="cell-center">
                <div class="row-actions">
                  <button
                    type="button"
                    class="edit-link"
                    :aria-label="`Edit ${user.name}`"
                    @click="openEdit(user)"
                  >
                    <EditOutlined class="action-icon" />
                    Edit
                  </button>

                  <a-popconfirm
                    title="Remove this user from the portal?"
                    ok-text="Remove"
                    cancel-text="Cancel"
                    placement="topRight"
                    overlay-class-name="remove-popconfirm"
                    :ok-button-props="{ danger: true }"
                    @confirm="deleteUser(user)"
                  >
                    <button
                      type="button"
                      class="delete-link"
                      :aria-label="`Remove ${user.name}`"
                    >
                      <DeleteOutlined class="action-icon" />
                      Remove
                    </button>
                  </a-popconfirm>
                </div>
              </td>
            </tr>

            <tr v-if="!filtered.length">
              <td colspan="6">
                <div class="table-empty">
                  <InboxOutlined class="empty-icon" />
                  <p class="empty-title">
                    {{
                      search
                        ? `No users match “${search}”`
                        : "No portal users yet"
                    }}
                  </p>
                  <button
                    v-if="search"
                    type="button"
                    class="clear-btn"
                    @click="search = ''"
                  >
                    Clear search
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
        item-label="users"
      />
    </div>

    <!-- ---------- add / edit popup ---------- -->
    <a-modal
      v-model:open="modalOpen"
      :footer="null"
      :width="540"
      centered
      destroy-on-close
      wrap-class-name="user-modal"
      :title="isEditing ? 'Edit User' : 'Add New User'"
    >
      <form class="user-form" autocomplete="off" @submit.prevent="submit">
        <div class="field">
          <label class="field-label" for="user-name">
            User Name<span class="req">*</span>
          </label>
          <a-input
            id="user-name"
            v-model:value="form.name"
            placeholder="e.g. ACI CB Hygiene"
          />
          <p v-if="errors.name" class="field-error">{{ errors.name }}</p>
        </div>

        <div class="field">
          <label class="field-label" for="user-login">
            User ID<span class="req">*</span>
          </label>
          <a-input
            id="user-login"
            v-model:value="form.userId"
            name="portal-user-login"
            autocomplete="off"
            placeholder="Login id"
          />
          <p v-if="errors.userId" class="field-error">{{ errors.userId }}</p>
        </div>

        <div class="field">
          <label class="field-label" for="user-password">
            Password<span class="req">*</span>
          </label>
          <a-input-password
            id="user-password"
            v-model:value="form.password"
            name="portal-user-password"
            autocomplete="new-password"
            placeholder="Password"
          />
          <p v-if="errors.password" class="field-error">{{ errors.password }}</p>
        </div>

        <div class="field">
          <label class="field-label" for="user-role">
            Role<span class="req">*</span>
          </label>
          <a-select
            id="user-role"
            v-model:value="form.role"
            class="full"
            placeholder="Select role"
            :options="ROLES.map((r) => ({ value: r, label: r }))"
          />
          <p v-if="errors.role" class="field-error">{{ errors.role }}</p>
        </div>

        <div class="field">
          <label class="field-label" for="user-access">
            Access Limit<span v-if="!accessDisabled" class="req">*</span>
          </label>
          <a-select
            id="user-access"
            v-model:value="form.access"
            class="full"
            mode="multiple"
            :disabled="accessDisabled"
            :placeholder="
              accessDisabled
                ? 'Admins can access all businesses'
                : 'Select businesses'
            "
            :options="businessOptions"
          />
          <p v-if="errors.access" class="field-error">{{ errors.access }}</p>
          <p v-else-if="accessDisabled" class="field-hint">
            Admin role always has access to every business.
          </p>
        </div>

        <div class="form-actions">
          <a-button @click="modalOpen = false">Cancel</a-button>
          <a-button
            type="primary"
            html-type="submit"
            class="submit-btn"
            :loading="saving"
          >
            {{ isEditing ? "Save Changes" : "Add User" }}
          </a-button>
        </div>
      </form>
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

.page-title {
  margin: 0 0 16px;
  font-size: clamp(17px, 2.6vw, 22px);
  font-weight: 700;
  letter-spacing: -0.015em;
  color: $ink;
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
  flex: 1 1 auto;
  max-width: 520px;
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
}

.result-count {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 600;
  color: #000;
}

.add-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 38px;
  flex-shrink: 0;
  margin-inline-start: auto;
  padding: 0 18px;
  border: none !important;
  border-radius: 10px;
  background: $brand-900 !important;
  color: #fff !important;
  font-size: 13.5px;
  font-weight: 600;
  box-shadow: 0 10px 22px -12px rgba(13, 71, 161, 0.95);
  transition: background 0.22s ease, transform 0.18s ease;

  &:hover,
  &:focus-visible {
    background: $brand-500 !important;
    color: #fff !important;
  }

  &:active {
    transform: scale(0.97);
  }
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

.user-table {
  width: 100%;
  min-width: 900px;
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

.col-name {
  min-width: 220px;
}

.col-id,
.col-pass,
.col-role {
  width: 160px;
}

.col-access {
  min-width: 220px;
}

.col-action {
  width: 200px;
  text-align: center !important;
}

.cell-name {
  font-weight: 600;
}

.cell-plain {
  white-space: nowrap;
}

.cell-center {
  text-align: center;
}

.cell-pass {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.pass-text {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 13px;
  letter-spacing: 0.04em;
}

.pass-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: $brand-700;
  font-size: 13px;
  cursor: pointer;

  &:hover {
    background: $brand-50;
  }
}

.role-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
  background: #eceff1;
  color: #455a64;

  &.role-admin {
    background: #e8f5e9;
    color: #2e7d32;
  }

  &.role-cmi {
    background: $brand-50;
    color: $brand-700;
  }

  &.role-user {
    background: #fff3e0;
    color: #e65100;
  }
}

.cell-access {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.access-chip {
  padding: 2px 9px;
  border: 1px solid #bcdffb;
  border-radius: 4px;
  background: $brand-50;
  font-size: 12px;
  font-weight: 600;
  color: $brand-700;
}

.row-actions {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.edit-link,
.delete-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 4px;
  background: #ffffff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.edit-link {
  border: 1px solid $brand-200;
  color: $brand-900;

  &:hover {
    background: $brand-50;
    border-color: $brand-500;
  }
}

.delete-link {
  border: 1px solid #f3b7b0;
  color: #c62828;

  &:hover {
    background: #ffebee;
    border-color: #e57373;
  }
}

.action-icon {
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

/* ---------- modal form ---------- */
.user-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-top: 4px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 13px;
  font-weight: 600;
  color: $ink;
}

.req {
  margin-inline-start: 2px;
  color: #c62828;
}

.full {
  width: 100%;
}

.field-hint {
  margin: 0;
  font-size: 11.5px;
  color: $muted;
}

.field-error {
  margin: 0;
  font-size: 11.5px;
  color: #c62828;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 6px;
  padding-top: 16px;
  border-top: 1px solid $border;
}

.submit-btn {
  min-width: 130px;
  background: $brand-900 !important;
  border-color: $brand-900 !important;
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

  .add-btn {
    margin-inline-start: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .edit-link,
  .delete-link,
  .search-input {
    transition-duration: 0.01ms;
  }
}
</style>

<style lang="scss">
/* modal renders outside the component scope */
.user-modal {
  .ant-modal-content {
    border-radius: 18px;
    padding: 20px 22px 22px;
    box-shadow: 0 30px 70px -32px rgba(13, 71, 161, 0.6);
  }

  .ant-modal-header {
    margin-bottom: 14px;
    padding-bottom: 14px;
    border-bottom: 1px solid #e7effb;
  }

  .ant-modal-title {
    font-size: 16px;
    font-weight: 700;
    color: #0d2f5e;
  }
}

/* popconfirm renders outside the component scope */
.remove-popconfirm {
  .ant-popconfirm-buttons .ant-btn-primary {
    background: #c62828 !important;
    border-color: #c62828 !important;
    color: #fff !important;
    box-shadow: none;

    &:hover,
    &:focus-visible {
      background: #e53935 !important;
      border-color: #e53935 !important;
    }
  }

  .ant-popconfirm-buttons .ant-btn-default {
    border-color: #dfe4ea;
    color: #0d2f5e;

    &:hover {
      border-color: #90caf9;
      color: #1565c0;
    }
  }
}
</style>
