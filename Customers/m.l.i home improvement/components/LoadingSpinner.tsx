
import React, { useState, useEffect } from 'react';

const loadingMessages = [
  "מנתח את תמונת הנכס...",
  "מחשב מידות וממדים...",
  "מאחזר נתוני עלויות חומרים...",
  "מחיל מקדמי עבודה ומורכבות...",
  "מרכיב אפשרויות 'טוב/טוב יותר/הכי טוב'...",
  "מסיים את הכנת האומדן המיידי שלך...",
];

const LoadingSpinner: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
    }, 2000); // Change message every 2 seconds

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center p-8">
      <div className="w-16 h-16 border-4 border-t-primary border-gray-200 rounded-full animate-spin"></div>
      <h2 className="text-xl font-semibold text-textPrimary mt-6">יוצר את האומדן שלך</h2>
      <p className="text-textSecondary mt-2 transition-opacity duration-500">
        {loadingMessages[messageIndex]}
      </p>
    </div>
  );
};

export default LoadingSpinner;
