import * as React from "react";
import { apiClient, handleApiError } from "@abb/common";

interface Props {
  children: (data: {
    submit: (values: { email: string }) => Promise<null>;
  }) => JSX.Element | null;
}

export class ForgotPasswordController extends React.PureComponent<Props> {
  submit = async (values: { email: string }) => {
    try {
      await apiClient.post("/auth/forgot-password", {
        email: values.email,
      });

      return null;
    } catch (error: any) {
      // Don't reveal errors for security
      console.error("Forgot password error:", handleApiError(error));
      return null;
    }
  };

  render() {
    return this.props.children({ submit: this.submit });
  }
}
