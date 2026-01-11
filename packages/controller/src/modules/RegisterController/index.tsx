import * as React from "react";
import { apiClient, handleApiError } from "@abb/common";
import { NormalizedErrorMap } from "../../types/NormalizedErrorMap";

interface Props {
  children: (data: {
    submit: (values: { email: string; password: string; role?: string }) => Promise<NormalizedErrorMap | null>;
  }) => JSX.Element | null;
}

export class RegisterController extends React.PureComponent<Props> {
  submit = async (values: { email: string; password: string; role?: string }) => {
    try {
      await apiClient.post("/auth/register", {
        email: values.email,
        password: values.password,
        role: values.role || "athlete",
      });

      return null;
    } catch (error: any) {
      const apiError = handleApiError(error);

      // Normalize errors to match expected format
      const normalizedErrors: NormalizedErrorMap = {};

      if (apiError.errors && apiError.errors.length > 0) {
        apiError.errors.forEach((err: any) => {
          normalizedErrors[err.path] = err.message;
        });
      } else {
        normalizedErrors.email = apiError.error;
      }

      return normalizedErrors;
    }
  };

  render() {
    return this.props.children({ submit: this.submit });
  }
}
