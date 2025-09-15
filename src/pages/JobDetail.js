import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "react-bootstrap";
import ApplyModal from "../component/ApplyModal";
import RelatedJobs from "../component/RelatedJobs";
import "../assets/css/JobDetail.css";

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [relatedJobs, setRelatedJobs] = useState([]);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
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

  const [companyInfo, setCompanyInfo] = useState(null);
  const navigate = useNavigate();

  const token =
    localStorage.getItem("candidate_token") ||
    localStorage.getItem("employer_token") ||
    localStorage.getItem("admin_token");

  const fetchFavoriteCount = useCallback(async () => {
    try {
      const res = await axios.get(`/favorites/count/${id}`);
      return res.data.count || 0;
    } catch {
      return 0;
    }
  }, [id]);

  const fetchFavorites = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get("/favorites", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavorites(res.data.map((job) => job.id));
    } catch (err) {
      console.error("Lỗi khi lấy danh sách yêu thích:", err);
    }
  }, [token]);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const jobResponse = await axios.get(`/jobposts/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const jobData = jobResponse.data;

        jobData.favorite_count = await fetchFavoriteCount();

        if (jobData.job_position_id) {
          try {
            const positionResponse = await axios.get(
              `/jobposts/job-positions/${jobData.job_position_id}`,
              { headers: token ? { Authorization: `Bearer ${token}` } : {} }
            );
            jobData.job_position =
              positionResponse.data.name || "Chưa có vị trí";
          } catch {
            jobData.job_position = "Chưa có vị trí";
          }
        } else {
          jobData.job_position = "Chưa có vị trí";
        }

        const companyResponse = await axios.get(
          `/employers/public/${jobData.employer_id}`
        );
        setCompanyInfo(companyResponse.data);

        setJob(jobData);

       
        if (jobData.category) {
          const relatedResponse = await axios.get(
            `/jobposts?category=${jobData.category}`,
            {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            }
          );

          const relatedData = relatedResponse.data.filter(
            (j) => j.id !== parseInt(id)
          );

          const relatedJobsWithPositions = await Promise.all(
            relatedData.map(async (job) => {
              if (job.job_position_id) {
                try {
                  const positionResponse = await axios.get(
                    `/jobposts/job-positions/${job.job_position_id}`
                  );
                  job.job_position =
                    positionResponse.data.name || "Chưa có vị trí";
                } catch {
                  job.job_position = "Chưa có vị trí";
                }
              } else {
                job.job_position = "Chưa có vị trí";
              }
              return job;
            })
          );

          setRelatedJobs(relatedJobsWithPositions);
        }
      } catch (err) {
        console.error("Lỗi khi lấy chi tiết công việc:", err);
        setError("Không thể tải thông tin công việc. Vui lòng thử lại.");
      }
    };

    const fetchUser = async () => {
      if (!token) return;
      try {
        const userResponse = await axios.get("/users/get-profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userResponse.data);

        const favRes = await axios.get("/favorites", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsFavorite(favRes.data.some((fav) => fav.id === parseInt(id)));
      } catch {}
    };

    fetchJob();
    fetchUser();
    fetchFavorites();
  }, [id, token, fetchFavoriteCount, fetchFavorites]);

  const toggleFavorite = async (jobId) => {
    if (!user) {
      alert("Vui lòng đăng nhập để thêm vào yêu thích!");
      return;
    }
    try {
      if (favorites.includes(jobId)) {
        await axios.delete(`/favorites/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFavorites(favorites.filter((id) => id !== jobId));
        setIsFavorite(jobId === parseInt(id) ? false : isFavorite);
        setJob((prev) =>
          prev.id === jobId
            ? { ...prev, favorite_count: prev.favorite_count - 1 }
            : prev
        );
        setRelatedJobs((prev) =>
          prev.map((j) =>
            j.id === jobId
              ? { ...j, favorite_count: j.favorite_count - 1 }
              : j
          )
        );
      } else {
        await axios.post(
          "/favorites",
          { jobpost_id: jobId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFavorites([...favorites, jobId]);
        setIsFavorite(jobId === parseInt(id) ? true : isFavorite);
        setJob((prev) =>
          prev.id === jobId
            ? { ...prev, favorite_count: prev.favorite_count + 1 }
            : prev
        );
        setRelatedJobs((prev) =>
          prev.map((j) =>
            j.id === jobId
              ? { ...j, favorite_count: j.favorite_count + 1 }
              : j
          )
        );
      }
    } catch {}
  };

  const handleApplyClick = (job) => {
    if (!user) {
      alert("Vui lòng đăng nhập để ứng tuyển!");
      return;
    }
    if (user.role === "employer") {
      alert("Tài khoản công ty không thể ứng tuyển!");
      return;
    }
    setShowApplyModal(true);
    setFormData({
      candidate_name: "",
      phone: "",
      email: "",
      address: "",
      skills: "",
      introduction: "",
      cv: null,
    });
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
    data.append("jobpost_id", id);

    try {
      await axios.post("http://localhost:3000/applications/add", data, {
        headers: {
          Authorization: `Bearer ${candidateToken}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setApplyMessage("Ứng tuyển thành công!");
      setTimeout(() => {
        setShowApplyModal(false);
        setApplyMessage("");
      }, 2000);
    } catch (error) {
      setApplyMessage(
        `Lỗi ứng tuyển: ${
          error.response?.data?.message || "Vui lòng thử lại."
        }`
      );
    }
  };

  if (error) return <p>{error}</p>;
  if (!job || !companyInfo) return <p>Đang tải...</p>;

  return (
    <>
      {/* Box Job Detail */}
      <div className="job-detail-container">
        {/* Phần thông tin công ty */}
        <div
          className="company-header"
          style={{
            backgroundImage: job.job_image ? `url(${job.job_image})` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          {companyInfo.avatar_url && (
            <img
              src={companyInfo.avatar_url}
              alt="Company Avatar"
              className="company-avatar"
            />
          )}
          <div className="company-info">
            <h3>{companyInfo.name}</h3>
            <p>
              <strong>Địa chỉ:</strong> {companyInfo.address}
            </p>
            <p>
              <strong>Số điện thoại:</strong> {companyInfo.phone || "Chưa có"}
            </p>
            <p>
              <strong>Email:</strong> {companyInfo.email}
            </p>
            <p>
              <strong>Website:</strong>{" "}
              <a
                href={companyInfo.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                {companyInfo.website}
              </a>
            </p>
            <p>
              <strong>Giới thiệu:</strong> {companyInfo.company_intro}
            </p>

            {user?.role === "candidate" && (
              <>
                <Button
                  variant="warning"
                  className="chat-btn"
                  onClick={async () => {
                    if (!user) return alert("Bạn cần đăng nhập!");
                    try {
                      const res = await fetch(
                        `http://localhost:3000/candidates/by-user/${user.id}`
                      );
                      if (!res.ok) {
                        alert("Không tìm thấy thông tin ứng viên!");
                        return;
                      }
                      const candData = await res.json();
                      const candidate_id = candData.id;

                      const convRes = await fetch(
                        "http://localhost:3000/conversations",
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            candidate_id,
                            employer_id: job.employer_id,
                          }),
                        }
                      );

                      if (!convRes.ok) {
                        alert("Lỗi khi tạo cuộc trò chuyện!");
                        return;
                      }

                      const conv = await convRes.json();
                      navigate(`/chat/${conv.id}`, { replace: false });
                    } catch (err) {
                      console.error(err);
                      alert("Có lỗi xảy ra. Vui lòng thử lại.");
                    }
                  }}
                >
                  💬 Chat với nhà tuyển dụng
                </Button>

                <Button
                  variant="success"
                  className="apply-now-btn"
                  onClick={() => handleApplyClick(job)}
                >
                  🚀 Ứng tuyển ngay
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Phần nội dung công việc */}
        <div className="job-content">
          <div className="job-header">
            <div>
              <h2>{job.title}</h2>
              <p className="company-name">{job.company_name || "Chưa có"}</p>
            </div>
            <div
              className="favorite-btn"
              onClick={() => toggleFavorite(job.id)}
            >
              <i
                className={
                  isFavorite
                    ? "bi bi-heart-fill text-danger"
                    : "bi bi-heart text-secondary"
                }
              ></i>
              <span>{job.favorite_count || 0}</span>
            </div>
          </div>

          <div className="job-info-grid">
            <div>
              <p>
                <strong>Vị trí:</strong> {job.job_position}
              </p>
              <p>
                <strong>Hình thức:</strong>{" "}
                {job.employment_type || "Chưa có"}
              </p>
              <p>
                <strong>Lương:</strong>{" "}
                {job.salary
                  ? `${parseInt(job.salary, 10).toLocaleString("vi-VN")} VND`
                  : "Chưa có"}
              </p>
              <p>
                <strong>Địa chỉ:</strong> {job.location}
              </p>
            </div>
            <div>
              <p>
                <strong>Email liên hệ:</strong>{" "}
                {job.email_contact || "Chưa có email"}
              </p>
              <p>
                <strong>Ngày đăng:</strong>{" "}
                {new Date(job.created_at).toLocaleDateString()}
              </p>
              <p>
                <strong>Hết hạn:</strong>{" "}
                {job.expiry_date
                  ? new Date(job.expiry_date).toLocaleDateString()
                  : "Chưa có"}
              </p>
              <p>
                <strong>Phân loại:</strong> {job.category}
              </p>
            </div>
          </div>

          <div className="job-details-sections">
            <div className="job-detail-box">
              <h5>Thông tin công việc</h5>
              <p style={{ whiteSpace: "pre-line" }}>
                {job.job_info || "Chưa có thông tin"}
              </p>
            </div>

            <div className="job-detail-box">
              <h5>Yêu cầu công việc</h5>
              <p style={{ whiteSpace: "pre-line" }}>
                {job.job_requirements || "Chưa có yêu cầu"}
              </p>
            </div>

            <div className="job-detail-box">
              <h5>Quyền lợi</h5>
              <p style={{ whiteSpace: "pre-line" }}>
                {job.benefits || "Chưa có quyền lợi"}
              </p>
            </div>
          </div>

          <div className="d-flex gap-2 mt-3">
            <Button variant="outline-secondary" onClick={() => navigate("/home")}>
              Quay lại
            </Button>
            <Button variant="primary" onClick={() => handleApplyClick(job)}>
              Ứng tuyển
            </Button>
          </div>
        </div>

        <ApplyModal
          show={showApplyModal}
          onHide={() => setShowApplyModal(false)}
          formData={formData}
          handleFormChange={handleFormChange}
          submitApplication={submitApplication}
          applyMessage={applyMessage}
        />
      </div>

      {/* Box riêng cho Công việc liên quan */}
      {relatedJobs.length > 0 && (
        <div className="related-jobs-box">
          <RelatedJobs
            jobs={relatedJobs}
            navigate={navigate}
            toggleFavorite={toggleFavorite}
            handleApplyClick={handleApplyClick}
            favorites={favorites}
          />
        </div>
      )}
    </>
  );
};

export default JobDetail;
