import * as React from "react";
import { Card, Row, Col, Select, Input, Slider, Spin, Empty } from "antd";
import { SearchAthletesController } from "@abb/controller";
import { Link } from "react-router-dom";

const { Option } = Select;
const { Search } = Input;

interface State {
  sport: string;
  minStars: number;
  maxStars: number;
  searchQuery: string;
  location: string;
}

export class AthleteDirectory extends React.Component<{}, State> {
  state: State = {
    sport: "",
    minStars: 0,
    maxStars: 5,
    searchQuery: "",
    location: "",
  };

  renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div style={{ color: "#fadb14", fontSize: "18px" }}>
        {"★".repeat(fullStars)}
        {hasHalfStar && "½"}
        {"☆".repeat(emptyStars)}
        <span style={{ marginLeft: "8px", color: "#666", fontSize: "14px" }}>
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  renderAthleteCard = (athlete: any) => {
    return (
      <Col key={athlete.id} xs={24} sm={12} md={8} lg={6}>
        <Link to={`/athletes/${athlete.id}`}>
          <Card
            hoverable
            cover={
              athlete.profilePictureUrl ? (
                <img
                  alt={`${athlete.firstName} ${athlete.lastName}`}
                  src={athlete.profilePictureUrl}
                  style={{ height: 200, objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    height: 200,
                    background: "#f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 48,
                    color: "#999",
                  }}
                >
                  {athlete.firstName[0]}
                  {athlete.lastName[0]}
                </div>
              )
            }
          >
            <Card.Meta
              title={`${athlete.firstName} ${athlete.lastName}`}
              description={
                <div>
                  <div style={{ marginBottom: 8 }}>
                    <strong>{athlete.primarySport}</strong>
                    {athlete.positions && athlete.positions.length > 0 && (
                      <span style={{ color: "#666", marginLeft: 8 }}>
                        {athlete.positions.join(", ")}
                      </span>
                    )}
                  </div>
                  {this.renderStars(athlete.starRating)}
                  {athlete.graduationYear && (
                    <div style={{ marginTop: 8, color: "#999" }}>
                      Class of {athlete.graduationYear}
                    </div>
                  )}
                  {athlete.hometown && (
                    <div style={{ color: "#999" }}>{athlete.hometown}</div>
                  )}
                </div>
              }
            />
          </Card>
        </Link>
      </Col>
    );
  };

  render() {
    const { sport, minStars, maxStars, searchQuery, location } = this.state;

    const filters: any = {};
    if (sport) filters.sport = sport;
    if (minStars > 0 || maxStars < 5) {
      filters.minStars = minStars;
      filters.maxStars = maxStars;
    }
    if (searchQuery) filters.q = searchQuery;
    if (location) filters.location = location;

    return (
      <div style={{ padding: "24px" }}>
        <h1 style={{ marginBottom: 24 }}>Athlete Directory</h1>

        {/* Filters */}
        <Card style={{ marginBottom: 24 }}>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={6}>
              <div style={{ marginBottom: 8 }}>Search by Name:</div>
              <Search
                placeholder="Search athletes..."
                onSearch={(value) => this.setState({ searchQuery: value })}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={{ marginBottom: 8 }}>Sport:</div>
              <Select
                style={{ width: "100%" }}
                placeholder="Select sport"
                allowClear
                onChange={(value) => this.setState({ sport: value || "" })}
              >
                <Option value="Football">Football</Option>
                <Option value="Basketball">Basketball</Option>
                <Option value="Baseball">Baseball</Option>
                <Option value="Soccer">Soccer</Option>
                <Option value="Track & Field">Track & Field</Option>
                <Option value="Swimming">Swimming</Option>
                <Option value="Volleyball">Volleyball</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={{ marginBottom: 8 }}>Location:</div>
              <Input
                placeholder="City or State"
                value={location}
                onChange={(e) => this.setState({ location: e.target.value })}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={{ marginBottom: 8 }}>
                Star Rating: {minStars} - {maxStars} ★
              </div>
              <Slider
                range
                min={0}
                max={5}
                step={0.5}
                value={[minStars, maxStars]}
                onChange={(value: number[]) =>
                  this.setState({ minStars: value[0], maxStars: value[1] })
                }
              />
            </Col>
          </Row>
        </Card>

        {/* Athletes Grid */}
        <SearchAthletesController filters={filters}>
          {({ loading, athletes, total, error }) => {
            if (loading) {
              return (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <Spin size="large" />
                </div>
              );
            }

            if (error) {
              return (
                <Card>
                  <div style={{ color: "red" }}>Error: {error}</div>
                </Card>
              );
            }

            if (athletes.length === 0) {
              return (
                <Card>
                  <Empty description="No athletes found matching your criteria" />
                </Card>
              );
            }

            return (
              <div>
                <div style={{ marginBottom: 16 }}>
                  <strong>{total}</strong> athletes found
                </div>
                <Row gutter={[16, 16]}>{athletes.map(this.renderAthleteCard)}</Row>
              </div>
            );
          }}
        </SearchAthletesController>
      </div>
    );
  }
}
