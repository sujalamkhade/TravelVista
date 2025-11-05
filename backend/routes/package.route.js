import express from "express";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import {
  braintreeeeeeTokenController,
  createPackage,
  deletePackage,
  getPackageData,
  getPackages,
  updatePackage,
} from "../controllers/package.controller.js";

const router = express.Router();

//create package
router.post("/create-package", requireSignIn, isAdmin, createPackage);

//update package by id
router.post("/update-package/:id", requireSignIn, isAdmin, updatePackage);

//delete package by id
router.delete("/delete-package/:id", requireSignIn, isAdmin, deletePackage);

//get all packages
router.get("/get-packages", getPackages);

//get single package data by id
router.get("/get-package-data/:id", getPackageData);

//payments routes
//token
router.get("/braintreeeeee/token", braintreeeeeeTokenController);

export default router;
