import React, { useState } from 'react';
import { Star } from 'lucide-react';
import './StarRating.css';

const StarRating = ({ rating, onRatingChange, readOnly = false }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => {
        return (
          <button
            type="button"
            key={star}
            className={`star-btn ${star <= (hover || rating) ? 'active' : ''}`}
            onClick={() => !readOnly && onRatingChange(star)}
            onMouseEnter={() => !readOnly && setHover(star)}
            onMouseLeave={() => !readOnly && setHover(rating)}
            disabled={readOnly}
            aria-label={`Rate ${star} stars`}
          >
            <Star 
              fill={star <= (hover || rating) ? 'currentColor' : 'none'} 
              size={24}
              strokeWidth={1.5}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
