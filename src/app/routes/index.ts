import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AuthRouters } from "../modules/auth/auth.route";
import { DivisionRoutes } from "../modules/division/division.route";

export const router = Router();

const moduleRoutes = [
  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/auth",
    route: AuthRouters,
  },
  {
    path: "/division",
    route: DivisionRoutes,
  },
//   {
//     path: "/tour",
//     route: TourRoutes,
//   },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
