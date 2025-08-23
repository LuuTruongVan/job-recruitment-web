import { useState, useEffect } from "react";
import { getCandidateApplications, cancelApplication } from "../services/applications.service";

export const useApplications = () => {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      const candidateToken = localStorage.getItem("candidate_token");
      if (!candidateToken) {
        setError("Vui lòng đăng nhập với vai trò ứng viên.");
        return;
      }

      try {
        const res = await getCandidateApplications(candidateToken);
        setApplications(res.data);
      } catch (err) {
        console.error("Error fetching applications:", err);
        setError("Không thể tải danh sách ứng tuyển.");
      }
    };

    fetchApplications();
  }, []);

  const handleCancelApplication = async (id) => {
    const candidateToken = localStorage.getItem("candidate_token");
    if (!candidateToken) {
      alert("Vui lòng đăng nhập để hủy ứng tuyển!");
      return;
    }

    try {
      await cancelApplication(id, candidateToken);
      setApplications((prev) => prev.filter((app) => app.id !== id));
      alert("Hủy ứng tuyển thành công!");
    } catch (err) {
      console.error("Error canceling application:", err);
      alert("Không thể hủy ứng tuyển, vui lòng thử lại!");
    }
  };

  const translateStatus = (status) => {
    switch (status) {
      case "approved":
        return "Đã duyệt";
      case "rejected":
        return "Đã từ chối";
      case "pending":
      default:
        return "Đang chờ";
    }
  };

  return { applications, error, translateStatus, handleCancelApplication };
};
