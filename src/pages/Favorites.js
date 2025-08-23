import React from "react";
import { useFavorites } from "../hooks/useFavorites";
import FavoriteCard from "../component/favorites/FavoriteCard";
import ApplyModal from "../component/ApplyModal";
import { useNavigate } from "react-router-dom";
import "../assets/css/Favorites.css";


const Favorites = () => {
const navigate = useNavigate();
const {
jobs,
formData,
showApplyModal,
setShowApplyModal,
toggleFavorite,
handleApplyClick,
handleFormChange,
submitApplication,
applyMessage,
} = useFavorites();


return (
<div className="favorites-container container my-4">
<h3 className="mb-4">Danh sách yêu thích</h3>
{jobs.length === 0 ? (
<p>Chưa có công việc yêu thích nào.</p>
) : (
<div className="row">
{jobs.map((job) => (
<div className="col-md-4 mb-4" key={job.id}>
<FavoriteCard
job={job}
navigate={navigate}
toggleFavorite={toggleFavorite}
handleApplyClick={handleApplyClick}
/>
</div>
))}
</div>
)}


<ApplyModal
show={showApplyModal}
onHide={() => setShowApplyModal(false)}
formData={formData}
handleFormChange={handleFormChange}
submitApplication={submitApplication}
applyMessage={applyMessage}
/>
</div>
);
};


export default Favorites;