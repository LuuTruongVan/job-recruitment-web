import React, { useState, useEffect } from "react";
import { Table, Button, Collapse, Badge } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../assets/css/ManageJob.css';

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [expiredJobs, setExpiredJobs] = useState([]);
  const [openExpired, setOpenExpired] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const currentDate = new Date();
    const token = localStorage.getItem("employer_token");

    axios
      .get("/jobposts/my-jobs", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(async (response) => {
        const jobsWithPositions = await Promise.all(
          response.data.map(async (job) => {
            if (job.job_position_id) {
              try {
                const positionResponse = await axios.get(
                  `/jobposts/job-positions/${job.job_position_id}`,
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                job.job_position = positionResponse.data.name || "Chưa có vị trí";
              } catch (error) {
                console.error("Error fetching job position:", error);
                job.job_position = "Chưa có vị trí";
              }
            } else {
              job.job_position = "Chưa có vị trí";
            }
            return job;
          })
        );

        // Lọc bài chưa hết hạn & bài đã hết hạn
        const validJobs = jobsWithPositions.filter(
          (job) =>
            !job.expiry_date ||
            new Date(job.expiry_date).getTime() >= currentDate.getTime()
        );
        const expired = jobsWithPositions.filter(
          (job) =>
            job.expiry_date &&
            new Date(job.expiry_date).getTime() < currentDate.getTime()
        );

        setJobs(validJobs);
        setExpiredJobs(expired);
      })
      .catch((error) => {
        console.error("Error fetching jobs:", error);
      });
  }, []);

  const handleDelete = async (id) => {
    // Thêm xác nhận trước khi xóa
    if (!window.confirm('Bạn có chắc muốn xóa bài đăng này?')) return;
    const token = localStorage.getItem("employer_token");
    try {
      await axios.delete(`/jobposts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobs(jobs.filter((job) => job.id !== id));
      setExpiredJobs(expiredJobs.filter((job) => job.id !== id));
    } catch (error) {
      console.error("Error deleting job:", error);
      alert(error.response?.data?.message || 'Lỗi khi xóa bài đăng');
    }
  };

  const handleEdit = (id) => {
    navigate(`/edit-job/${id}`);
  };

  const handleViewDetail = (id) => {
    navigate(`/job-management-detail/${id}`);
  };

  // Hiển thị trạng thái duyệt
  const renderStatus = (status) => {
    switch (status) {
      case "approved":
        return <Badge bg="success">Đã duyệt</Badge>;
      case "pending":
        return <Badge bg="warning" text="dark">Chờ duyệt</Badge>;
      default:
        return <Badge bg="secondary">Không rõ</Badge>;
    }
  };

  return (
    <div className="manage-jobs">
      <h2>Quản lý tin tuyển dụng</h2>
      
      {/* Bảng tin đang còn hạn */}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Tiêu đề</th>
            <th>Vị trí công việc</th>
            <th>Ngày đăng</th>
            <th>Ngày hết hạn</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {jobs.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center">
                Không có bài đăng nào còn hạn
              </td>
            </tr>
          ) : (
            jobs.map((job) => (
              <tr key={job.id}>
                <td data-label="Tiêu đề">{job.title}</td>
                <td data-label="Vị trí công việc">
                  {job.job_position || "Chưa có vị trí"}
                </td>
                <td data-label="Ngày đăng">
                  {new Date(job.created_at).toLocaleDateString()}
                </td>
                <td data-label="Ngày hết hạn">
                  {job.expiry_date
                    ? new Date(job.expiry_date).toLocaleDateString()
                    : "Chưa có"}
                </td>
                <td data-label="Trạng thái">{renderStatus(job.status)}</td>
                <td data-label="Hành động">
                  <Button
                    variant="info"
                    size="sm"
                    onClick={() => handleViewDetail(job.id)}
                    className="me-2 mb-1"
                  >
                    Xem chi tiết
                  </Button>
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => handleEdit(job.id)}
                    className="me-2 mb-1"
                  >
                    Sửa
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(job.id)}
                  >
                    Xóa
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Nút mở bảng hết hạn */}
      <Button
        variant="info"
        onClick={() => setOpenExpired(!openExpired)}
        aria-controls="expired-jobs"
        aria-expanded={openExpired}
        className="btn-toggle-expired"
      >
        Các bài đăng hết hạn ({expiredJobs.length})
      </Button>

      {/* Bảng tin hết hạn */}
      <Collapse in={openExpired}>
        <div id="expired-jobs">
          <Table striped bordered hover className="mt-3">
            <thead>
              <tr>
                <th>Tiêu đề</th>
                <th>Vị trí công việc</th>
                <th>Ngày đăng</th>
                <th>Ngày hết hạn</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {expiredJobs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">
                    Không có bài đăng hết hạn
                  </td>
                </tr>
              ) : (
                expiredJobs.map((job) => (
                  <tr key={job.id}>
                    <td>{job.title}</td>
                    <td>{job.job_position || "Chưa có vị trí"}</td>
                    <td>{new Date(job.created_at).toLocaleDateString()}</td>
                    <td>
                      {job.expiry_date
                        ? new Date(job.expiry_date).toLocaleDateString()
                        : "Chưa có"}
                    </td>
                    <td>{renderStatus(job.status)}</td>
                    <td>
                      <Button
                        variant="info"
                        size="sm"
                        onClick={() => handleViewDetail(job.id)}
                        className="me-2 mb-1"
                      >
                        Xem chi tiết
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(job.id)}
                      >
                        Xóa
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </Collapse>
    </div>
  );
};

export default ManageJobs;