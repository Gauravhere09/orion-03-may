
import { GeneratedCode } from './apiTypes';

// Function to enhance user prompt for code generation
export const enhancePrompt = (prompt: string): string => {
  return `Generate code for: ${prompt}
  
  Respond with well-structured, commented HTML, CSS, and JavaScript code to create this application.
  Format your response with proper code blocks:
  
  \`\`\`html
  <!-- HTML code here -->
  \`\`\`
  
  \`\`\`css
  /* CSS code here */
  \`\`\`
  
  \`\`\`javascript
  // JavaScript code here
  \`\`\`
  
  Do NOT include any explanatory text outside the code blocks. Make sure to provide actual code, not placeholders or code skeleton.`;
};

// Parse code response into HTML, CSS, and JS
export const parseCodeResponse = (response: string): GeneratedCode => {
  const result: GeneratedCode = {};
  
  const htmlMatch = response.match(/```html\n([\s\S]*?)```/);
  if (htmlMatch && htmlMatch[1]) {
    result.html = htmlMatch[1].trim();
  }
  
  const cssMatch = response.match(/```css\n([\s\S]*?)```/);
  if (cssMatch && cssMatch[1]) {
    result.css = cssMatch[1].trim();
  }
  
  const jsMatch = response.match(/```javascript\n([\s\S]*?)```/) || response.match(/```js\n([\s\S]*?)```/);
  if (jsMatch && jsMatch[1]) {
    result.js = jsMatch[1].trim();
  }
  
  if (result.html) {
    result.preview = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${result.css || ''}</style>
      </head>
      <body>
        ${result.html}
        <script>${result.js || ''}</script>
      </body>
      </html>
    `;
  }
  
  return result;
};
