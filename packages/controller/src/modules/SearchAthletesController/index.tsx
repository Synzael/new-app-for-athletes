import * as React from "react";
import { apiClient, handleApiError } from "@abb/common";

interface SearchFilters {
  sport?: string;
  minStars?: number;
  maxStars?: number;
  location?: string;
  graduationYear?: number;
  q?: string;
  limit?: number;
  offset?: number;
}

interface Props {
  filters?: SearchFilters;
  children: (data: {
    loading: boolean;
    athletes: any[];
    total: number;
    error: string | null;
    refetch: () => Promise<void>;
  }) => JSX.Element | null;
}

interface State {
  loading: boolean;
  athletes: any[];
  total: number;
  error: string | null;
}

export class SearchAthletesController extends React.Component<Props, State> {
  state: State = {
    loading: true,
    athletes: [],
    total: 0,
    error: null,
  };

  componentDidMount() {
    this.fetchAthletes();
  }

  componentDidUpdate(prevProps: Props) {
    // Refetch if filters change
    if (JSON.stringify(prevProps.filters) !== JSON.stringify(this.props.filters)) {
      this.fetchAthletes();
    }
  }

  fetchAthletes = async () => {
    this.setState({ loading: true, error: null });

    try {
      const params: any = {};

      if (this.props.filters) {
        const { sport, minStars, maxStars, location, graduationYear, q, limit, offset } = this.props.filters;

        if (sport) params.sport = sport;
        if (minStars !== undefined) params.minStars = minStars;
        if (maxStars !== undefined) params.maxStars = maxStars;
        if (location) params.location = location;
        if (graduationYear) params.graduationYear = graduationYear;
        if (q) params.q = q;
        if (limit) params.limit = limit;
        if (offset) params.offset = offset;
      }

      const endpoint = this.props.filters?.q ? "/athletes/search" : "/athletes";
      const response = await apiClient.get(endpoint, { params });

      this.setState({
        loading: false,
        athletes: response.data.athletes,
        total: response.data.total,
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
      athletes: this.state.athletes,
      total: this.state.total,
      error: this.state.error,
      refetch: this.fetchAthletes,
    });
  }
}
