/**
 * Utilities to handle category normalization across different languages
 */

// Constant internal category keys that don't change with language
export const CATEGORY_KEYS = {
  PERSONAL: 'personal',
  WORK: 'work'
};

// Map of category labels to their internal keys
const categoryKeyMap = new Map<string, string>();

// Initialize the known category mappings
// English
categoryKeyMap.set('personal', CATEGORY_KEYS.PERSONAL);
categoryKeyMap.set('work', CATEGORY_KEYS.WORK);

// Indonesian
categoryKeyMap.set('pribadi', CATEGORY_KEYS.PERSONAL);
categoryKeyMap.set('kerja', CATEGORY_KEYS.WORK);

// Japanese
categoryKeyMap.set('個人', CATEGORY_KEYS.PERSONAL);
categoryKeyMap.set('仕事', CATEGORY_KEYS.WORK);

/**
 * Normalize a category string to a standard internal key
 * @param category The category string in any language
 * @returns Normalized category key
 */
export function normalizeCategory(category?: string): string | undefined {
  if (!category) return undefined;
  
  const lowerCategory = category.trim().toLowerCase();
  
  // Search for a matching key in our map
  for (const [label, key] of categoryKeyMap.entries()) {
    if (lowerCategory.includes(label)) {
      return key;
    }
  }
  
  // If not found in our map, use the original (lowercase, trimmed)
  return lowerCategory;
}

/**
 * Get the standard key for a category
 * @param category The category string in any language
 * @returns The standard category key
 */
export function getCategoryKey(category?: string): string {
  if (!category) return '';
  
  const normalized = normalizeCategory(category);
  
  // Return the normalized category if it exists, otherwise empty string
  return normalized || '';
}

/**
 * Check if a task matches a category, regardless of language
 * @param taskCategory The task's category
 * @param filterCategory The category to filter by
 * @returns True if the task should be included in the filter
 */
export function categoryMatches(taskCategory?: string, filterCategory?: string): boolean {
  if (!taskCategory || !filterCategory) return false;
  
  const taskKey = getCategoryKey(taskCategory);
  const filterKey = getCategoryKey(filterCategory);
  
  return taskKey === filterKey;
} 