import * as React from "react";
import { apiClient, handleApiError } from "@abb/common";
import { NormalizedErrorMap } from "../../types/NormalizedErrorMap";

interface Props {
  onSessionId?: (sessionId: string) => void;
  children: (data: {
    submit: (values: { email: string; password: string }) => Promise<NormalizedErrorMap | null>;
  }) => JSX.Element | null;
}

export class LoginController extends React.PureComponent<Props> {
  submit = async (values: { email: string; password: string }) => {
    try {
      const response = await apiClient.post("/auth/login", {
        email: values.email,
        password: values.password,
      });

      // Session is managed via cookies, no need to handle sessionId
      if (this.props.onSessionId) {
        // For backward compatibility, call with user ID if needed
        this.props.onSessionId(response.data.user.id);
      }

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
