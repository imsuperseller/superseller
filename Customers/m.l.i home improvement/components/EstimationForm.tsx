import React, { useState } from 'react';
import type { ProjectDetails } from '../types';
import { LocationIcon, UploadIcon } from './icons';

interface EstimationFormProps {
  onSubmit: (details: ProjectDetails) => void;
  isLoading: boolean;
}

const projectTypes: { [key: string]: string } = {
    'Roofing': 'גגות',
    'Siding': 'חיפוי קירות',
    'Windows': 'חלונות',
    'Decking': 'דקים',
    'Landscaping': 'גינון',
    'InteriorPainting': 'צביעה (פנים)',
    'ExteriorPainting': 'צביעה (חוץ)',
    'Flooring': 'ריצוף',
    'KitchenRemodel': 'שיפוץ מטבח',
    'BathroomRemodel': 'שיפוץ חדר אמבטיה',
    'BasementFinishing': 'גימור מרתף',
    'FullRenovation': 'שיפוץ בית מלא',
    'HomeAddition': 'תוספת בנייה',
    'Fencing': 'גידור',
    'DrivewayPaving': 'ריצוף שביל גישה',
    'ElectricalWork': 'עבודות חשמל',
    'PlumbingWork': 'עבודות אינסטלציה',
};

const EstimationForm: React.FC<EstimationFormProps> = ({ onSubmit, isLoading }) => {
  const [address, setAddress] = useState('');
  const [selectedProjectTypes, setSelectedProjectTypes] = useState<string[]>([]);
  const [images, setImages] = useState<ProjectDetails['images']>([]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [error, setError] = useState('');

  const handleProjectTypeChange = (projectType: string) => {
    setSelectedProjectTypes(prev =>
      prev.includes(projectType)
        ? prev.filter(pt => pt !== projectType)
        : [...prev, projectType]
    );
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // remove data:mime/type;base64, prefix
        const base64Data = result.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      const newImages: ProjectDetails['images'] = [];

      for (const file of files) {
        try {
          const base64Data = await fileToBase64(file);
          newImages.push({
            inlineData: {
              data: base64Data,
              mimeType: file.type,
            },
          });
        } catch (error) {
          console.error("Error converting file to base64", error);
          setError("שגיאה בהמרת קובץ. נסה קובץ אחר.");
        }
      }
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!address.trim()) {
      setError('יש להזין כתובת נכס.');
      return;
    }
    if (selectedProjectTypes.length === 0) {
      setError('יש לבחור לפחות סוג פרויקט אחד.');
      return;
    }
    setError('');
    onSubmit({
      address,
      projectTypes: selectedProjectTypes,
      images,
      additionalNotes,
      useWebSearch,
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-surface p-8 rounded-2xl shadow-xl">
      <h2 className="text-3xl font-bold text-center text-textPrimary mb-2">צור אומדן חדש</h2>
      <p className="text-center text-textSecondary mb-8">מלא את הפרטים למטה כדי לקבל אומדן מבוסס AI תוך שניות.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md" role="alert">{error}</div>}

        <div>
          <label htmlFor="address" className="block text-lg font-semibold text-textPrimary mb-2">כתובת הנכס</label>
          <div className="relative">
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="לדוגמה: 123 Main St, Dallas, TX 75201"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white text-textPrimary"
              required
            />
            <LocationIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="block text-lg font-semibold text-textPrimary mb-2">סוגי פרויקטים</label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(projectTypes).map(([key, value]) => (
              <label key={key} className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-all ${selectedProjectTypes.includes(key) ? 'bg-blue-50 border-primary text-primary font-semibold' : 'border-gray-300'}`}>
                <input
                  type="checkbox"
                  checked={selectedProjectTypes.includes(key)}
                  onChange={() => handleProjectTypeChange(key)}
                  className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary"
                />
                <span className="text-sm">{value}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-lg font-semibold text-textPrimary mb-2">העלאת תמונות (אופציונלי)</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-blue-800 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                  <span>בחר קבצים להעלאה</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={handleImageUpload} accept="image/*" />
                </label>
                <p className="pl-1">או גרור ושחרר</p>
              </div>
              <p className="text-xs text-gray-500">קבצי PNG, JPG, GIF עד 10MB</p>
            </div>
          </div>
          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={`data:${image.inlineData.mimeType};base64,${image.inlineData.data}`}
                    alt={`Preview ${index}`}
                    className="h-24 w-24 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="notes" className="block text-lg font-semibold text-textPrimary mb-2">הערות נוספות (אופציונלי)</label>
          <textarea
            id="notes"
            rows={3}
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
            placeholder="יש דגשים מיוחדים? חומרים מועדפים? כל פרט שיכול לעזור..."
          ></textarea>
        </div>

        <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="web-search"
                type="checkbox"
                checked={useWebSearch}
                onChange={(e) => setUseWebSearch(e.target.checked)}
                className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="web-search" className="font-medium text-textPrimary">השתמש בחיפוש Google</label>
              <p className="text-textSecondary">אפשר ל-AI לחפש תמונות עדכניות של הנכס ברשת כדי לשפר את דיוק האומדן. (דורש כתובת מדויקת)</p>
            </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-lg shadow-sm text-lg font-bold text-white bg-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'יוצר אומדן...' : 'צור אומדן בינה מלאכותית'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EstimationForm;