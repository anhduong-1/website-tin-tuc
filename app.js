
document.addEventListener("DOMContentLoaded", initWebsite);

let allPosts = [];
let allCategories = [];

// Ảnh minh họa tương ứng với từng bài báo
const articleImages = {
  "dtri-20261018180243100":
    "https://images.unsplash.com/photo-1519074002996-a69e7ac46a42?auto=format&fit=crop&w=1200&q=80",

  "dtri-20261018112623656":
    "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80",

  "dtri-20261018101324549":
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",

  "dtri-20261018193054298":
    "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80",

  "dtri-20261018172857599":
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",

  "dtri-20261018203400350":
    "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1200&q=80",

  "dtri-20261014144222699":
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",

  "dtri-20261018205006846":
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80"
};

async function initWebsite() {
  const loading = document.getElementById("loading-message");

  const dateElement = document.getElementById("today-date");

  if (dateElement) {
    dateElement.textContent = new Date().toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  }

  try {
    allCategories = await getCategories();
    allPosts = await getPosts();

    // Tự động thêm ảnh theo ID bài viết
    allPosts = allPosts.map(post => ({
      ...post,
      image: post.image || articleImages[post.id] || ""
    }));

    renderNavbar();
    renderSidebar();
    renderNews(allPosts);

    const breaking = document.getElementById("breaking-news");

    if (breaking) {
      breaking.textContent = allPosts[0]
        ? allPosts[0].title
        : "Chào mừng bạn đến với Tin Tức 24H";
    }

    if (loading) {
      loading.hidden = true;
    }
  } catch (error) {
    console.error("Lỗi tải dữ liệu:", error);

    if (loading) {
      loading.hidden = false;
      loading.textContent =
        "Không thể tải tin tức. Hãy kiểm tra file JSON và máy chủ Live Server.";
    }
  }
}

function flattenCategories(categories) {
  return categories.flatMap(category => [
    category,
    ...(Array.isArray(category.children)
      ? flattenCategories(category.children)
      : [])
  ]);
}

function renderNavbar() {
  const menu = document.getElementById("category-menu");

  if (!menu) return;

  menu.replaceChildren();

  flattenCategories(allCategories)
    .filter(category => category.type === "category")
    .forEach(category => {
      const link = document.createElement("a");

      link.href = "#";
      link.textContent = category.title;

      link.addEventListener("click", event => {
        event.preventDefault();

        const filtered = allPosts.filter(post =>
          post.category === category.title ||
          post.categoryId === category.id
        );

        setActiveCategory(link);
        renderNews(filtered, category.title);
      });

      menu.appendChild(link);
    });

  const homeLink = document.getElementById("home-link");

  if (homeLink) {
    homeLink.onclick = event => {
      event.preventDefault();
      renderNews(allPosts);
      setActiveCategory(null);
    };
  }
}

function setActiveCategory(activeLink) {
  document.querySelectorAll(".category-menu a").forEach(link => {
    link.classList.toggle("active", link === activeLink);
  });
}

function renderSidebar() {
  const container = document.getElementById("sidebar-categories");

  if (!container) return;

  container.replaceChildren();

  const categories = flattenCategories(allCategories)
    .filter(category => category.type === "category");

  categories.slice(0, 8).forEach(category => {
    const link = document.createElement("a");

    link.href = "#";
    link.textContent = category.title;

    link.addEventListener("click", event => {
      event.preventDefault();

      const filtered = allPosts.filter(post =>
        post.category === category.title ||
        post.categoryId === category.id
      );

      renderNews(filtered, category.title);

      const latestNews = document.getElementById("latest-news");

      if (latestNews) {
        latestNews.scrollIntoView({ behavior: "smooth" });
      }
    });

    container.appendChild(link);
  });
}

function renderNews(posts, title = "Tin tức nổi bật") {
  const pageTitle = document.getElementById("page-title");
  const featured = document.getElementById("featured-news");
  const list = document.getElementById("news-list");
  const count = document.getElementById("news-count");

  if (!featured || !list || !count) return;

  if (pageTitle) {
    pageTitle.textContent = title;
  }

  featured.replaceChildren();
  list.replaceChildren();

  const sorted = [...posts].sort(
    (a, b) =>
      new Date(b.publishedAt || 0) -
      new Date(a.publishedAt || 0)
  );

  count.textContent = `${sorted.length} bài viết`;

  if (sorted.length === 0) {
    const message = document.createElement("p");
    message.className = "empty-message";
    message.textContent = "Chưa có bài viết trong chuyên mục này.";
    featured.appendChild(message);
    return;
  }

  const mainPost = sorted[0];
  const sidePosts = sorted.slice(1, 3);
  const remaining = sorted.slice(3);

  // Bài viết nổi bật
  const main = document.createElement("article");
  main.className = "featured-main";

  main.appendChild(createImage(mainPost));

  const category = document.createElement("span");
  category.className = "news-category";
  category.textContent = mainPost.category || "Tin tức";

  const titleLink = createPostLink(mainPost);
  const heading = document.createElement("h2");
  heading.textContent = mainPost.title;
  titleLink.appendChild(heading);

  const excerpt = document.createElement("p");
  excerpt.className = "news-excerpt";
  excerpt.textContent = mainPost.excerpt || "";

  main.append(
    category,
    titleLink,
    excerpt,
    createMeta(mainPost)
  );

  // Hai bài viết nhỏ bên cạnh
  const side = document.createElement("div");
  side.className = "featured-side";

  sidePosts.forEach(post => {
    const card = document.createElement("article");
    card.className = "featured-small";

    card.appendChild(createImage(post));

    const content = document.createElement("div");
    const link = createPostLink(post);

    const heading = document.createElement("h3");
    heading.textContent = post.title;

    link.appendChild(heading);
    content.append(link, createMeta(post));
    card.appendChild(content);

    side.appendChild(card);
  });

  featured.append(main, side);

  // Các bài viết còn lại
  remaining.forEach(post => {
    const card = document.createElement("article");
    card.className = "news-card";

    card.appendChild(createImage(post));

    const content = document.createElement("div");
    const link = createPostLink(post);

    const heading = document.createElement("h3");
    heading.textContent = post.title;
    link.appendChild(heading);

    const excerpt = document.createElement("p");
    excerpt.className = "news-excerpt";
    excerpt.textContent = post.excerpt || "";

    content.append(
      link,
      excerpt,
      createMeta(post)
    );

    card.appendChild(content);
    list.appendChild(card);
  });
}

function createPostLink(post) {
  const link = document.createElement("a");

  link.className = "news-link";
  link.href = "detail.html?id=" + encodeURIComponent(post.id);

  return link;
}

function createImage(post) {
  if (post.image) {
    const image = document.createElement("img");

    image.src = post.image;
    image.alt = post.title || "Ảnh tin tức";
    image.loading = "lazy";

    image.addEventListener("error", () => {
      const placeholder = createPlaceholder();
      image.replaceWith(placeholder);
    });

    return image;
  }

  return createPlaceholder();
}

function createPlaceholder() {
  const element = document.createElement("div");

  element.className = "news-image-placeholder";
  element.textContent = "TIN TỨC 24H";

  return element;
}

function createMeta(post) {
  const meta = document.createElement("p");
  meta.className = "news-meta";

  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("vi-VN")
    : "Ngày đăng chưa cập nhật";

  meta.textContent =
    `${post.author || "Ban biên tập"} · ${date}`;

  return meta;
}
