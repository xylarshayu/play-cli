#! /usr/bin/env bun

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { listCommand, runCommand, helpCommand, getAvailableCommands, getProjectNames } from './command.js';

const COMMAND_OPTIONS = {
  list: ['list', 'ls', 'l', 'show', 'display', 'all'],
  run: ['run', 'exec', 'execute', 'start', 'r', 'do'],
  help: ['info', 'i', 'about']
}

/**
 * Configure and run the CLI
 */
const main = async () => {
  const cli = yargs(hideBin(process.argv))
    .scriptName('play-cli')
    .usage('🙈 Play-CLI - DSA/LLD Practice Project Manager\n\nUsage: $0 <command> [options]')
    .command(
      COMMAND_OPTIONS.list,
      'List all projects (latest to earliest)',
      (yargs) => {
        return yargs
          .option('page', {
            alias: 'p',
            type: 'number',
            default: 1,
            describe: 'Page number for pagination'
          })
          .option('page-size', {
            alias: 's',
            type: 'number',
            default: 10,
            describe: 'Number of projects per page'
          });
      },
      async (argv) => {
        await listCommand({
          page: argv.page as number,
          pageSize: argv['page-size'] as number
        });
      }
    )
    .command(
      COMMAND_OPTIONS.run,
      'Run a specific project',
      (yargs) => {
        return yargs
          .option('latest', {
            alias: 'l',
            type: 'boolean',
            default: false,
            describe: 'Run the latest project'
          })
          .option('project-name', {
            alias: 'n',
            type: 'string',
            describe: 'Run project by name (fuzzy matching enabled)'
          })
          .option('args', {
            type: 'array',
            describe: 'Additional arguments to pass to the project',
            default: []
          })
          .check((argv) => {
            if (argv.getYargsCompletions) {
              return true;
            }
            if (!argv.latest && !argv.projectName) {
              throw new Error('Either --latest or --project-name must be provided');
            }
            if (argv.latest && argv.projectName) {
              throw new Error('Cannot use both --latest and --project-name together');
            }
            return true;
          });
      },
      async (argv) => {
        await runCommand({
          latest: argv.latest as boolean,
          projectName: argv.projectName as string | undefined,
          args: argv.args as string[] | undefined
        });
      }
    )
    .command(
      COMMAND_OPTIONS.help,
      'Show information about play-cli',
      () => {},
      async () => {
        await helpCommand();
      }
    )
    .completion('completion', (current, argv, done) => {
      const command = argv._[0] as string | undefined;
      const compLine = process.env.COMP_LINE || '';
      const words = compLine.split(' ');
      const prev = words[words.length - 2] || '';


      // done([prev]);

      // Scenario 1: User types `play-cli run <TAB>`
      if (COMMAND_OPTIONS.run.includes(prev!)) {
        done(['--latest', '--project-name', '-n' ]);
        return;
      }

      // Scenario 2: User types `play-cli run --project-name <TAB>` or `play-cli run -n <TAB>`
      if (['--project-name', '-n'].includes(prev!)) {
        getProjectNames().then(names => done(names)).catch(() => done([]));
        return;
      }

      // Scenario 3: User types `play-cli <TAB>`
      // This is the default case for completing the main command.
      done(getAvailableCommands());

    })
    .demandCommand(1, '🧑🏿‍🚒 Type the following: play-cli help')
    .help()
    .alias('h', 'help')
    .strict(false) // This is to allow flag for <tab> completion
    .showHelpOnFail(false);

  try {
    await cli.parse();
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
};

// Run the CLI
if (import.meta.main) {
  main();
}

// Export functions for testing
export { main, listCommand, runCommand, helpCommand };