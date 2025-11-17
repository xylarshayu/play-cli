# play-cli

play-cli is a command-line tool for managing and running Data Structures & Algorithms (DSA) and Low-Level Design (LLD) practice projects. It provides an organized way to discover, list, and execute your coding practice projects with features like fuzzy matching, pagination, and tab completion.

## Features

- **Project Discovery**: Automatically discovers projects from a specified directory
- **Fuzzy Matching**: Find projects using partial names with intelligent matching
- **Pagination**: Efficiently handle large project lists with built-in pagination
- **Tab Completion**: Full tab completion support for commands and project names
- **Project Sorting**: Projects are automatically sorted by modification date (latest first)
- **Argument Passing**: Support for passing custom arguments to individual projects
- **Clean Interface**: Simple, intuitive command-line interface

## Technology Stack

- **TypeScript**: Type-safe development
- **Yargs**: Robust CLI argument parsing
- **Bun**: Fast JavaScript runtime and package manager

## Installation

1. Ensure you have [Bun](https://bun.sh) installed on your system
2. Clone or download this repository
3. Install dependencies:
   ```bash
   bun install
   ```
4. Set up the environment variable to specify your projects directory:
   ```bash
   export PLAYCLI_PROJECTS_DIR=/path/to/your/projects
   ```

For permanent setup, add the environment variable to your shell configuration file (`~/.bashrc`, `~/.zshrc`, etc.):

```bash
echo 'export PLAYCLI_PROJECTS_DIR=/path/to/your/projects' >> ~/.zshrc
```

## Usage

### Basic Syntax

```bash
play-cli <command> [options]
```

### Commands

#### List Projects
Display all projects with pagination support, sorted by modification date (latest first).

```bash
# List all projects
play-cli list

# List with custom pagination
play-cli list --page 2 --page-size 5
```

**Options:**
- `--page, -p <number>`: Page number for pagination (default: 1)
- `--page-size, -s <number>`: Number of projects per page (default: 10)

#### Run Projects
Execute a specific project by name or run the latest project.

```bash
# Run the latest project
play-cli run --latest

# Run a project by name (fuzzy matching enabled)
play-cli run --project-name "Sample"

# Run with custom arguments
play-cli run --project-name "Sample" -- --some-arg value

# Run latest with arguments
play-cli run --latest -- arg1 arg2
```

**Options:**
- `--latest, -l`: Run the most recently modified project
- `--project-name, -n <name>`: Run project by name (supports fuzzy matching)
- `-- <args>`: Additional arguments to pass to the project

#### Help
Display help information and usage examples.

```bash
play-cli help
```

### Tab Completion

The CLI supports tab completion for:
- Commands (list, run, help)
- Project names when using `--project-name` or `-n` flags

Enable tab completion by adding this to your shell configuration:

```bash
# For bash
source <(play-cli completion)

# For zsh
autoload -U compinit && compinit
source <(play-cli completion)
```

## Project Structure

Organize your projects in the directory specified by `PLAYCLI_PROJECTS_DIR`. Each project should be:

1. A subdirectory in the projects directory
2. Contain an `index.ts` file as the entry point
3. Use TypeScript for consistency

Example structure:
```
/path/to/projects/
├── Sample/
│   └── index.ts
├── My Test Algorithm/
│   └── index.ts
└── Another Project/
    └── index.ts
```

## Examples

### Complete Workflow

1. Set up your projects directory:
   ```bash
   export PLAYCLI_PROJECTS_DIR=~/coding-projects
   ```

2. List your projects:
   ```bash
   play-cli list
   ```

3. Run a specific project:
   ```bash
   play-cli run --project-name "Sample"
   ```

4. Run the most recent project:
   ```bash
   play-cli run --latest
   ```

### Project Implementation Example

Each project should have an `index.ts` file:

```typescript
// Projects/Sample/index.ts
console.log("Hello from Sample project!");

// Access command-line arguments
const args = process.argv.slice(2);
console.log("Arguments received:", args);
```

## Fuzzy Matching

The project name matching uses intelligent fuzzy search:

- **Case-insensitive**: "sample" matches "Sample Project"
- **Partial matching**: "alg" matches "My Test Algorithm"
- **Similarity scoring**: The best matching project is selected automatically
- **Multiple matches**: If multiple projects match, the closest match is used

Examples:
- "Sample" matches "Sample Project"
- "test" matches "My Test Algorithm"
- "dragon" matches "Mr. Nibbles the dragon"

## Environment Variables

- `PLAYCLI_PROJECTS_DIR`: Path to the directory containing your practice projects (required)

## Error Handling

The CLI provides clear error messages for common issues:

- Missing `PLAYCLI_PROJECTS_DIR` environment variable
- No projects found in the specified directory
- Project not found when using project name
- Invalid command-line arguments

## Development

To run the CLI in development mode:

```bash
bun run dev
```

To add new commands or modify existing ones, edit the source files:
- `index.ts`: Main CLI configuration
- `command.ts`: Command implementations
- `utils.ts`: Utility functions and project management

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
