import React, { useState, useEffect } from 'react';
import { Alert, Card } from 'react-bootstrap';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ViewQualities = () => {
  const [stats, setStats] = useState({
    jobPosts: 0,
    candidates: 0,
    employers: 0,
    applications: 0,
    categories: 0
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      axios.get('http://localhost:3001/jobposts/count'),
      axios.get('http://localhost:3001/candidates/count'),
      axios.get('http://localhost:3001/employers/count'),
      axios.get('http://localhost:3001/applications/count'),
      axios.get('http://localhost:3001/categories/count') 
    ])
      .then(([jobPostsRes, candidatesRes, employersRes, applicationsRes, categoriesRes]) => {
        setStats({
          jobPosts: jobPostsRes.data.count,
          candidates: candidatesRes.data.count,
          employers: employersRes.data.count,
          applications: applicationsRes.data.count,
          categories: categoriesRes.data.count
        });
        setError(null);
      })
      .catch(error => {
        console.error('Error fetching stats:', error.response?.data || error.message);
        setError('Không thể tải số liệu. Vui lòng kiểm tra server hoặc dữ liệu.');
      });
  }, []);

  const data = {
    labels: ['Bài đăng', 'Ứng viên', 'Nhà tuyển dụng', 'Ứng tuyển', 'Ngành làm việc'],
    datasets: [
      {
        label: 'Số lượng',
        data: [
          stats.jobPosts,
          stats.candidates,
          stats.employers,
          stats.applications,
          stats.categories
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Thống kê hệ thống' }
    }
  };

  return (
    <div>
      <h2>Xem số liệu</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="p-3">
        <Bar data={data} options={options} />
      </Card>
    </div>
  );
};

export default ViewQualities;
