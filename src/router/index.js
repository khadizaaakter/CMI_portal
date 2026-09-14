import { createRouter, createWebHistory } from "vue-router";

import { useLoginStore } from "@/stores/login";
import Login from "@/views/Login.vue";
import Home from "@/views/Home.vue";
import BusinessDetail from "@/views/BusinessDetail.vue";
import ControlPanel from "@/views/ControlPanel.vue";
import EditReport from "@/views/EditReport.vue";
import UploadNew from "@/views/UploadNew.vue";

const routes = [
  {
    path: "/",
    name: "login",
    component: Login,
  },

  {
    path: "/home",
    name: "home",
    component: Home,
  },
  {
    path: "/upload",
    name: "upload-new",
    component: UploadNew,
  },
  {
    path: "/control-panel",
    name: "control-panel",
    component: ControlPanel,
  },
  {
    path: "/business/:slug",
    name: "business-detail",
    component: BusinessDetail,
  },
  {
    path: "/business/:slug/report/:id/edit",
    name: "edit-report",
    component: EditReport,
  },

  {
    path: "/:catchAll(.*)",
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to) => {
  const loginStore = useLoginStore();

  if (to.meta.requiresAuth && !loginStore.isLoggedIn) {
    return { name: "login" };
  }

  if (to.name === "login" && loginStore.isLoggedIn) {
    return { name: "home" };
  }
});

export default router;
