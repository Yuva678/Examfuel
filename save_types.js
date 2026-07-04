import fs from 'fs';

const inputPath = 'C:/Users/Admin/.gemini/antigravity-ide/brain/26e83a8c-bafc-47a8-b890-8a52479c0378/.system_generated/steps/86/output.txt';
const outputPath = 'd:/New folder/exammaster/src/types/supabase.ts';

const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
fs.writeFileSync(outputPath, data.types);
console.log('Types written successfully!');
