import React, { useEffect, useRef, useState } from "react";
import { Card, Button } from "react-bootstrap";

const FavoriteCard = ({ job, navigate, toggleFavorite, handleApplyClick, favorites }) => {
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const isFavorited = favorites ? favorites.includes(job.id) : false;

  useEffect(() => {
    const currentCard = cardRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (currentCard) {
      observer.observe(currentCard);
    }

    return () => {
      if (currentCard) {
        observer.unobserve(currentCard);
      }
    };
  }, []);

  return (
    <Card
      ref={cardRef}
      className={`h-100 shadow-sm position-relative card-animate ${
        isVisible ? "visible" : ""
      }`}
    >
      <div
        className="favorite-icon"
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(job.id);
        }}
        data-favorited={isFavorited}
        title={isFavorited ? "Bỏ yêu thích" : "Thêm yêu thích"}
      >
        <i className={isFavorited ? "bi bi-heart-fill" : "bi bi-heart"}></i>
        {job.favorite_count > 0 && (
          <span className="favorite-count-badge">{job.favorite_count}</span>
        )}
      </div>

      <Card.Body
        onClick={() => navigate(`/job-detail/${job.id}`)}
        style={{ cursor: "pointer", display: "flex", flexDirection: "column" }}
      >
        <Card.Title className="text-center">{job.title}</Card.Title>
        <Card.Text className="job-description">
          <strong>Vị trí công việc:</strong> {job.job_position || "Chưa có"}
          <br />
          <strong>Trạng thái làm việc:</strong>{" "}
          {job.employment_type || "Chưa có"}
          <br />
          <strong>Tên công ty:</strong> {job.company_name || "Chưa có"}
          <br />
          <strong>Địa chỉ:</strong> {job.location || "Chưa có"}
          <br />
          <strong>Mức lương:</strong>{" "}
          {job.salary
            ? `${parseInt(job.salary, 10).toLocaleString("vi-VN")} VND`
            : "Chưa có"}
          <br />
          <strong>Ngày hết hạn:</strong>{" "}
          {job.expiry_date
            ? new Date(job.expiry_date).toLocaleDateString()
            : "Chưa có"}
        </Card.Text>
      </Card.Body>

      <Card.Footer className="d-flex justify-content-between">
        <Button
          variant="info"
          onClick={() => navigate(`/job-detail/${job.id}`)}
        >
          Xem chi tiết
        </Button>
        <Button variant="success" onClick={() => handleApplyClick(job)}>
          Ứng tuyển
        </Button>
      </Card.Footer>
    </Card>
  );
};

export default FavoriteCard;