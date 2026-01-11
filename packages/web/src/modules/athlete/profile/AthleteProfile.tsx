import * as React from "react";
import { Card, Row, Col, Tag, Spin, Divider, Progress } from "antd";
import { ViewAthleteController, GetRatingBreakdownController } from "@abb/controller";
import { RouteComponentProps } from "react-router-dom";

interface MatchParams {
  id: string;
}

export class AthleteProfile extends React.Component<RouteComponentProps<MatchParams>> {
  renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div style={{ color: "#fadb14", fontSize: "32px" }}>
        {"★".repeat(fullStars)}
        {hasHalfStar && "½"}
        {"☆".repeat(emptyStars)}
        <span style={{ marginLeft: "12px", fontSize: "24px", color: "#333" }}>
          {rating.toFixed(1)} Stars
        </span>
      </div>
    );
  };

  renderRatingBreakdown = (breakdown: any) => {
    const components = [
      { key: "performance", label: "Performance", color: "#52c41a" },
      { key: "physical", label: "Physical", color: "#1890ff" },
      { key: "academic", label: "Academic", color: "#722ed1" },
      { key: "social", label: "Social", color: "#fa8c16" },
      { key: "evaluation", label: "Evaluation", color: "#eb2f96" },
    ];

    return (
      <Card title="Rating Breakdown" style={{ marginTop: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <strong>Overall Score:</strong> {breakdown.compositeScore.toFixed(2)} / 100
        </div>
        <div style={{ marginBottom: 16 }}>
          <strong>Tier:</strong> <Tag color="blue">{breakdown.tier}</Tag>
        </div>
        <Divider />
        {components.map((comp) => {
          const data = breakdown.components[comp.key];
          return (
            <div key={comp.key} style={{ marginBottom: 16 }}>
              <Row justify="space-between" style={{ marginBottom: 4 }}>
                <Col>
                  <strong>{comp.label}</strong> ({data.weight}% weight)
                </Col>
                <Col>{data.score.toFixed(0)} / 100</Col>
              </Row>
              <Progress
                percent={data.score}
                strokeColor={comp.color}
                showInfo={false}
              />
              <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
                Contributes {data.contribution.toFixed(2)} points to overall score
              </div>
            </div>
          );
        })}
      </Card>
    );
  };

  render() {
    const { id } = this.props.match.params;

    return (
      <ViewAthleteController athleteId={id}>
        {({ loading, athlete, error }) => {
          if (loading) {
            return (
              <div style={{ textAlign: "center", padding: "80px" }}>
                <Spin size="large" />
              </div>
            );
          }

          if (error) {
            return (
              <Card>
                <div style={{ color: "red", textAlign: "center", padding: "40px" }}>
                  Error: {error}
                </div>
              </Card>
            );
          }

          if (!athlete) {
            return (
              <Card>
                <div style={{ textAlign: "center", padding: "40px" }}>
                  Athlete not found
                </div>
              </Card>
            );
          }

          return (
            <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
              <Card>
                <Row gutter={24}>
                  <Col xs={24} md={8}>
                    {athlete.profilePictureUrl ? (
                      <img
                        src={athlete.profilePictureUrl}
                        alt={`${athlete.firstName} ${athlete.lastName}`}
                        style={{
                          width: "100%",
                          borderRadius: "8px",
                          marginBottom: "16px",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "300px",
                          background: "#f0f0f0",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "80px",
                          color: "#999",
                          marginBottom: "16px",
                        }}
                      >
                        {athlete.firstName[0]}
                        {athlete.lastName[0]}
                      </div>
                    )}

                    {this.renderStars(athlete.starRating)}
                  </Col>

                  <Col xs={24} md={16}>
                    <h1>
                      {athlete.firstName} {athlete.lastName}
                    </h1>

                    <div style={{ fontSize: "18px", marginBottom: "16px" }}>
                      <Tag color="blue" style={{ fontSize: "16px" }}>
                        {athlete.primarySport}
                      </Tag>
                      {athlete.positions &&
                        athlete.positions.map((pos: string) => (
                          <Tag key={pos}>{pos}</Tag>
                        ))}
                    </div>

                    {athlete.bio && (
                      <div style={{ marginBottom: "16px" }}>
                        <p>{athlete.bio}</p>
                      </div>
                    )}

                    <Row gutter={16}>
                      {athlete.graduationYear && (
                        <Col span={12}>
                          <strong>Class:</strong> {athlete.graduationYear}
                        </Col>
                      )}
                      {athlete.heightFeet && (
                        <Col span={12}>
                          <strong>Height:</strong> {athlete.heightFeet}
                        </Col>
                      )}
                      {athlete.weight && (
                        <Col span={12}>
                          <strong>Weight:</strong> {athlete.weight} lbs
                        </Col>
                      )}
                      {athlete.hometown && (
                        <Col span={12}>
                          <strong>Hometown:</strong> {athlete.hometown}
                        </Col>
                      )}
                      {athlete.highSchool && (
                        <Col span={12}>
                          <strong>High School:</strong> {athlete.highSchool}
                        </Col>
                      )}
                      {athlete.college && (
                        <Col span={12}>
                          <strong>College:</strong> {athlete.college}
                        </Col>
                      )}
                    </Row>

                    {athlete.socialMediaLinks &&
                      athlete.socialMediaLinks.length > 0 && (
                        <div style={{ marginTop: "16px" }}>
                          <strong>Social Media:</strong>
                          <div>
                            {athlete.socialMediaLinks.map((link: string, idx: number) => (
                              <a
                                key={idx}
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ marginRight: "12px" }}
                              >
                                {link}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                  </Col>
                </Row>
              </Card>

              {/* Rating Breakdown */}
              <GetRatingBreakdownController athleteId={id}>
                {({ loading: breakdownLoading, breakdown, error: breakdownError }) => {
                  if (breakdownLoading) {
                    return (
                      <Card style={{ marginTop: 24, textAlign: "center" }}>
                        <Spin />
                      </Card>
                    );
                  }

                  if (breakdownError || !breakdown) {
                    return null;
                  }

                  return this.renderRatingBreakdown(breakdown);
                }}
              </GetRatingBreakdownController>

              {/* Performance Stats */}
              {athlete.performanceStats && athlete.performanceStats.length > 0 && (
                <Card title="Performance Stats" style={{ marginTop: 24 }}>
                  <Row gutter={[16, 16]}>
                    {athlete.performanceStats.map((stat: any) => (
                      <Col key={stat.id} xs={24} sm={12} md={8}>
                        <Card type="inner">
                          <div style={{ fontSize: "16px", fontWeight: "bold" }}>
                            {stat.statName}
                          </div>
                          <div style={{ fontSize: "24px", color: "#1890ff" }}>
                            {stat.statValue} {stat.unit}
                          </div>
                          {stat.eventName && (
                            <div style={{ fontSize: "12px", color: "#999" }}>
                              {stat.eventName}
                            </div>
                          )}
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Card>
              )}

              {/* Videos */}
              {athlete.videos && athlete.videos.length > 0 && (
                <Card title="Highlight Videos" style={{ marginTop: 24 }}>
                  <Row gutter={[16, 16]}>
                    {athlete.videos.map((video: any) => (
                      <Col key={video.id} xs={24} sm={12} md={8}>
                        <Card
                          type="inner"
                          title={video.title || "Highlight"}
                          extra={
                            video.videoType && <Tag>{video.videoType}</Tag>
                          }
                        >
                          {video.description && <p>{video.description}</p>}
                          <a
                            href={video.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Watch Video
                          </a>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Card>
              )}
            </div>
          );
        }}
      </ViewAthleteController>
    );
  }
}
