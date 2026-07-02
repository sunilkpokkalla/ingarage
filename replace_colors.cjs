const fs = require('fs');
const path = require('path');

const walk = function(dir, done) {
  let results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    let i = 0;
    (function next() {
      let file = list[i++];
      if (!file) return done(null, results);
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            next();
          });
        } else {
          if (file.endsWith('.tsx')) {
            results.push(file);
          }
          next();
        }
      });
    })();
  });
};

const replacements = {
  'bg-surface-950': 'bg-slate-50',
  'bg-surface-900': 'bg-white',
  'bg-surface-800': 'bg-slate-100',
  'border-surface-800': 'border-slate-200',
  'border-surface-700': 'border-slate-300',
  'border-surface-900': 'border-slate-100',
  'text-surface-400': 'text-slate-500',
  'text-surface-300': 'text-slate-600',
  'text-surface-200': 'text-slate-700',
  'text-surface-500': 'text-slate-400',
  'hover:bg-surface-800': 'hover:bg-slate-100',
  'hover:bg-surface-700': 'hover:bg-slate-200',
  'hover:text-white': 'hover:text-slate-900',
  'text-white': 'text-slate-900',
  // Fix button text white
  'text-slate-900 bg-brand-500': 'text-white bg-brand-500',
};

walk('./src', function(err, results) {
  if (err) throw err;
  results.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Global replaces
    content = content.replace(/bg-surface-950/g, 'bg-slate-50');
    content = content.replace(/bg-surface-900/g, 'bg-white');
    content = content.replace(/bg-surface-800/g, 'bg-slate-100');
    content = content.replace(/border-surface-800/g, 'border-slate-200');
    content = content.replace(/border-surface-700/g, 'border-slate-300');
    content = content.replace(/border-surface-900/g, 'border-slate-100');
    content = content.replace(/text-surface-400/g, 'text-slate-500');
    content = content.replace(/text-surface-300/g, 'text-slate-600');
    content = content.replace(/text-surface-200/g, 'text-slate-700');
    content = content.replace(/text-surface-500/g, 'text-slate-400');
    content = content.replace(/hover:bg-surface-800/g, 'hover:bg-slate-50');
    content = content.replace(/hover:bg-surface-700/g, 'hover:bg-slate-100');
    content = content.replace(/hover:text-white/g, 'hover:text-slate-900');
    content = content.replace(/text-white/g, 'text-slate-900');
    
    // Fix specific cases where we actually need white text (like on brand buttons)
    // For a button that has bg-brand-500, we want text-white
    content = content.replace(/text-slate-900 bg-brand-500/g, 'text-white bg-brand-500');
    content = content.replace(/text-slate-900 bg-emerald-500/g, 'text-white bg-emerald-500');
    content = content.replace(/text-slate-900 bg-red-500/g, 'text-white bg-red-500');
    
    fs.writeFileSync(file, content, 'utf8');
  });
  console.log('Colors replaced in ' + results.length + ' files');
});
