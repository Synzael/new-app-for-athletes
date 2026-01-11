import * as React from "react";
import { apiClient, handleApiError } from "@abb/common";

interface Props {
  athleteId: string;
  children: (data: {
    loading: boolean;
    athlete: any | null;
    error: string | null;
    refetch: () => Promise<void>;
  }) => JSX.Element | null;
}

interface State {
  loading: boolean;
  athlete: any | null;
  error: string | null;
}

export class ViewAthleteController extends React.Component<Props, State> {
  state: State = {
    loading: true,
    athlete: null,
    error: null,
  };

  componentDidMount() {
    this.fetchAthlete();
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.athleteId !== this.props.athleteId) {
      this.fetchAthlete();
    }
  }

  fetchAthlete = async () => {
    this.setState({ loading: true, error: null });

    try {
      const response = await apiClient.get(`/athletes/${this.props.athleteId}`);

      this.setState({
        loading: false,
        athlete: response.data.athlete,
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
      athlete: this.state.athlete,
      error: this.state.error,
      refetch: this.fetchAthlete,
    });
  }
}
