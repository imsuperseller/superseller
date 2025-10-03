
import React from 'react';
import { BuildingIcon } from './icons';

const Header: React.FC = () => {
  return (
    <header className="bg-surface shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <BuildingIcon className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-textPrimary">
              אומדן בינה מלאכותית לקבלנים
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
