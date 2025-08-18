export async function validateFiles(files: File[]): Promise<{ valid: boolean; error?: string }> {
  // Check if we have files
  if (!files || files.length === 0) {
    return { valid: false, error: 'No files provided' };
  }
  
  // Check file count (expecting 5 family members)
  if (files.length < 1) {
    return { valid: false, error: 'At least one Excel file is required' };
  }
  
  // Validate each file
  for (const file of files) {
    const validation = await validateSingleFile(file);
    if (!validation.valid) {
      return validation;
    }
  }
  
  return { valid: true };
}

async function validateSingleFile(file: File): Promise<{ valid: boolean; error?: string }> {
  // Check file type
  if (!file.name.toLowerCase().endsWith('.xlsx') && !file.name.toLowerCase().endsWith('.xls')) {
    return { valid: false, error: `File ${file.name} is not an Excel file` };
  }
  
  // Check file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: `File ${file.name} is too large (max 10MB)` };
  }
  
  // Check if file is empty
  if (file.size === 0) {
    return { valid: false, error: `File ${file.name} is empty` };
  }
  
  // Check if filename contains Hebrew characters (expected for family member names)
  const hebrewPattern = /[\u0590-\u05FF]/;
  if (!hebrewPattern.test(file.name)) {
    return { valid: false, error: `File ${file.name} should contain Hebrew characters for family member name` };
  }
  
  return { valid: true };
}
