import { createRouter, createWebHistory } from "vue-router";
import BookingView from "./views/BookingView.vue";
import AdminView from "./views/AdminView.vue";

const routes = [
  { path: "/", component: BookingView },
  { path: "/admin", component: AdminView },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
