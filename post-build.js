import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the dist directory
const distDir = path.join(__dirname, 'dist');

// Function to recursively find all .gz files
async function findGzFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return findGzFiles(fullPath);
      } else if (entry.name.endsWith('.gz')) {
        return [fullPath];
      }
      return [];
    })
  );
  return files.flat();
}

// Function to fix the paths in the dist directory
async function fixGzPaths() {
  try {
    console.log('Fixing compressed file paths...');

    // Find all .gz files
    const gzFiles = await findGzFiles(distDir);

    for (const filePath of gzFiles) {
      // Check if the file path contains the absolute path
      if (filePath.includes('/Users/greenhacker/Desktop/Working/gesture-canvas-art-stream-cef201c5063320596cadbce842d1212064f9ab59')) {
        // Get the correct path relative to the dist directory
        const relativePath = filePath.replace(distDir, '');
        const correctPath = path.join(distDir, relativePath.split('/Users/greenhacker/Desktop/Working/gesture-canvas-art-stream-cef201c5063320596cadbce842d1212064f9ab59').pop());

        // Create the directory if it doesn't exist
        const dirName = path.dirname(correctPath);
        await fs.mkdir(dirName, { recursive: true });

        // Move the file to the correct location
        await fs.rename(filePath, correctPath);
        console.log(`Fixed: ${path.relative(distDir, correctPath)}`);
      }
    }

    console.log('All compressed files fixed successfully!');
  } catch (error) {
    console.error('Error fixing compressed files:', error);
    process.exit(1);
  }
}

// Run the function
fixGzPaths();
