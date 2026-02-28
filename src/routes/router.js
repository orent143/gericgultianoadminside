import { createRouter, createWebHistory } from "vue-router";
import Home from "@/pages/Home.vue";
import Skills from "@/pages/Skills.vue";
import Projects from "@/pages/Projects.vue";
import Contacts from "@/pages/Contacts.vue";

const routes = [
  { path: "/", component: Home, meta: { title: "Dashboard" } },
  { path: "/projects", component: Projects, meta: { title: "Projects" } },
  { path: "/skills", component: Skills, meta: { title: "Skills" } },
  { path: "/education", component: Contacts, meta: { title: "Education & Certifications" } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

