#!/usr/bin/env node

/**
 * Dead Code Detection Script
 * Analyzes import graph starting from entry points
 * and reports files that are not reachable
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');
const srcDir = path.join(projectRoot, 'src');
const reportsDir = path.join(projectRoot, 'reports');

// Entry points
const entryPoints = [
  'src/main.tsx',
  'src/App.tsx'
];

// Directories to scan
const scanDirs = ['src'];

// Files to exclude from analysis
const excludePatterns = [
  /\.test\.[jt]sx?$/,
  /\.spec\.[jt]sx?$/,
  /\.stories\.[jt]sx?$/,
  /\/node_modules\//,
  /\/dist\//,
  /\/build\//
];

const importedFiles = new Set();
const allFiles = new Set();

/**
 * Extract imports from file content
 */
function extractImports(content, filePath) {
  const imports = [];
  const fileDir = path.dirname(filePath);
  
  // Match ES6 imports
  const importRegex = /import\s+(?:[\w*{}\s,]+\s+from\s+)?['"]([^'"]+)['"]/g;
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    
    // Skip node_modules and external imports
    if (!importPath.startsWith('.') && !importPath.startsWith('@/')) {
      continue;
    }
    
    // Resolve @/ alias to src/
    let resolvedPath = importPath.startsWith('@/') 
      ? importPath.replace('@/', 'src/')
      : path.join(fileDir, importPath);
    
    // Try different extensions
    const extensions = ['', '.ts', '.tsx', '.js', '.jsx'];
    let foundPath = null;
    
    for (const ext of extensions) {
      const testPath = path.join(projectRoot, resolvedPath + ext);
      if (fs.existsSync(testPath) && fs.statSync(testPath).isFile()) {
        foundPath = path.relative(projectRoot, testPath);
        break;
      }
    }
    
    // Check if it's a directory with index file
    if (!foundPath) {
      const indexPath = path.join(projectRoot, resolvedPath, 'index');
      for (const ext of extensions) {
        const testPath = indexPath + ext;
        if (fs.existsSync(testPath) && fs.statSync(testPath).isFile()) {
          foundPath = path.relative(projectRoot, testPath);
          break;
        }
      }
    }
    
    if (foundPath) {
      imports.push(foundPath.replace(/\\/g, '/'));
    }
  }
  
  return imports;
}

/**
 * Recursively analyze imports starting from a file
 */
function analyzeFile(filePath, visited = new Set()) {
  const normalizedPath = filePath.replace(/\\/g, '/');
  
  if (visited.has(normalizedPath)) {
    return;
  }
  
  visited.add(normalizedPath);
  importedFiles.add(normalizedPath);
  
  const fullPath = path.join(projectRoot, filePath);
  
  if (!fs.existsSync(fullPath)) {
    return;
  }
  
  const content = fs.readFileSync(fullPath, 'utf-8');
  const imports = extractImports(content, filePath);
  
  for (const imp of imports) {
    analyzeFile(imp, visited);
  }
}

/**
 * Recursively scan directory for all source files
 */
function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      scanDirectory(fullPath);
    } else if (stat.isFile() && /\.[jt]sx?$/.test(file)) {
      const relativePath = path.relative(projectRoot, fullPath).replace(/\\/g, '/');
      
      // Check if file should be excluded
      const shouldExclude = excludePatterns.some(pattern => pattern.test(relativePath));
      if (!shouldExclude) {
        allFiles.add(relativePath);
      }
    }
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 Starting dead code analysis...\n');
  
  // Scan all files
  console.log('📂 Scanning source files...');
  for (const dir of scanDirs) {
    scanDirectory(path.join(projectRoot, dir));
  }
  console.log(`   Found ${allFiles.size} source files\n`);
  
  // Analyze imports from entry points
  console.log('🔗 Analyzing import graph...');
  for (const entry of entryPoints) {
    console.log(`   Starting from ${entry}`);
    analyzeFile(entry);
  }
  console.log(`   Found ${importedFiles.size} imported files\n`);
  
  // Find dead code
  const deadFiles = [...allFiles].filter(file => !importedFiles.has(file));
  deadFiles.sort();
  
  console.log(`💀 Found ${deadFiles.length} potentially unused files\n`);
  
  // Create reports directory
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  // Write CSV report
  const csvPath = path.join(reportsDir, 'dead-code-candidates.csv');
  const csvContent = 'File,Size (bytes)\n' + deadFiles.map(file => {
    const fullPath = path.join(projectRoot, file);
    const size = fs.existsSync(fullPath) ? fs.statSync(fullPath).size : 0;
    return `${file},${size}`;
  }).join('\n');
  fs.writeFileSync(csvPath, csvContent);
  console.log(`✅ CSV report written to ${csvPath}`);
  
  // Write JSON report
  const jsonPath = path.join(reportsDir, 'dead-code-candidates.json');
  const jsonContent = JSON.stringify({
    timestamp: new Date().toISOString(),
    total_files: allFiles.size,
    imported_files: importedFiles.size,
    dead_files: deadFiles.length,
    candidates: deadFiles.map(file => {
      const fullPath = path.join(projectRoot, file);
      const size = fs.existsSync(fullPath) ? fs.statSync(fullPath).size : 0;
      return { file, size };
    })
  }, null, 2);
  fs.writeFileSync(jsonPath, jsonContent);
  console.log(`✅ JSON report written to ${jsonPath}\n`);
  
  // Summary
  console.log('📊 Summary:');
  console.log(`   Total source files: ${allFiles.size}`);
  console.log(`   Imported files: ${importedFiles.size}`);
  console.log(`   Potentially unused: ${deadFiles.length}`);
  console.log(`   Coverage: ${((importedFiles.size / allFiles.size) * 100).toFixed(1)}%`);
}

main();
