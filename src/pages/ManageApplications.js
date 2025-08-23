// src/pages/ManageApplications.js
import React from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import ApplicationsTable from "../component/ApplicationsTable";
import { useApplications } from "../hooks/useApplications";
import "../assets/css/ManageApplications.css";
import "../assets/css/JobDetail.css";

const ManageApplications = () => {
  const navigate = useNavigate();
  const { applications, error, translateStatus, handleCancelApplication } = useApplications();


  return (
    <div
      className="job-detail-container"
      style={{ maxWidth: "100%", width: "1200px", margin: "0 auto" }}
    >
      <div className="applications-content">
        <h3>Danh sách ứng tuyển của bạn</h3>
        {error ? (
          <p>{error}</p>
        ) : applications.length > 0 ? (
          <ApplicationsTable
            applications={applications}
            translateStatus={translateStatus}
            handleCancelApplication={handleCancelApplication}
          />
        ) : (
          <p>Bạn chưa ứng tuyển vào công việc nào.</p>
        )}
        <Button
          variant="secondary"
          onClick={() => navigate("/home")}
          className="mt-3"
        >
          Quay lại
        </Button>
      </div>
    </div>
  );
};

export default ManageApplications;
