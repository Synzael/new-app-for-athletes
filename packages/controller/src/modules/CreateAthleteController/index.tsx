import * as React from "react";
import { apiClient, handleApiError } from "@abb/common";
import { NormalizedErrorMap } from "../../types/NormalizedErrorMap";

interface AthleteInput {
  firstName: string;
  lastName: string;
  primarySport: string;
  dateOfBirth?: Date;
  bio?: string;
  profilePictureUrl?: string;
  hometown?: string;
  highSchool?: string;
  college?: string;
  graduationYear?: number;
  positions?: string[];
  heightFeet?: string;
  weight?: number;
  phoneNumber?: string;
  socialMediaLinks?: string[];
  performanceScore?: number;
  physicalScore?: number;
  academicScore?: number;
  socialScore?: number;
  evaluationScore?: number;
  isPublic?: boolean;
}

interface Props {
  children: (data: {
    submit: (values: AthleteInput) => Promise<{ errors: NormalizedErrorMap | null; athlete?: any }>;
  }) => JSX.Element | null;
}

export class CreateAthleteController extends React.PureComponent<Props> {
  submit = async (values: AthleteInput) => {
    try {
      const response = await apiClient.post("/athletes", values);

      return {
        errors: null,
        athlete: response.data.athlete,
      };
    } catch (error: any) {
      const apiError = handleApiError(error);

      // Normalize errors to match expected format
      const normalizedErrors: NormalizedErrorMap = {};

      if (apiError.errors && apiError.errors.length > 0) {
        apiError.errors.forEach((err: any) => {
          normalizedErrors[err.path] = err.message;
        });
      } else {
        normalizedErrors.general = apiError.error;
      }

      return { errors: normalizedErrors };
    }
  };

  render() {
    return this.props.children({ submit: this.submit });
  }
}
