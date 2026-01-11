import * as React from "react";
import { apiClient } from "@abb/common";

interface Props {
  children: (data: {
    logout: () => Promise<void>;
  }) => JSX.Element | null;
}

export class LogoutController extends React.PureComponent<Props> {
  logout = async () => {
    try {
      await apiClient.post("/auth/logout");
      // Redirect to login page after logout
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Still redirect even on error
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  };

  render() {
    return this.props.children({ logout: this.logout });
  }
}
