import { spawn, ChildProcess } from 'child_process';
import { 
  getProjectsList, 
  sortProjectsByDate, 
  fuzzyMatchProjects, 
  formatPaginatedResults,
  getLatestProject,
  buildProjectArgs 
} from './utils.js';

export interface ListCommandOptions {
  page?: number;
  pageSize?: number;
}

export interface RunCommandOptions {
  latest?: boolean;
  projectName?: string;
  args?: string[];
}

export interface HelpCommandOptions {}

/**
 * List all projects with pagination (latest to earliest)
 */
export const listCommand = async (options: ListCommandOptions = {}): Promise<void> => {
  const projects = await getProjectsList();
  const sortedProjects = sortProjectsByDate(projects);
  const output = formatPaginatedResults(sortedProjects, options.page, options.pageSize);
  console.log(output);
};

/**
 * Run a project using bun
 */
export const runCommand = async (options: RunCommandOptions): Promise<void> => {
  const projects = await getProjectsList();
  const sortedProjects = sortProjectsByDate(projects);

  let targetProject;
  
  if (options.latest) {
    targetProject = getLatestProject(sortedProjects);
    if (!targetProject) {
      console.error('No projects found to run.');
      return;
    }
  } else if (options.projectName) {
    const matches = fuzzyMatchProjects(sortedProjects, options.projectName);
    
    if (matches.length === 0) {
      console.error(`No project found matching "${options.projectName}".`);
      return;
    }
    
    if (matches.length > 1) {
      console.log(`Multiple projects found matching "${options.projectName}":`);
      matches.slice(0, 5).forEach((match, index) => {
        console.log(`${index + 1}. ${match.project.name} (${match.score.toFixed(2)} match)`);
      });
      console.log('Using the closest match:', matches[0]!.project.name);
    }
    
    targetProject = matches[0]!.project;
  } else {
    console.error('Either --latest flag or --project-name must be provided.');
    return;
  }

  // Build the command to run the project
  const projectEntryPoint = `${targetProject.fullPath}/index.ts`;
  const commandArgs = buildProjectArgs(projectEntryPoint, options.args || []);
  
  console.log(`Running ${targetProject.name}...`);
  
  // Run with bun
  const bunProcess: ChildProcess = spawn('bun', commandArgs, {
    stdio: 'inherit',
    cwd: targetProject.fullPath
  });
  
  bunProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`\n${targetProject.name} exited with code ${code}`);
    }
  });
  
  bunProcess.on('error', (error) => {
    console.error(`Error running ${targetProject.name}:`, error);
  });
};

/**
 * Display help information
 */
export const helpCommand = async (options: HelpCommandOptions = {}): Promise<void> => {
  const helpText = `
🙈 Play-CLI - DSA/LLD Practice Project Manager

USAGE:
  play-cli <command> [options]

COMMANDS:
  list      List all projects (latest to earliest)
  run       Run a specific project
  help      Show this help message

OPTIONS FOR LIST:
  --page <number>        Page number for pagination (default: 1)
  --page-size <number>   Number of projects per page (default: 10)

OPTIONS FOR RUN:
  --latest              Run the latest project
  --project-name <name> Run project by name (fuzzy matching enabled)
  -- <args>             Additional arguments to pass to the project

EXAMPLES:
  # List all projects
  play-cli list
  
  # List with pagination
  play-cli list --page 2 --page-size 5
  
  # Run the latest project
  play-cli run --latest
  
  # Run a project by name (fuzzy matching)
  play-cli run --project-name "Sample"
  
  # Run with arguments
  play-cli run --project-name "Sample" -- --some-arg value
  
  # Run latest with arguments
  play-cli run --latest -- arg1 arg2

FUZZY MATCHING:
  The project name matching supports fuzzy search, so you can use partial names:
  - "Sample" will match "My Sample Runner"
  - Search is case-insensitive
  - The best matching project (by similarity score) is selected

TAB AUTOCOMPLETE:
  Tab autocomplete is available for:
  - Commands (list, run, help)
  - Project names when using --project-name

For more information, visit: https://github.com/xylarshayu/play-cli
  `;
  
  console.log(helpText);
};

/**
 * Get all available commands for tab completion
 */
export const getAvailableCommands = (): string[] => {
  return ['list', 'run', 'help'];
};

/**
 * Get project names for tab completion
 */
export const getProjectNames = async (): Promise<string[]> => {
  const projects = await getProjectsList();
  return projects.map(p => p.name);
};