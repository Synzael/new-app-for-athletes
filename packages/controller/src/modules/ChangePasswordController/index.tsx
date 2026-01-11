import * as React from "react";
import { apiClient, handleApiError } from "@abb/common";
import { NormalizedErrorMap } from "../../types/NormalizedErrorMap";

interface Props {
  children: (data: {
    submit: (values: { newPassword: string; key: string }) => Promise<NormalizedErrorMap | null>;
  }) => JSX.Element | null;
}

export class ChangePasswordController extends React.PureComponent<Props> {
  submit = async (values: { newPassword: string; key: string }) => {
    try {
      await apiClient.post("/auth/reset-password", {
        newPassword: values.newPassword,
        token: values.key,
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
        normalizedErrors.newPassword = apiError.error;
      }

      return normalizedErrors;
    }
  };

  render() {
    return this.props.children({ submit: this.submit });
  }
}
