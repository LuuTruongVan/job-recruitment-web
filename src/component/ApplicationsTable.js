import React from "react";
import { Table, Button } from "react-bootstrap";

const ApplicationsTable = ({
  applications,
  translateStatus,
  handleCancelApplication,
}) => {
  return (
    <Table striped bordered hover className="responsive-table mt-4">
      <thead>
        <tr>
          <th>Tiêu đề công việc</th>
          <th>Tên ứng viên</th>
          <th>Email</th>
          <th>Số điện thoại</th>
          <th>CV</th>
          <th>Ứng tuyển ngày</th>
          <th>Trạng thái</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        {applications.map((app) => (
          <tr key={app.id}>
            <td data-label="Tiêu đề công việc">
              {app.title || "Chưa có tiêu đề"}
            </td>
            <td data-label="Tên ứng viên">
              {app.candidate_name || "Không có tên"}
            </td>
            <td data-label="Email">{app.email || "Không có email"}</td>
            <td data-label="Số điện thoại">
              {app.phone || "Không có số điện thoại"}
            </td>
            <td data-label="CV">
              {app.cv_path ? (
                <a
                  href={`http://localhost:3000${app.cv_path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Xem CV
                </a>
              ) : (
                "Không có CV"
              )}
            </td>
            <td data-label="Ứng tuyển ngày">
              {app.applied_at
                ? new Date(app.applied_at).toLocaleDateString()
                : "Chưa có"}
            </td>
            <td data-label="Trạng thái">{translateStatus(app.status)}</td>
            <td data-label="Hành động">
              {app.status === "pending" ? (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Bạn có chắc chắn muốn hủy ứng tuyển này?"
                      )
                    ) {
                      handleCancelApplication(app.id);
                    }
                  }}
                >
                  Hủy
                </Button>
              ) : (
                "-"
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default ApplicationsTable;
