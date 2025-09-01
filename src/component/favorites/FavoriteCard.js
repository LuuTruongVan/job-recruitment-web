import React, { useEffect, useRef, useState } from "react";
import { Card, Button } from "react-bootstrap";

const FavoriteCard = ({ job, navigate, toggleFavorite, handleApplyClick }) => {
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const currentCard = cardRef.current; // ✅ Giải pháp fix warning

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

    // ✅ Dùng biến currentCard thay vì cardRef.current
    return () => {
      if (currentCard) {
        observer.unobserve(currentCard);
      }
    };
  }, []); // Không cần thêm cardRef vào dependencies

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
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          cursor: "pointer",
          color: "red",
          background: "rgba(255,255,255,0.9)",
          padding: "4px 8px",
          borderRadius: "20px",
          fontSize: "14px",
          zIndex: 10,
        }}
        title="Bỏ yêu thích"
      >
        <i className="bi bi-heart-fill"></i>
      </div>

      <Card.Body
        onClick={() => navigate(`/job-detail/${job.id}`)}
        style={{ cursor: "pointer", display: "flex", flexDirection: "column" }}
      >
        <Card.Title className="text-center">{job.title}</Card.Title>
        <Card.Text className="job-description">
          <strong>Vị trí công việc:</strong> {job.job_position}
          <br />
          <strong>Trạng thái làm việc:</strong>{" "}
          {job.employment_type || "Chưa có"}
          <br />
          <strong>Tên công ty:</strong> {job.company_name || "Chưa có"}
          <br />
          <strong>Địa chỉ:</strong> {job.location}
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
