
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-background py-4 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-textSecondary text-sm">
        <p>&copy; {new Date().getFullYear()} פתרונות בינה מלאכותית לבנייה. כל הזכויות שמורות.</p>
        <p>מופעל על ידי Gemini</p>
      </div>
    </footer>
  );
};

export default Footer;
