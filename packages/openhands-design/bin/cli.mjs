#!/usr/bin/env node
/**
 * Copies the bundled OpenHands-Design template into the current project's ./OpenHands-Design/
 */
import { cpSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const templateRoot = join(__dirname, '..', 'template');
const destRoot = join(process.cwd(), 'OpenHands-Design');

const args = new Set(process.argv.slice(2));
const force = args.has('--force') || args.has('-f');
const help = args.has('--help') || args.has('-h');

function printHelp() {
  console.log(`
openhands-design — add OpenHands design system files to your project

Usage:
  npx openhands-design [options]

Options:
  --force, -f    Overwrite an existing ./OpenHands-Design folder
  --help, -h     Show this message

After running from your project root, point your AI assistant at OpenHands-Design/DESIGN.md for UI work.
`);
}

function dirHasFiles(dir) {
  if (!existsSync(dir)) return false;
  return readdirSync(dir).length > 0;
}

function main() {
  if (help) {
    printHelp();
    process.exit(0);
  }

  if (!existsSync(templateRoot)) {
    console.error('openhands-design: template directory is missing from the package install.');
    process.exit(1);
  }

  if (existsSync(destRoot) && dirHasFiles(destRoot)) {
    if (!force) {
      console.error(
        'openhands-design: ./OpenHands-Design already exists. Run with --force to replace it.'
      );
      process.exit(1);
    }
    cpSync(templateRoot, destRoot, { recursive: true, force: true });
    console.log('openhands-design: updated ./OpenHands-Design');
  } else {
    mkdirSync(destRoot, { recursive: true });
    cpSync(templateRoot, destRoot, { recursive: true });
    console.log('openhands-design: added ./OpenHands-Design');
  }

  console.log('');
  console.log('Next: ask your AI assistant to use OpenHands-Design/DESIGN.md for UI work.');
  console.log('See OpenHands-Design/README.md for integrating tokens and components.');
}

main();
