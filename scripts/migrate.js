import fs from 'fs';
import path from 'path';

const filesToFix = [
  'src/app/shop/page.jsx',
  'src/app/cart/page.jsx',
  'src/app/checkout/page.jsx',
  'src/app/auth/page.jsx',
  'src/app/blog/page.jsx',
  'src/app/dashboard/page.jsx',
  'src/app/product/[id]/page.jsx'
];

filesToFix.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf-8');

  // Fix relative imports (add one more ../)
  content = content.replace(/from '\.\.\//g, "from '../../");
  content = content.replace(/from "\.\.\//g, 'from "../../');
  
  // Specific fix for react-router-dom -> next/navigation & next/link
  content = content.replace(/import \{([^}]+)\} from 'react-router-dom';/g, (match, importsStr) => {
    const imports = importsStr.split(',').map(s => s.trim());
    let newImports = '';
    
    // next/link
    if (imports.includes('Link')) {
      newImports += `import Link from 'next/link';\n`;
    }
    
    // next/navigation
    const navImports = [];
    if (imports.includes('useNavigate')) navImports.push('useRouter');
    if (imports.includes('useParams')) navImports.push('useParams');
    if (imports.includes('useLocation')) navImports.push('usePathname');
    
    if (navImports.length > 0) {
      newImports += `import { ${navImports.join(', ')} } from 'next/navigation';\n`;
    }
    
    return newImports.trim();
  });

  // Replace useNavigate() -> useRouter()
  content = content.replace(/useNavigate\(\)/g, 'useRouter()');
  // Navigate function calls usually happen as exactly navigate('/path')
  // We'll leave `navigate` variable name as is, just it's assigned from useRouter now:
  // e.g. const navigate = useRouter(); navigate.push('/path');
  // Or better, let's rename the variable:
  // content = content.replace(/const navigate = useRouter\(\);/g, 'const router = useRouter();');
  // but they use `navigate('/login')`, which means `router.push('/login')`.
  // It's easier to just replace `navigate(` with `router.push(`.
  content = content.replace(/const navigate = useRouter\(\);/g, 'const router = useRouter();');
  content = content.replace(/navigate\(/g, 'router.push(');

  // Replace Link to= with Link href=
  content = content.replace(/<Link ([^>]*)to=/g, '<Link $1href=');
  
  // Add "use client" since these have hooks
  if (!content.includes('"use client"')) {
    content = `"use client";\n` + content;
  }

  fs.writeFileSync(filePath, content, 'utf-8');
});

// Fix Home page (doesn't need ../ fixes, but needs react-router-dom fixes)
const homePath = path.join(process.cwd(), 'src/app/page.jsx');
if (fs.existsSync(homePath)) {
  let content = fs.readFileSync(homePath, 'utf-8');
  content = content.replace(/import \{([^}]+)\} from 'react-router-dom';/g, (match, importsStr) => {
    const imports = importsStr.split(',').map(s => s.trim());
    let newImports = '';
    if (imports.includes('Link')) {
      newImports += `import Link from 'next/link';\n`;
    }
    const navImports = [];
    if (imports.includes('useNavigate')) navImports.push('useRouter');
    if (imports.includes('useParams')) navImports.push('useParams');
    if (imports.includes('useLocation')) navImports.push('usePathname');
    
    if (navImports.length > 0) {
      newImports += `import { ${navImports.join(', ')} } from 'next/navigation';\n`;
    }
    return newImports.trim();
  });
  content = content.replace(/useNavigate\(\)/g, 'useRouter()');
  content = content.replace(/const navigate = useRouter\(\);/g, 'const router = useRouter();');
  content = content.replace(/navigate\(/g, 'router.push(');
  content = content.replace(/<Link ([^>]*)to=/g, '<Link $1href=');
  if (!content.includes('"use client"')) {
    content = `"use client";\n` + content;
  }
  fs.writeFileSync(homePath, content, 'utf-8');
}
