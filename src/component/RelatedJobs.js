import React from "react";
import FavoriteCard from "./favorites/FavoriteCard";
import "../assets/css/RelatedJobs.css";

const RelatedJobs = ({ jobs, navigate, toggleFavorite, handleApplyClick, favorites }) => {
  return (
    <div className="related-jobs-section mt-5">
      <h4>Công việc liên quan</h4>
      <div className="related-jobs-grid">
        {jobs.map((job) => (
          <div key={job.id} className="related-job-item">
            <FavoriteCard
              job={job}
              navigate={navigate}
              toggleFavorite={toggleFavorite}
              handleApplyClick={handleApplyClick}
              favorites={favorites}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedJobs;
