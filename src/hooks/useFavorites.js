import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getFavorites,
  toggleFavorite as toggleFavoriteService,
  getJobPosition,
  getUserProfile,
  applyJob,
} from "../services/favorite.service";

export const useFavorites = () => {
  const [jobs, setJobs] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyMessage, setApplyMessage] = useState("");
  const [formData, setFormData] = useState({
    candidate_name: "",
    phone: "",
    email: "",
    address: "",
    skills: "",
    introduction: "",
    cv: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const token =
    localStorage.getItem("candidate_token") ||
    localStorage.getItem("employer_token") ||
    localStorage.getItem("admin_token") ||
    "";

  // Lấy danh sách jobs yêu thích
  const fetchFavorites = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await getFavorites(token);
      const jobsData = res.data;

      // Gán thông tin vị trí
      const jobsWithPositions = await Promise.all(
        jobsData.map(async (job) => {
          if (job.job_position_id) {
            try {
              const positionResponse = await getJobPosition(job.job_position_id, token);
              job.job_position = positionResponse.data.name || "Chưa có vị trí";
            } catch {
              job.job_position = "Chưa có vị trí";
            }
          } else {
            job.job_position = "Chưa có vị trí";
          }
          return job;
        })
      );

      setJobs(jobsWithPositions);
    } catch (err) {
      console.error("Error fetching favorites:", err);
      setError("Không thể tải danh sách yêu thích.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Lấy thông tin user
  useEffect(() => {
    if (!token) return;
    getUserProfile(token)
      .then((res) => setUser(res.data))
      .catch(() => setUser(null));

    fetchFavorites();
  }, [fetchFavorites, token]);

  // Toggle favorite
  const toggleFavorite = async (jobId) => {
    if (!user) {
      navigate("/login");
      return;
    }
    const isFavorite = jobs.some((job) => job.id === jobId);
    try {
      await toggleFavoriteService(jobId, token, isFavorite);
      if (isFavorite) {
        setJobs((prev) => prev.filter((job) => job.id !== jobId));
      } else {
        fetchFavorites();
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
      setError("Không thể cập nhật yêu thích.");
    }
  };
  

  // Apply job
  const handleApplyClick = (job) => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role === "employer") {
      alert("Tài khoản công ty không thể ứng tuyển!");
      return;
    }
    setSelectedJob(job);
    setShowApplyModal(true);
  };

  const handleFormChange = (e) => {
    if (e.target.name === "cv") {
      setFormData({ ...formData, cv: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const submitApplication = async (e) => {
    e.preventDefault();
    const candidateToken = localStorage.getItem("candidate_token");
    if (!candidateToken) {
      setApplyMessage("Vui lòng đăng nhập với vai trò ứng viên.");
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));
    data.append("jobpost_id", selectedJob.id);

    try {
      await applyJob(data, candidateToken);
      setApplyMessage("Ứng tuyển thành công!");
      setTimeout(() => {
        setShowApplyModal(false);
        setApplyMessage("");
      }, 2000);
    } catch (error) {
      console.error("Error applying job:", error);
      setApplyMessage(
        `Lỗi ứng tuyển: ${error.response?.data?.message || "Vui lòng thử lại."}`
      );
    }
  };

  return {
    jobs,
    user,
    formData,
    selectedJob,
    showApplyModal,
    applyMessage,
    setShowApplyModal,
    loading,
    error,
    toggleFavorite,
    handleApplyClick,
    handleFormChange,
    submitApplication,
    refreshFavorites: fetchFavorites,
  };
};
