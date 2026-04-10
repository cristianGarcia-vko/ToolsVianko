const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;

const escapePathForRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\/g, '[\\\\/]');

const blockedFolders = [
  path.join(projectRoot, '.git'),
  path.join(projectRoot, '.expo'),
  path.join(projectRoot, 'dist'),
  path.join(projectRoot, 'uploads'),
  path.join(projectRoot, 'Windows_Build'),
  path.join(projectRoot, 'k6-backend'),
  path.join(projectRoot, 'k6-frontend'),
  path.join(projectRoot, 'public', 'k6-dashboard'),
];

const config = getDefaultConfig(projectRoot);

config.resolver.blockList = new RegExp(
  blockedFolders
    .map((folderPath) => `^${escapePathForRegex(folderPath)}([\\\\/].*)?$`)
    .join('|'),
);

module.exports = config;
