import * as yup from "yup";

export const ratingSchema = yup.object().shape({
  performanceScore: yup
    .number()
    .min(0, "Performance score must be between 0 and 100")
    .max(100, "Performance score must be between 0 and 100")
    .required("Performance score is required"),
  physicalScore: yup
    .number()
    .min(0, "Physical score must be between 0 and 100")
    .max(100, "Physical score must be between 0 and 100")
    .required("Physical score is required"),
  academicScore: yup
    .number()
    .min(0, "Academic score must be between 0 and 100")
    .max(100, "Academic score must be between 0 and 100")
    .required("Academic score is required"),
  socialScore: yup
    .number()
    .min(0, "Social score must be between 0 and 100")
    .max(100, "Social score must be between 0 and 100")
    .required("Social score is required"),
  evaluationScore: yup
    .number()
    .min(0, "Evaluation score must be between 0 and 100")
    .max(100, "Evaluation score must be between 0 and 100")
    .required("Evaluation score is required"),
});

export const updateRatingSchema = yup.object().shape({
  performanceScore: yup
    .number()
    .min(0, "Performance score must be between 0 and 100")
    .max(100, "Performance score must be between 0 and 100"),
  physicalScore: yup
    .number()
    .min(0, "Physical score must be between 0 and 100")
    .max(100, "Physical score must be between 0 and 100"),
  academicScore: yup
    .number()
    .min(0, "Academic score must be between 0 and 100")
    .max(100, "Academic score must be between 0 and 100"),
  socialScore: yup
    .number()
    .min(0, "Social score must be between 0 and 100")
    .max(100, "Social score must be between 0 and 100"),
  evaluationScore: yup
    .number()
    .min(0, "Evaluation score must be between 0 and 100")
    .max(100, "Evaluation score must be between 0 and 100"),
});
