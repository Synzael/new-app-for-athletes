import * as yup from "yup";

export const athleteSchema = yup.object().shape({
  firstName: yup
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(100, "First name must be at most 100 characters")
    .required("First name is required"),
  lastName: yup
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(100, "Last name must be at most 100 characters")
    .required("Last name is required"),
  primarySport: yup
    .string()
    .min(2, "Sport must be at least 2 characters")
    .max(50, "Sport must be at most 50 characters")
    .required("Primary sport is required"),
  dateOfBirth: yup.date().nullable(),
  bio: yup.string().max(1000, "Bio must be at most 1000 characters").nullable(),
  profilePictureUrl: yup.string().url("Must be a valid URL").nullable(),
  hometown: yup
    .string()
    .max(100, "Hometown must be at most 100 characters")
    .nullable(),
  highSchool: yup
    .string()
    .max(100, "High school must be at most 100 characters")
    .nullable(),
  college: yup
    .string()
    .max(100, "College must be at most 100 characters")
    .nullable(),
  graduationYear: yup
    .number()
    .integer()
    .min(1900)
    .max(2100)
    .nullable(),
  positions: yup.array().of(yup.string()).nullable(),
  heightFeet: yup
    .string()
    .max(50, "Height must be at most 50 characters")
    .nullable(),
  weight: yup.number().integer().min(50).max(500).nullable(),
  phoneNumber: yup
    .string()
    .max(100, "Phone number must be at most 100 characters")
    .nullable(),
  socialMediaLinks: yup.array().of(yup.string().url()).nullable(),
  isPublic: yup.boolean(),
});

export const updateAthleteSchema = yup.object().shape({
  firstName: yup
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(100, "First name must be at most 100 characters"),
  lastName: yup
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(100, "Last name must be at most 100 characters"),
  primarySport: yup
    .string()
    .min(2, "Sport must be at least 2 characters")
    .max(50, "Sport must be at most 50 characters"),
  dateOfBirth: yup.date().nullable(),
  bio: yup.string().max(1000, "Bio must be at most 1000 characters").nullable(),
  profilePictureUrl: yup.string().url("Must be a valid URL").nullable(),
  hometown: yup
    .string()
    .max(100, "Hometown must be at most 100 characters")
    .nullable(),
  highSchool: yup
    .string()
    .max(100, "High school must be at most 100 characters")
    .nullable(),
  college: yup
    .string()
    .max(100, "College must be at most 100 characters")
    .nullable(),
  graduationYear: yup
    .number()
    .integer()
    .min(1900)
    .max(2100)
    .nullable(),
  positions: yup.array().of(yup.string()).nullable(),
  heightFeet: yup
    .string()
    .max(50, "Height must be at most 50 characters")
    .nullable(),
  weight: yup.number().integer().min(50).max(500).nullable(),
  phoneNumber: yup
    .string()
    .max(100, "Phone number must be at most 100 characters")
    .nullable(),
  socialMediaLinks: yup.array().of(yup.string().url()).nullable(),
  isPublic: yup.boolean(),
});
