const fs = require('fs');
const files = [
  'src/pages/marketing/Integrations.tsx',
  'src/pages/marketing/About.tsx',
  'src/pages/marketing/Features.tsx',
  'src/pages/Home.tsx',
  'src/pages/marketing/Contact.tsx',
  'src/pages/Register.tsx',
  'src/pages/OldDashboard.tsx',
  'src/pages/Login.tsx',
  'src/layouts/DashboardLayout.tsx',
  'package.json',
  'src/layouts/MarketingLayout.tsx',
  'index.html'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/CollisionPro/g, 'InGarage');
    content = content.replace(/collisionpro/g, 'ingarage');
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
  }
});
