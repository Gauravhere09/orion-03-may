
import { GeneratedCode } from './apiTypes';

// Function to enhance user prompt for code generation
export const enhancePrompt = (prompt: string): string => {
  // Advanced prompt engineering for better code generation
  return `Generate code for: ${prompt}
  
  Please create a responsive, well-structured web application with the following specifications:
  
  1. Use semantic HTML5 elements and best practices
  2. Implement responsive design with mobile-first approach
  3. Add detailed comments explaining logic and structure
  4. Include error handling where appropriate
  5. Ensure accessibility compliance
  6. Optimize for performance
  
  Format your response with proper code blocks:
  
  \`\`\`html
  <!-- HTML code here -->
  \`\`\`
  
  \`\`\`css
  /* CSS code here with responsive breakpoints */
  \`\`\`
  
  \`\`\`javascript
  // Well-structured JavaScript with appropriate comments
  \`\`\`
  
  Do NOT include any explanatory text outside the code blocks. Make sure to provide a complete working application, not just code snippets.`;
};

// Parse code response into HTML, CSS, and JS
export const parseCodeResponse = (response: string): GeneratedCode => {
  if (!response) {
    return {};
  }
  
  const result: GeneratedCode = {};
  
  try {
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
  } catch (error) {
    console.error('Error parsing code response:', error);
  }
  
  return result;
};

// Training data for the model (to be expanded further as needed)
export const codeGenerationPrompt = `You are an expert web developer assistant specialized in creating high-quality, responsive web applications with HTML, CSS, and JavaScript.

For code generation tasks:
1. First, analyze the user's request thoroughly
2. Design a responsive and accessible solution
3. Structure your code with semantic HTML5 elements
4. Use modern CSS practices including flexbox/grid for layouts
5. Write clean, well-commented JavaScript
6. Implement error handling where appropriate
7. Format your response using code blocks (html, css, js)
8. Do not include explanatory text outside of code blocks

Your code should be production-ready, well-structured, and follow best practices for web development.`;

// Unified approach to progressively improve existing code
export const enhanceExistingCode = (
  prompt: string, 
  existingHtml: string, 
  existingCss: string, 
  existingJs: string
): string => {
  return `Modify the following code based on this request: "${prompt}"
  
  EXISTING HTML:
  \`\`\`html
  ${existingHtml}
  \`\`\`
  
  EXISTING CSS:
  \`\`\`css
  ${existingCss}
  \`\`\`
  
  EXISTING JS:
  \`\`\`js
  ${existingJs}
  \`\`\`
  
  Please implement the requested changes while preserving the existing functionality. Return the COMPLETE updated code in the same format with html, css, and js code blocks. Do not include explanatory text outside the code blocks.`;
};
