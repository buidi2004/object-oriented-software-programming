const fs = require('fs');

function replaceFile(path, replacements) {
    if (!fs.existsSync(path)) return;
    let content = fs.readFileSync(path, 'utf8');
    for (let [search, replace] of replacements) {
        content = content.split(search).join(replace);
    }
    fs.writeFileSync(path, content, 'utf8');
}

// Fix static-sites
replaceFile('frontend/app/services/static-sites/page.tsx', [
    ['chỉ 49.000đ/tháng', 'với chi phí vô cùng tiết kiệm']
]);

// Fix security
replaceFile('frontend/app/services/security/page.tsx', [
    ['Chỉ từ 99.000đ/tháng.', 'Với mức giá cực kỳ ưu đãi.']
]);

// Fix ssl
replaceFile('frontend/app/services/ssl-certificates/page.tsx', [
    ['Chỉ từ 199.000đ/năm.', 'Với chi phí tiết kiệm.']
]);

// Fix dedicated
replaceFile('frontend/app/services/dedicated-servers/page.tsx', [
    ['chi phí chỉ từ 50.000đ/IP/tháng.', 'chi phí vô cùng tiết kiệm.']
]);

// Fix databases
replaceFile('frontend/app/services/databases/page.tsx', [
    ['chỉ 99.000đ/tháng', 'với mức giá rẻ']
]);

// Fix games
replaceFile('frontend/app/services/game-servers/page.tsx', [
    ['Chỉ từ 149.000đ/tháng.', 'Mức giá cạnh tranh.']
]);

// Fix storage
replaceFile('frontend/app/services/storage/page.tsx', [
    ['Chỉ từ 50.000đ/tháng', 'Chỉ với chi phí cực kỳ thấp']
]);

// Fix domain
replaceFile('frontend/app/services/domain/page.tsx', [
    ['Giá chỉ từ 99.000đ/năm.', 'Mức giá đăng ký siêu rẻ.']
]);

// Fix servicePages.ts
replaceFile('frontend/src/data/servicePages.ts', [
    ['(add-on từ 50.000đ/tháng)', '(add-on giá ưu đãi)'],
    ['mua thêm 50.000đ/100GB', 'mua thêm với giá rẻ'],
    ['Gói Business Pro chỉ còn 801.000đ/năm thay vì 1.068.000đ.', 'Gói Business Pro hiện đang được giảm giá cực sốc.'],
    ['chỉ 290.000đ/năm đầu', 'giá cực sốc năm đầu'],
    ['Giảm từ 350.000đ', 'Giảm giá sâu'],
    ['giảm 500.000đ', 'đang được giảm giá khủng'],
    ['50.000 đ/tháng', 'Giá ưu đãi'],
    ['100.000 đ/tháng', 'Giá ưu đãi'],
    ['2.500.000 đ/tháng', 'Giá ưu đãi'],
    ['500.000 đ/tháng', 'Giá ưu đãi'],
    ['350.000 đ/tháng', 'Giá ưu đãi'],
    ['120.000 đ/tháng', 'Giá ưu đãi'],
    ['150.000 đ/tháng', 'Giá ưu đãi'],
    ['890.000 đ/năm', 'Giá ưu đãi'],
    ['200.000 đ/tháng', 'Giá ưu đãi'],
    ['80.000 đ/tháng', 'Giá ưu đãi'],
    ['30.000 đ/tháng/domain', 'Giá ưu đãi'],
    ['Từ 50.000 đ/tháng', 'Giá ưu đãi'],
    ['100.000 đ/năm', 'Giá ưu đãi'],
]);

// Fix dashboard hosting page
replaceFile('frontend/app/dashboard/hosting/page.tsx', [
    [' - 49.000đ/th', ''],
    [' - 149.000đ/th', ''],
    [' - 299.000đ/th', '']
]);

// Fix domain search
replaceFile('frontend/app/domains/search/page.tsx', [
    ['250.000đ', 'Giá ưu đãi']
]);

console.log('Prices removed from marketing texts.');
