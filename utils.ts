import { promises as fs } from 'fs';
import pathModule from 'path';

export interface ProjectInfo {
  name: string;
  path: string;
  fullPath: string;
  modifiedTime: Date;
  relativePath: string;
}

/**
 * Get all projects from the Projects folder
 * Returns project information including metadata
 */
export const getProjectsList = async (): Promise<ProjectInfo[]> => {
  const projectsDir = process.env.PLAYCLI_PROJECTS_DIR;
  if (!projectsDir) {
    console.error('PLAYCLI_PROJECTS_DIR environment variable is not set.');
    return [];
  }
  
  try {
    const entries = await fs.readdir(projectsDir, { withFileTypes: true });
    
    const projectDirectories = entries
      .filter(entry => entry.isDirectory())
      .map(entry => ({
        name: entry.name,
        fullPath: pathModule.join(projectsDir, entry.name),
        relativePath: pathModule.join('Projects', entry.name)
      }));

    const projectsWithStats = await Promise.all(
      projectDirectories.map(async (project) => {
        const stats = await fs.stat(project.fullPath);
        return {
          name: project.name,
          path: project.name,
          fullPath: project.fullPath,
          relativePath: project.relativePath,
          modifiedTime: stats.mtime
        };
      })
    );

    return projectsWithStats;
  } catch (error) {
    console.error('Error reading projects directory:', error);
    return [];
  }
};

/**
 * Sort projects by modification time (latest to earliest)
 */
export const sortProjectsByDate = (projects: ProjectInfo[]): ProjectInfo[] => {
  return [...projects].sort((a, b) => b.modifiedTime.getTime() - a.modifiedTime.getTime());
};

/**
 * Calculate string similarity for fuzzy matching
 * Returns a score between 0 and 1
 */
const calculateSimilarity = (str1: string, str2: string): number => {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  if (s1 === s2) return 1;
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;
  
  // Calculate Levenshtein distance
  const matrix: number[][] = Array(s2.length + 1).fill(0).map(() => Array(s1.length + 1).fill(0));
  
  for (let i = 0; i <= s1.length; i++) matrix[0]![i] = i;
  for (let j = 0; j <= s2.length; j++) matrix[j]![0] = j;
  
  for (let j = 1; j <= s2.length; j++) {
    for (let i = 1; i <= s1.length; i++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[j]![i] = Math.min(
        matrix[j]![i - 1]! + 1,
        matrix[j - 1]![i]! + 1,
        matrix[j - 1]![i - 1]! + cost
      );
    }
  }
  
  const maxLength = Math.max(s1.length, s2.length);
  return maxLength === 0 ? 1 : 1 - matrix[s2.length]![s1.length]! / maxLength;
};

/**
 * Find projects by fuzzy name matching
 * Returns projects sorted by similarity score (highest first)
 */
export const fuzzyMatchProjects = (
  projects: ProjectInfo[], 
  searchTerm: string
): { project: ProjectInfo; score: number }[] => {
  if (!searchTerm.trim()) return [];
  
  const matches = projects.map(project => ({
    project,
    score: calculateSimilarity(project.name, searchTerm)
  }));
  
  return matches
    .filter(match => match.score > 0.3) // Minimum threshold for fuzzy matching
    .sort((a, b) => b.score - a.score);
};

/**
 * Paginate a list of items
 */
export const paginateResults = <T>(
  items: T[], 
  page: number = 1, 
  pageSize: number = 10
): { items: T[]; totalPages: number; currentPage: number; totalItems: number } => {
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  return {
    items: items.slice(startIndex, endIndex),
    totalPages,
    currentPage,
    totalItems
  };
};

/**
 * Format project list for display
 */
export const formatProjectList = (projects: ProjectInfo[]): string => {
  return projects.map(project => {
    const modifiedDate = project.modifiedTime.toISOString().split('T')[0];
    return `${project.name} (Modified: ${modifiedDate})`;
  }).join('\n');
};

/**
 * Format paginated results for display
 */
export const formatPaginatedResults = (
  projects: ProjectInfo[], 
  page: number = 1, 
  pageSize: number = 10
): string => {
  const { items, totalPages, currentPage, totalItems } = paginateResults(projects, page, pageSize);
  
  let output = `\n=== Projects (${totalItems} total) ===\n`;
  output += `Page ${currentPage} of ${totalPages}\n\n`;
  
  if (items.length === 0) {
    output += 'No projects found.\n';
    return output;
  }
  
  items.forEach((project, index) => {
    const modifiedDate = project.modifiedTime.toISOString().split('T')[0];
    output += `${(currentPage - 1) * pageSize + index + 1}. ${project.name} (Modified: ${modifiedDate})\n`;
  });
  
  if (totalPages > 1) {
    output += `\nUse --page <number> to navigate (1-${totalPages})\n`;
  }
  
  return output;
};

/**
 * Get the latest project
 */
export const getLatestProject = (projects: ProjectInfo[]): ProjectInfo | null => {
  if (projects.length === 0) return null;
  return sortProjectsByDate(projects)[0] || null;
};

/**
 * Build command arguments for running a project
 */
export const buildProjectArgs = (projectPath: string, projectArgs: string[]): string[] => {
  return [projectPath, ...projectArgs];
};