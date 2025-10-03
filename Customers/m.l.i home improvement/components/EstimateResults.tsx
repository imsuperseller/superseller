import React, { useState } from 'react';
import { type Estimate, type ProjectDetails, type EstimateOption, EstimateTier, WebImage } from '../types';

const formatCurrency = (amount: number) => {
  if (isNaN(amount)) return "מחיר לא זמין";
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

const tierStyles: { [key in EstimateTier]: { bg: string; border: string; text: string; button: string } } = {
  [EstimateTier.Good]: { bg: 'bg-green-50', border: 'border-green-500', text: 'text-green-700', button: 'bg-green-600 hover:bg-green-700' },
  [EstimateTier.Better]: { bg: 'bg-blue-50', border: 'border-primary', text: 'text-primary', button: 'bg-primary hover:bg-blue-800' },
  [EstimateTier.Best]: { bg: 'bg-purple-50', border: 'border-purple-500', text: 'text-purple-700', button: 'bg-purple-600 hover:bg-purple-700' },
};

const EstimateOptionCard: React.FC<{ option: EstimateOption }> = ({ option }) => {
    const styles = tierStyles[option.tier] || tierStyles[EstimateTier.Better];
    return (
        <div className={`rounded-xl border-2 ${styles.border} ${styles.bg} p-6 flex flex-col`}>
            <div className="flex-grow">
                <h3 className={`text-xl font-bold ${styles.text}`}>{option.tier} - {option.name}</h3>
                <p className="text-4xl font-extrabold text-textPrimary my-4">{formatCurrency(option.price)}</p>
                <p className="text-textSecondary mb-4 text-sm">{option.description || "תיאור לא סופק."}</p>
                
                <h4 className="font-semibold text-textPrimary mb-2">חומרים עיקריים:</h4>
                {option.materials && option.materials.length > 0 ? (
                    <ul className="space-y-2 text-sm">
                        {option.materials.map((material, index) => (
                            <li key={index} className="flex justify-between items-center">
                                <span className="text-textSecondary">{material.name || "חומר לא ידוע"}</span>
                                <span className="font-mono text-textPrimary">{formatCurrency(material.avgPrice)}</span>
                            </li>
                        ))}
                        <li className="flex justify-between items-center border-t pt-2 mt-2">
                            <span className="font-bold text-textPrimary">עלות חומרים כוללת</span>
                            <span className="font-bold font-mono text-textPrimary">{formatCurrency(option.totalMaterialCost)}</span>
                        </li>
                    </ul>
                ) : (
                    <p className="text-sm text-textSecondary">פירוט חומרים לא זמין.</p>
                )}
            </div>
            <button className={`mt-6 w-full ${styles.button} text-white font-bold py-3 rounded-lg transition-colors`}>
                בחר אפשרות זו
            </button>
        </div>
    );
};

const ImageWithPlaceholder: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className = 'h-32 w-32' }) => {
    const [error, setError] = useState(false);

    if (error || !src) {
        return (
            <div className={`${className} flex items-center justify-center bg-gray-200 rounded-md text-gray-500`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className={`${className} object-cover rounded-md`}
            onError={() => setError(true)}
        />
    );
};


interface EstimateResultsProps {
  estimate: Estimate;
  userImages: ProjectDetails['images'];
  onReset: () => void;
}

const EstimateResults: React.FC<EstimateResultsProps> = ({ estimate, userImages, onReset }) => {
  return (
    <div className="w-full max-w-7xl mx-auto bg-surface p-6 sm:p-8 rounded-2xl shadow-xl animate-fade-in">
        <div className="flex justify-between items-start mb-6">
            <div>
                <h2 className="text-3xl font-bold text-textPrimary">האומדן שלך מוכן!</h2>
                <p className="text-textSecondary mt-1">להלן שלוש אפשרויות תמחור המבוססות על הנתונים שסיפקת.</p>
            </div>
            <button
                onClick={onReset}
                className="px-6 py-2 border border-gray-300 text-textPrimary font-semibold rounded-md hover:bg-gray-100 transition-colors"
            >
                התחל מחדש
            </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2 bg-background p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-textPrimary mb-3">סיכום הפרויקט</h3>
                <p className="text-textSecondary whitespace-pre-wrap text-right">{estimate.summary || "סיכום לא סופק מהבינה המלאכותית."}</p>
            </div>
            <div className="bg-background p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-textPrimary mb-3">מידות מוערכות</h3>
                {estimate.measurements && (estimate.measurements.area > 0 || estimate.measurements.perimeter > 0) ? (
                    <div className="space-y-3 text-right">
                        <p><span className="font-bold text-textPrimary">{estimate.measurements.area.toLocaleString()} רגל רבוע</span> :שטח מוערך</p>
                        <p><span className="font-bold text-textPrimary">{estimate.measurements.perimeter.toLocaleString()} רגל</span> :היקף מוערך</p>
                    </div>
                ) : <p className="text-textSecondary">מידות לא חושבו.</p>}
            </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
            {estimate.options
                .sort((a, b) => a.price - b.price)
                .map((option, index) => (
                    <EstimateOptionCard key={index} option={option} />
                ))}
        </div>
        
        <div className="bg-background p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-textPrimary mb-4">תמונות ששימשו לניתוח</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {userImages.map((image, index) => (
                    <div key={`user-${index}`} className="relative">
                        <ImageWithPlaceholder
                            src={`data:${image.inlineData.mimeType};base64,${image.inlineData.data}`}
                            alt={`User provided ${index + 1}`}
                            className="h-32 w-full"
                        />
                         <span className="absolute bottom-1 right-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded">משתמש</span>
                    </div>
                ))}
                 {estimate.webImages?.map((image, index) => (
                    <div key={`web-${index}`} className="relative text-center">
                       <a href={image.imageUrl} target="_blank" rel="noopener noreferrer" className="block">
                            <ImageWithPlaceholder
                                src={image.imageUrl}
                                alt={image.sourceDomain}
                                className="h-32 w-full"
                            />
                       </a>
                       <span className="absolute bottom-1 right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded">רשת</span>
                       <p className="text-xs text-textSecondary mt-1 truncate">{image.sourceDomain}</p>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default EstimateResults;