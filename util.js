

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

let component = {
  jsFile: 'index.js',
  cssFile: 'index.css',
};

const validate = require("@google/dscc-validation");
const fs_1 = require("fs");
const args_1 = require("../args");
const util_1 = require(".git remote add origin https://github.com/WhiteySage/radarChartLookerStudio.git./util");

exports.validateBuildValues = (args) => {
  // Replace environment variables with actual file names
  const cssFile = 'index.css'; // Replaced with actual file name
  const jsonFile = 'index.json'; // Replaced with actual file name
  if (jsonFile === undefined) {
    throw util_1.invalidVizConfig('jsonFile');
  }
  
  // Require either jsFile or tsFile
  const jsFile = 'index.js'; // Replaced with actual file name
  const tsFile = process.env.npm_package_dsccViz_tsFile;
  
  if (jsFile === undefined && tsFile === undefined) {
    throw util_1.invalidVizConfig('jsFile');
  }

  // Replace environment variables with actual bucket paths
  const devBucket = 'gs://community-looker-viz/chart/dev'; // Replace with your actual dev bucket path
  if (devBucket === undefined) {
    throw util_1.invalidVizConfig('gcsDevBucket');
  }

  const prodBucket = 'gs://community-looker-viz/chart/prod'; // Replace with your actual prod bucket path
  if (prodBucket === undefined) {
    throw util_1.invalidVizConfig('gcsProdBucket');
  }

  const devMode = args.deployment === args_1.DeploymentChoices.PROD ? false : true;
  const gcsBucket = devMode ? devBucket : prodBucket;
  const manifestFile = 'manifest.json';
  const pwd = process.cwd();

  return {
    devBucket,
    prodBucket,
    manifestFile,
    cssFile,
    jsonFile,
    jsFile,
    tsFile,
    devMode,
    pwd,
    gcsBucket,
  };
};

exports.getBuildableComponents = () => {
  const components = [];
  const lastComponentIdx = Object.keys(process.env)
      .filter((key) => key.startsWith('npm_package_dsccViz_components_'))
      .map((s) => s.replace('npm_package_dsccViz_components_', ''))
      .map((a) => parseInt(a, 10))
      .reduce((a, b) => (a > b ? a : b), 0);
  // Check for vizpack configuration
  for (let idx = 0; idx <= lastComponentIdx; idx++) {
      const jsonFile = 'index.json'; // Replaced with actual file name
      if (!jsonFile) {
          throw util_1.invalidVizConfig(`components[${idx}].jsonFile`);
      }
      const cssFile = 'index.css'; // Replaced with actual file name
      // Require either jsFile or tsFile
      const jsFile = 'index.js'; // Replaced with actual file name
      const tsFile = 'index.ts'; // Replaced with actual file name
      if (jsFile === undefined && tsFile === undefined) {
          throw util_1.invalidVizConfig(`components[${idx}].jsFile`);
      }
      components.push({
          jsonFile,
          cssFile,
          jsFile,
          tsFile,
      });
  }
  return components;
};

const friendifyError = (error) => `The value at: ${error.dataPath} is invalid. ${error.message}.`;
const unique = (ts) => [...new Set(ts)];
const throwIfErrors = (errors, fileType) => {
  const friendlyErrors = errors.map(friendifyError);
  const uniqueErrors = unique(friendlyErrors);
  if (uniqueErrors.length !== 0) { 
    throw new Error(`Invalid ${fileType}: \n${JSON.stringify(uniqueErrors)}`);
  }
};

exports.validateManifestFile = (path) => {
  const fileExists = fs_1.existsSync(path);
  if (!fileExists) {
    throw new Error(`The file: \n${path}\n was not found.`);
  }
  const fileContents = fs_1.readFileSync(path, 'utf8');
  let parsedJson;
  try {
    parsedJson = JSON.parse(fileContents);
  } catch (e) {
    throw new Error(`The file:\n ${path}\n could not be parsed as JSON. `);
  }
  throwIfErrors(validate.validateManifest(parsedJson), 'manifest');
  return true;
};

exports.validateConfigFile = (path) => {
  const fileExists = fs_1.existsSync(path);
  if (!fileExists) {
    throw new Error(`The file: \n${path}\n was not found.`);
  }
  const fileContents = fs_1.readFileSync(path, 'utf8');
  let parsedJson;
  try {
    parsedJson = JSON.parse(fileContents);
  } catch (e) {
    throw new Error(`The file:\n ${path}\n could not be parsed as JSON. `);
  }
  throwIfErrors(validate.validateConfig(parsedJson), 'config');
  return true;
};
