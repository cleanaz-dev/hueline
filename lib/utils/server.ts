import fs from 'fs';
import path from 'path';

export function getRalClassicColors() {
  const csvPath = path.join(process.cwd(), 'lib', 'utils', 'ral_classic.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  
  const lines = csvContent.trim().split('\n');
  
  const colors = lines.slice(1).map(line => {
    const values = line.split(',');
    return {
      name: values[5], // English name
      ral: values[0],  // RAL code
      hex: values[2],
      lrv: values[4],
      rgb: values[1]   // HEX code
    };
  }).filter(color => color.ral && color.name && color.hex);
  
  return colors;
}

export function getRalClassicCSV(): string {
  const csvPath = path.join(process.cwd(), 'lib', 'utils', 'ral_classic.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  return csvContent;
}