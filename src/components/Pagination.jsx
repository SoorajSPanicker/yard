import React from 'react';

const Pagination = ({ totalViews, viewsPerPage, currentPage, setCurrentPage }) => {
    const totalPages = Math.ceil(totalViews / viewsPerPage);

    const handleClick = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className="pagination-container">
            {Array.from({ length: totalPages }, (_, index) => (
                <button
                    key={index}
                    className={`pagination-button ${index + 1 === currentPage ? 'active' : ''}`}
                    onClick={() => handleClick(index + 1)}
                >
                    {index + 1}
                </button>
            ))}
        </div>
    );
};

export default Pagination;
