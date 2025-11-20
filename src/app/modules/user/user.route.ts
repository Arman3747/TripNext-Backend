import { Router } from "express";
import { UserControllers } from "./user.controller";


const router = Router()


router.post("/register", UserControllers.createUser) //don't call
router.get("/all-users", UserControllers.getAllUsers) //don't call

export const UserRoutes = router





