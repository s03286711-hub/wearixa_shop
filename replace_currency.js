const fs = require('fs');
const path = require('path');

const filesToProcess = [
    {
        path: 'backend/controllers/paymentController.js',
        replacements: [
            { search: /currency:\s*'usd'/g, replace: "currency: 'pkr'" },
            { search: /currency:\s*"usd"/g, replace: 'currency: "pkr"' }
        ]
    },
    {
        path: 'backend/controllers/orderController.js',
        replacements: [
            { search: /currency:\s*'usd'/g, replace: "currency: 'pkr'" },
            { search: /currency:\s*"usd"/g, replace: 'currency: "pkr"' }
        ]
    },
    {
        path: 'frontend/src/app/page.tsx',
        replacements: [
            { search: /\$\$\{/g, replace: 'Rs. ${' },
            { search: /'\$'/g, replace: "'Rs. '" }
        ]
    },
    {
        path: 'frontend/src/app/admin/page.tsx',
        replacements: [
            { search: /value:\s*`\$([^`]+)`/g, replace: "value: `Rs. $1`" },
            { search: /\[METRIC_REV_USD\]/g, replace: '[METRIC_REV_PKR]' }
        ]
    },
    {
        path: 'frontend/src/app/admin/analytics/page.tsx',
        replacements: [
            { search: /value:\s*`\$([^`]+)`/g, replace: "value: `Rs. $1`" }
        ]
    },
    {
        path: 'frontend/src/app/admin/finance/page.tsx',
        replacements: [
            { search: /value:\s*`\$([^`]+)`/g, replace: "value: `Rs. $1`" },
            { search: /\+ \$0\.30/g, replace: '+ Rs. 30' } // Example stripe fee change
        ]
    },
    {
        path: 'frontend/src/app/admin/orders/page.tsx',
        replacements: [
            { search: /value:\s*`\$([^`]+)`/g, replace: "value: `Rs. $1`" },
            { search: /PAID_VOLUME_USD/g, replace: 'PAID_VOLUME_PKR' }
        ]
    },
    {
        path: 'frontend/src/app/admin/products/page.tsx',
        replacements: [
            { search: /val:\s*`\$([^`]+)`/g, replace: "val: `Rs. $1`" }
        ]
    },
    {
        path: 'frontend/src/app/admin/promos/page.tsx',
        replacements: [
            { search: /\$\$\{/g, replace: 'Rs. ${' }
        ]
    },
    {
        path: 'frontend/src/app/cart/page.tsx',
        replacements: [
            { search: /value:\s*`\$([^`]+)`/g, replace: "value: `Rs. $1`" },
            { search: /value:\s*shipping === 0 \? 'FREE' : `\$([^`]+)`/g, replace: "value: shipping === 0 ? 'FREE' : `Rs. $1`" }
        ]
    },
    {
        path: 'frontend/src/app/checkout/page.tsx',
        replacements: [
            { search: /\$\$\{/g, replace: 'Rs. ${' },
            { search: /`\$([^`]+)`/g, replace: '`Rs. $1`' }
        ]
    },
    {
        path: 'frontend/src/app/product/[id]/page.tsx',
        replacements: [
            { search: /\$\$\{/g, replace: 'Rs. ${' }
        ]
    },
    {
        path: 'frontend/src/app/profile/wallet/page.tsx',
        replacements: [
            { search: /\$\$\{/g, replace: 'Rs. ${' }
        ]
    },
    {
        path: 'frontend/src/components/DigitalCharts.tsx',
        replacements: [
            { search: /\$\$\{/g, replace: 'Rs. ${' }
        ]
    },
    {
        path: 'frontend/src/components/QuickViewModal.tsx',
        replacements: [
            { search: />\$([^<]+)</g, replace: '>Rs. $1<' }
        ]
    },
    {
        path: 'frontend/src/components/ProductCard.tsx',
        replacements: [
            { search: />\$([^<]+)</g, replace: '>Rs. $1<' },
            { search: /^\s*\$\{product/gm, replace: '                    Rs. ${product' }
        ]
    }
];

const workspaceRoot = 'd:\\wearixa';

filesToProcess.forEach(fileDef => {
    const fullPath = path.join(workspaceRoot, fileDef.path);
    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        let original = content;
        fileDef.replacements.forEach(rep => {
            content = content.replace(rep.search, rep.replace);
        });
        if (content !== original) {
            fs.writeFileSync(fullPath, content, 'utf8');
            console.log(`Updated: ${fileDef.path}`);
        } else {
            console.log(`No changes needed in: ${fileDef.path}`);
        }
    } else {
        console.error(`File not found: ${fullPath}`);
    }
});

// A general sweep for remaining $${ in frontend
const walkSync = function(dir, filelist) {
    let files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function(file) {
        if (fs.statSync(path.join(dir, file)).isDirectory()) {
            filelist = walkSync(path.join(dir, file), filelist);
        }
        else {
            if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js')) {
                filelist.push(path.join(dir, file));
            }
        }
    });
    return filelist;
};

const allFiles = walkSync(path.join(workspaceRoot, 'frontend', 'src'), []);
let replacedFiles = 0;
allFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let newContent = content.replace(/\$\$\{/g, 'Rs. ${');
    newContent = newContent.replace(/>\$\{/g, '>Rs. ${'); // for >${price}<
    // Quickview modal uses span tags like <span>${price}</span>
    newContent = newContent.replace(/>\$(?=\d)/g, '>Rs. ');
    if (content !== newContent) {
        fs.writeFileSync(file, newContent, 'utf8');
        console.log(`General sweep updated: ${file.replace(workspaceRoot, '')}`);
        replacedFiles++;
    }
});
console.log(`General sweep updated ${replacedFiles} files.`);
