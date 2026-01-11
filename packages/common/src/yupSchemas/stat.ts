import * as yup from "yup";

export const statSchema = yup.object().shape({
  statName: yup
    .string()
    .min(2, "Stat name must be at least 2 characters")
    .max(100, "Stat name must be at most 100 characters")
    .required("Stat name is required"),
  statValue: yup
    .string()
    .min(1, "Stat value is required")
    .max(50, "Stat value must be at most 50 characters")
    .required("Stat value is required"),
  unit: yup
    .string()
    .max(50, "Unit must be at most 50 characters")
    .nullable(),
  recordedDate: yup.date().nullable(),
  eventName: yup
    .string()
    .max(100, "Event name must be at most 100 characters")
    .nullable(),
});

export const updateStatSchema = yup.object().shape({
  statName: yup
    .string()
    .min(2, "Stat name must be at least 2 characters")
    .max(100, "Stat name must be at most 100 characters"),
  statValue: yup
    .string()
    .min(1, "Stat value is required")
    .max(50, "Stat value must be at most 50 characters"),
  unit: yup
    .string()
    .max(50, "Unit must be at most 50 characters")
    .nullable(),
  recordedDate: yup.date().nullable(),
  eventName: yup
    .string()
    .max(100, "Event name must be at most 100 characters")
    .nullable(),
});
