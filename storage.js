
async function getPosts() {
    const response = await fetch("./data/posts.json");

    if (!response.ok) {
        throw new Error("Không tải được data/posts.json");
    }

    const data = await response.json();

    // Hỗ trợ cả JSON dạng {"posts": [...]} và dạng [...]
    const posts = Array.isArray(data) ? data : data.posts;

    if (!Array.isArray(posts)) {
        throw new Error("posts.json phải chứa một mảng bài báo");
    }

    return posts;
}

async function getCategories() {
    const response = await fetch("./data/categories.json");

    if (!response.ok) {
        throw new Error("Không tải được data/categories.json");
    }

    const data = await response.json();

    // Hỗ trợ cả JSON dạng {"menu": [...]} và dạng [...]
    const categories = Array.isArray(data) ? data : data.menu;

    if (!Array.isArray(categories)) {
        throw new Error("categories.json phải chứa danh sách chuyên mục");
    }

    return categories;
}
