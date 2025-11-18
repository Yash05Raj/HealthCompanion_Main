/**
 * FDA API Service
 * Fetches medicine data from the U.S. Food and Drug Administration (FDA) API
 * 
 * API Documentation: https://open.fda.gov/apis/drug/label/
 * No API key required - Free and public
 */

/**
 * Transform FDA API response to our medicine format
 */
const transformFDAData = (fdaDrug) => {
  try {
    // Extract medicine name (prefer brand name, fallback to generic)
    const name = fdaDrug.brand_name?.[0] || 
                 fdaDrug.generic_name?.[0] || 
                 fdaDrug.openfda?.brand_name?.[0] ||
                 fdaDrug.openfda?.generic_name?.[0] ||
                 'Unknown Medicine';

    // Extract aliases (alternative names)
    const aliases = [
      ...(fdaDrug.brand_name || []),
      ...(fdaDrug.generic_name || []),
      ...(fdaDrug.openfda?.brand_name || []),
      ...(fdaDrug.openfda?.generic_name || [])
    ]
      .filter((alias, index, self) => 
        alias && 
        alias.toLowerCase() !== name.toLowerCase() && 
        self.indexOf(alias) === index
      )
      .slice(0, 5); // Limit to 5 aliases

    // Extract overview/description
    const overview = fdaDrug.description?.[0] || 
                     fdaDrug.purpose?.[0] || 
                     fdaDrug.indications_and_usage?.[0] ||
                     'No description available.';

    // Extract uses/indications
    const uses = [];
    if (fdaDrug.indications_and_usage) {
      uses.push(...fdaDrug.indications_and_usage);
    }
    if (fdaDrug.purpose) {
      uses.push(...fdaDrug.purpose);
    }
    // Remove duplicates and limit
    const uniqueUses = [...new Set(uses)].slice(0, 10);

    // Extract dosage information
    const dosage = fdaDrug.dosage_and_administration?.[0] || 
                   fdaDrug.dosage?.[0] ||
                   'Dosage information not available. Please consult your healthcare provider.';

    // Extract warnings
    const warnings = [];
    if (fdaDrug.warnings) {
      warnings.push(...fdaDrug.warnings);
    }
    if (fdaDrug.warnings_and_cautions) {
      warnings.push(...fdaDrug.warnings_and_cautions);
    }
    if (fdaDrug.contraindications) {
      warnings.push(...fdaDrug.contraindications);
    }
    // Remove duplicates and limit
    const uniqueWarnings = [...new Set(warnings)].slice(0, 10);

    // Extract side effects/adverse reactions
    const sideEffects = [];
    if (fdaDrug.adverse_reactions) {
      sideEffects.push(...fdaDrug.adverse_reactions);
    }
    if (fdaDrug.side_effects) {
      sideEffects.push(...fdaDrug.side_effects);
    }
    // Remove duplicates and limit
    const uniqueSideEffects = [...new Set(sideEffects)].slice(0, 10);

    return {
      name: name.trim(),
      aliases: aliases.map(a => a.trim()).filter(a => a),
      overview: overview.trim().substring(0, 500), // Limit length
      uses: uniqueUses.map(u => u.trim().substring(0, 200)).filter(u => u),
      dosage: dosage.trim().substring(0, 1000),
      warnings: uniqueWarnings.map(w => w.trim().substring(0, 300)).filter(w => w),
      sideEffects: uniqueSideEffects.map(s => s.trim().substring(0, 200)).filter(s => s),
      source: 'FDA',
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error transforming FDA data:', error);
    return null;
  }
};

/**
 * Search for medicine by brand name
 */
export const searchFDAByBrandName = async (brandName) => {
  try {
    const encodedName = encodeURIComponent(brandName);
    const url = `https://api.fda.gov/drug/label.json?search=brand_name:"${encodedName}"&limit=1`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`FDA API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      return transformFDAData(data.results[0]);
    }
    
    return null;
  } catch (error) {
    console.error('Error searching FDA by brand name:', error);
    return null;
  }
};

/**
 * Search for medicine by generic name
 */
export const searchFDAByGenericName = async (genericName) => {
  try {
    const encodedName = encodeURIComponent(genericName);
    const url = `https://api.fda.gov/drug/label.json?search=generic_name:"${encodedName}"&limit=1`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`FDA API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      return transformFDAData(data.results[0]);
    }
    
    return null;
  } catch (error) {
    console.error('Error searching FDA by generic name:', error);
    return null;
  }
};

/**
 * Search for medicine by active ingredient
 */
export const searchFDAByActiveIngredient = async (ingredient) => {
  try {
    const encodedIngredient = encodeURIComponent(ingredient);
    const url = `https://api.fda.gov/drug/label.json?search=active_ingredient:"${encodedIngredient}"&limit=1`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`FDA API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      return transformFDAData(data.results[0]);
    }
    
    return null;
  } catch (error) {
    console.error('Error searching FDA by active ingredient:', error);
    return null;
  }
};

/**
 * Comprehensive search - tries multiple search methods
 */
export const searchFDA = async (searchTerm) => {
  if (!searchTerm || !searchTerm.trim()) {
    return null;
  }

  const normalized = searchTerm.trim();
  
  // Try brand name first (most common)
  let result = await searchFDAByBrandName(normalized);
  if (result) return result;

  // Try generic name
  result = await searchFDAByGenericName(normalized);
  if (result) return result;

  // Try active ingredient
  result = await searchFDAByActiveIngredient(normalized);
  if (result) return result;

  // Try partial match with brand name
  try {
    const encodedTerm = encodeURIComponent(normalized);
    const url = `https://api.fda.gov/drug/label.json?search=brand_name:"${encodedTerm}"&limit=5`;
    const response = await fetch(url);
    
    if (response.ok) {
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        // Find best match
        const bestMatch = data.results.find(drug => {
          const brandNames = [
            ...(drug.brand_name || []),
            ...(drug.openfda?.brand_name || [])
          ];
          return brandNames.some(bn => 
            bn.toLowerCase().includes(normalized.toLowerCase())
          );
        }) || data.results[0];
        
        return transformFDAData(bestMatch);
      }
    }
  } catch (error) {
    console.error('Error in partial FDA search:', error);
  }

  return null;
};

/**
 * Get multiple medicines by search term (for suggestions)
 */
export const searchFDAMultiple = async (searchTerm, limit = 5) => {
  try {
    const encodedTerm = encodeURIComponent(searchTerm);
    const url = `https://api.fda.gov/drug/label.json?search=brand_name:"${encodedTerm}"&limit=${limit}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      return data.results
        .map(transformFDAData)
        .filter(med => med !== null);
    }
    
    return [];
  } catch (error) {
    console.error('Error searching FDA multiple:', error);
    return [];
  }
};

