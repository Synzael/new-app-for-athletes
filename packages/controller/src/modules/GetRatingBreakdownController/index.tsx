import * as React from "react";
import { apiClient, handleApiError } from "@abb/common";

interface Props {
  athleteId: string;
  children: (data: {
    loading: boolean;
    breakdown: any | null;
    error: string | null;
    refetch: () => Promise<void>;
  }) => JSX.Element | null;
}

interface State {
  loading: boolean;
  breakdown: any | null;
  error: string | null;
}

export class GetRatingBreakdownController extends React.Component<Props, State> {
  state: State = {
    loading: true,
    breakdown: null,
    error: null,
  };

  componentDidMount() {
    this.fetchBreakdown();
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.athleteId !== this.props.athleteId) {
      this.fetchBreakdown();
    }
  }

  fetchBreakdown = async () => {
    this.setState({ loading: true, error: null });

    try {
      const response = await apiClient.get(`/ratings/${this.props.athleteId}/breakdown`);

      this.setState({
        loading: false,
        breakdown: response.data.breakdown,
        error: null,
      });
    } catch (error: any) {
      const apiError = handleApiError(error);
      this.setState({
        loading: false,
        error: apiError.error,
      });
    }
  };

  render() {
    return this.props.children({
      loading: this.state.loading,
      breakdown: this.state.breakdown,
      error: this.state.error,
      refetch: this.fetchBreakdown,
    });
  }
}
