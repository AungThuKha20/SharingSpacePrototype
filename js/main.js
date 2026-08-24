const AUTH_KEY = "writespace_logged_in";
const POSTS_KEY = "writespace_posts";
const COMMENTS_KEY = "writespace_comments";
const DRAFT_KEY = "writespace_draft";

const seedPosts = [
  {
    id: "etl-pipeline",
    title: "What I learned building my first ETL pipeline",
    subtitle: "A practical reflection on extracting, transforming and loading data.",
    category: "data engineering",
    author: "Aung Kha",
    initials: "AK",
    date: "Aug 20, 2026",
    readTime: 8,
    content: `<p>Building a data pipeline changes the way you think about software. Instead of a user clicking a button and immediately seeing a result, the system has to move information reliably through several stages.</p><h2>Start with the data flow</h2><p>The first step was understanding where the source data came from, what format it used and what the final database needed to contain. This made the pipeline easier to reason about before writing code.</p><blockquote>Good data engineering starts with understanding the flow of data, not with choosing a tool.</blockquote><h2>Extract, transform and load</h2><p>The pipeline can be divided into three clear stages. Extraction reads the source files, transformation cleans and reshapes the records, and loading stores the resulting data in PostgreSQL.</p><pre><code>source → extract → transform → validate → load</code></pre><h2>What I would improve next</h2><p>A prototype pipeline is only the beginning. Future improvements could include orchestration, cloud storage, stronger data quality checks and automated monitoring.</p>`
  },
  {
    id: "frontend-to-data",
    title: "From frontend development to data engineering",
    subtitle: "Why transferable software skills matter when changing technical careers.",
    category: "programming",
    author: "Phyo Thiha",
    initials: "PT",
    date: "Aug 18, 2026",
    readTime: 6,
    content: `<p>Moving between technical disciplines does not mean starting from zero. Software development habits such as debugging, version control and structured problem solving remain useful when learning data engineering.</p><h2>Transferable foundations</h2><p>Understanding how applications are structured makes it easier to reason about data flows, APIs and production systems.</p><h2>Keep building</h2><p>Small end-to-end projects are useful because they connect individual technologies into a working system.</p>`
  },
  {
    id: "security-mistakes",
    title: "Five security mistakes students make in web projects",
    subtitle: "A practical introduction to authentication, authorisation and secure input handling.",
    category: "cybersecurity",
    author: "Khaing Myo Lin",
    initials: "KM",
    date: "Aug 17, 2026",
    readTime: 5,
    content: `<p>Student web projects often focus on functionality first. Security should be considered at the same time because user input, authentication and access control affect the whole application.</p><h2>Authentication is not authorisation</h2><p>Authentication establishes who a user is. Authorisation determines what that user is allowed to do.</p><h2>Validate user input</h2><p>Never assume that browser input is trustworthy. Production systems should validate and sanitise data on the server.</p>`
  },
  {
    id: "ml-without-hype",
    title: "Understanding machine learning without the hype",
    subtitle: "A beginner-friendly look at models, data and what happens during training.",
    category: "ai",
    author: "Wyne Thit Htoo",
    initials: "WT",
    date: "Aug 15, 2026",
    readTime: 7,
    content: `<p>Machine learning becomes easier to understand when it is treated as a data and evaluation problem rather than magic.</p><h2>Start with the dataset</h2><p>The quality and structure of training data have a major effect on what a model can learn.</p><h2>Evaluate the result</h2><p>A useful model needs an appropriate evaluation method and a clear understanding of the problem it is solving.</p>`
  }
];

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const value = JSON.parse(raw);
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function getPosts() {
  const stored = readJSON(POSTS_KEY, null);

  if (!Array.isArray(stored) || stored.length === 0) {
    const fresh = [...seedPosts];
    localStorage.setItem(POSTS_KEY, JSON.stringify(fresh));
    return fresh;
  }

  return stored;
}

function savePosts(posts) {
  if (Array.isArray(posts)) {
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  }
}

function isLoggedIn() {
  return localStorage.getItem(AUTH_KEY) === "true";
}

function logout() {
  localStorage.removeItem(AUTH_KEY);
  window.location.replace("index.html");
}

function setupHeader() {
  const signedIn = isLoggedIn();

  document.querySelectorAll("#signinLink").forEach((el) => {
    el.style.display = signedIn ? "none" : "inline-block";
  });

  document.querySelectorAll("#dashboardLink").forEach((el) => {
    el.style.display = signedIn ? "inline-block" : "none";
  });

  document.querySelectorAll("#logoutButton").forEach((el) => {
    el.style.display = signedIn ? "inline-block" : "none";

    // Prevent duplicate listeners if this function is ever called again.
    if (!el.dataset.logoutReady) {
      el.dataset.logoutReady = "true";
      el.addEventListener("click", logout);
    }
  });

  document.querySelectorAll("[data-write-link]").forEach((el) => {
    el.href = signedIn
      ? "create-post.html"
      : "login.html?next=create-post.html";
  });
}

function requireAuth(next = "dashboard.html") {
  if (isLoggedIn()) return true;

  window.location.replace(
    `login.html?next=${encodeURIComponent(next)}`
  );

  return false;
}

function showToast(title, message) {
  let toast = document.getElementById("siteToast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "siteToast";
    toast.className = "success-message";
    toast.innerHTML = `
      <div class="success-icon">✓</div>
      <div>
        <strong id="toastTitle"></strong>
        <p id="toastText"></p>
      </div>
    `;
    document.body.appendChild(toast);
  }

  const titleEl = toast.querySelector("#toastTitle");
  const textEl = toast.querySelector("#toastText");

  if (titleEl) titleEl.textContent = title;
  if (textEl) textEl.textContent = message;

  toast.classList.add("show");

  clearTimeout(window.__toastTimer);

  window.__toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 1800);
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  })[char]);
}

function getQueryPost() {
  const id = new URLSearchParams(window.location.search).get("id");
  const posts = getPosts();

  if (id) {
    return posts.find((post) => post.id === id) || null;
  }

  return posts[0] || null;
}

function categoryLabel(category = "") {
  return String(category).toUpperCase();
}

function postCard(post) {
  return `
    <a
      class="post-row"
      data-category="${escapeHTML(post.category)}"
      href="article.html?id=${encodeURIComponent(post.id)}"
    >
      <div>
        <span class="tag">${categoryLabel(post.category)}</span>
        <h3>${escapeHTML(post.title)}</h3>
        <p>${escapeHTML(post.subtitle || "")}</p>
        <small>
          ${escapeHTML(post.author)} ·
          ${Number(post.readTime) || 1} min read ·
          ${escapeHTML(post.date || "")}
        </small>
      </div>
      <span class="row-arrow">↗</span>
    </a>
  `;
}

function renderPosts(target, posts = getPosts()) {
  if (!target) return;

  target.innerHTML = posts.map(postCard).join("");

  if (!posts.length) {
    target.innerHTML = `
      <p class="empty-state">
        No posts found.
      </p>
    `;
  }
}

function setupExplore() {
  const container = document.querySelector("#explorePosts");
  if (!container) return;

  const input = document.querySelector("#searchInput");
  const filters = [...document.querySelectorAll(".filter")];

  renderPosts(container);

  const apply = () => {
    const query = (input?.value || "").trim().toLowerCase();
    const active =
      document.querySelector(".filter.active")?.dataset.filter || "all";

    container.querySelectorAll(".post-row").forEach((post) => {
      const textMatch =
        !query || post.innerText.toLowerCase().includes(query);

      const categoryMatch =
        active === "all" ||
        post.dataset.category === active;

      post.style.display =
        textMatch && categoryMatch ? "flex" : "none";
    });
  };

  input?.addEventListener("input", apply);

  filters.forEach((filter) => {
    filter.addEventListener("click", () => {
      filters.forEach((item) =>
        item.classList.remove("active")
      );

      filter.classList.add("active");
      apply();
    });
  });
}

function setupHome() {
  const container = document.querySelector("#latestPosts");
  if (!container) return;

  renderPosts(container, getPosts().slice(0, 4));
}

function setupArticle() {
  const articlePage = document.querySelector("#articleBody");
  if (!articlePage) return;

  const post = getQueryPost();

  if (!post) {
    articlePage.innerHTML = `
      <p>Article not found.</p>
    `;
    return;
  }

  document.title = `${post.title} — SharingSpace`;

  const meta = document.querySelector("#articleMeta");
  const title = document.querySelector("#articleTitle");
  const lead = document.querySelector("#articleLead");
  const author = document.querySelector("#articleAuthor");
  const initials = document.querySelector("#articleInitials");
  const date = document.querySelector("#articleDate");

  if (meta) {
    meta.textContent =
      `${categoryLabel(post.category)} · ${post.readTime} MIN READ`;
  }

  if (title) title.textContent = post.title;
  if (lead) lead.textContent = post.subtitle || "";
  if (author) author.textContent = post.author;
  if (initials) {
    initials.textContent =
      post.initials ||
      String(post.author).slice(0, 2).toUpperCase();
  }
  if (date) date.textContent = post.date;

  articlePage.innerHTML = post.content || "<p>No content.</p>";

  setupComments(post.id);
  setupAI(post);
}

function getComments() {
  const value = readJSON(COMMENTS_KEY, {});
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function saveComments(comments) {
  localStorage.setItem(
    COMMENTS_KEY,
    JSON.stringify(comments)
  );
}

function setupComments(postId) {
  const input = document.querySelector("#commentInput");
  const button = document.querySelector("#commentSubmit");
  const list = document.querySelector("#commentList");
  const prompt = document.querySelector("#loginPrompt");

  if (!input || !button || !list) return;

  const comments = getComments();

  const defaultComments = [
    {
      name: "Phyo Thiha",
      initials: "PT",
      text: "This is a useful breakdown of the topic.",
      date: "Aug 20, 2026"
    }
  ];

  const items = Array.isArray(comments[postId])
    ? comments[postId]
    : [...defaultComments];

  const render = () => {
    list.innerHTML = items
      .map(
        (comment) => `
          <div class="comment">
            <span class="avatar">
              ${escapeHTML(comment.initials || "??")}
            </span>

            <div class="comment-content">
              <strong>
                ${escapeHTML(comment.name || "Student")}
              </strong>

              <p>
                ${escapeHTML(comment.text || "")}
              </p>

              <small class="comment-date">
                ${escapeHTML(comment.date || "")}
              </small>
            </div>
          </div>
        `
      )
      .join("");
  };

  const updateButton = () => {
    button.disabled =
      !isLoggedIn() || !input.value.trim();
  };

  render();

  if (!isLoggedIn()) {
    input.disabled = true;
    input.placeholder =
      "Sign in to join the discussion.";

    if (prompt) prompt.style.display = "block";
  } else {
    input.disabled = false;

    if (prompt) prompt.style.display = "none";
  }

  input.addEventListener("input", updateButton);

  button.addEventListener("click", () => {
    const text = input.value.trim();

    if (!text || !isLoggedIn()) return;

    items.unshift({
      name: "Aung Kha",
      initials: "AK",
      text,
      date: "Just now"
    });

    comments[postId] = items;
    saveComments(comments);

    input.value = "";

    updateButton();
    render();

    showToast(
      "Comment posted",
      "Your comment has been added."
    );
  });

  updateButton();
}

async function setupAI(post) {
  const form = document.querySelector("#aiForm");
  const input = document.querySelector("#aiInput");
  const messages = document.querySelector("#aiMessages");
  const typing = document.querySelector("#aiTyping");

  if (!form || !input || !messages || !typing) return;

  let responseData = {};

  try {
    const response = await fetch(
      "data/ai-responses.json",
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error("AI response file unavailable");
    }

    responseData = await response.json();
  } catch {
    responseData = {
      default: [
        "That is an interesting question. Try breaking the problem into smaller steps and testing each part."
      ]
    };
  }

  const pool =
    Array.isArray(responseData[post.category])
      ? responseData[post.category]
      : Array.isArray(responseData.default)
        ? responseData.default
        : [
            "That is an interesting question. Consider breaking the problem into smaller steps."
          ];

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const question = input.value.trim();

    if (!question) return;

    const userMessage =
      document.createElement("div");

    userMessage.className =
      "ai-message user";

    const userLabel =
      document.createElement("span");

    userLabel.textContent = "You";

    const userText =
      document.createElement("p");

    userText.textContent = question;

    userMessage.append(
      userLabel,
      userText
    );

    messages.appendChild(userMessage);

    input.value = "";
    input.disabled = true;

    typing.classList.add("show");
    messages.scrollTop = messages.scrollHeight;

    const answer =
      pool[Math.floor(Math.random() * pool.length)];

    clearTimeout(window.__aiTimer);

    window.__aiTimer = setTimeout(() => {
      typing.classList.remove("show");

      const aiMessage =
        document.createElement("div");

      aiMessage.className =
        "ai-message assistant";

      const aiLabel =
        document.createElement("span");

      aiLabel.textContent =
        "SharingSpace AI";

      const aiText =
        document.createElement("p");

      aiText.textContent = answer;

      aiMessage.append(
        aiLabel,
        aiText
      );

      messages.appendChild(aiMessage);

      input.disabled = false;
      input.focus();

      messages.scrollTop =
        messages.scrollHeight;
    }, 900 + Math.random() * 700);
  });
}

function setupCreate() {
  const title = document.querySelector("#postTitle");
  const content = document.querySelector("#postContent");

  if (!title || !content) return;

  if (!requireAuth("create-post.html")) return;

  const subtitle =
    document.querySelector("#postSubtitle");

  const category =
    document.querySelector("#postCategory");

  const saveButton =
    document.querySelector("#saveDraftButton");

  const publishButton =
    document.querySelector("#publishButton");

  const state =
    document.querySelector("#saveState");

  if (!subtitle || !category || !saveButton || !publishButton) {
    return;
  }

  const draft =
    readJSON(DRAFT_KEY, null);

  if (draft && typeof draft === "object") {
    title.value = draft.title || "";
    subtitle.value = draft.subtitle || "";
    category.value =
      draft.category || "programming";
    content.innerHTML =
      draft.content || "";
  }

  const validate = () => {
    const ready =
      title.value.trim().length > 0 &&
      content.innerText.trim().length > 0;

    saveButton.disabled = !ready;
    publishButton.disabled = !ready;

    if (state) {
      state.textContent =
        ready
          ? "Ready to save"
          : "Draft not saved";
    }

    return ready;
  };

  [title, subtitle, category].forEach((el) => {
    el.addEventListener("input", validate);
    el.addEventListener("change", validate);
  });

  content.addEventListener("input", validate);

  saveButton.addEventListener("click", () => {
    if (!validate()) return;

    const draftData = {
      title: title.value.trim(),
      subtitle: subtitle.value.trim(),
      category: category.value,
      content: content.innerHTML
    };

    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify(draftData)
    );

    if (state) {
      state.textContent = "Draft saved";
    }

    showToast(
      "Draft saved",
      "Your story has been saved locally."
    );
  });

  publishButton.addEventListener("click", () => {
    if (!validate() || !isLoggedIn()) return;

    const posts = getPosts();
    const now = new Date();

    const words =
      content.innerText
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .length;

    const id =
      `post-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 7)}`;

    const newPost = {
      id,
      title: title.value.trim(),
      subtitle: subtitle.value.trim(),
      category: category.value,
      author: "Aung Kha",
      initials: "AK",
      date: now.toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric"
        }
      ),
      readTime: Math.max(
        1,
        Math.ceil(words / 180)
      ),
      content: content.innerHTML
    };

    posts.unshift(newPost);
    savePosts(posts);

    localStorage.removeItem(DRAFT_KEY);

    saveButton.disabled = true;
    publishButton.disabled = true;

    showToast(
      "Post published",
      "Your story is now published."
    );

    clearTimeout(window.__publishTimer);

    window.__publishTimer = setTimeout(() => {
      window.location.replace(
        `article.html?id=${encodeURIComponent(id)}`
      );
    }, 1000);
  });

  validate();
}

function setupDashboard() {
  const list =
    document.querySelector("#dashboardPosts");

  if (!list) return;

  if (!requireAuth("dashboard.html")) return;

  const posts =
    getPosts().filter(
      (post) => post.author === "Aung Kha"
    );

  list.innerHTML =
    posts
      .slice(0, 5)
      .map(
        (post) => `
          <div class="table-row">
            <span>${escapeHTML(post.title)}</span>
            <span class="status published">
              Published
            </span>
            <span>—</span>
            <a
              href="edit-post.html?id=${encodeURIComponent(post.id)}"
            >
              Edit
            </a>
          </div>
        `
      )
      .join("") ||
    `<div class="table-row"><span>No posts yet.</span></div>`;

  const published =
    document.querySelector("#publishedCount");

  if (published) {
    published.textContent =
      String(posts.length);
  }
}

function setupPosts() {
  const list =
    document.querySelector("#myPostsList");

  if (!list) return;

  if (!requireAuth("posts.html")) return;

  const render = () => {
    const posts =
      getPosts().filter(
        (post) => post.author === "Aung Kha"
      );

    list.innerHTML =
      posts
        .map(
          (post) => `
            <div class="post-row">
              <div>
                <span class="tag">PUBLISHED</span>

                <h3>
                  ${escapeHTML(post.title)}
                </h3>

                <small>
                  ${escapeHTML(post.date)}
                </small>
              </div>

              <div class="post-actions">
                <a
                  href="edit-post.html?id=${encodeURIComponent(post.id)}"
                >
                  Edit →
                </a>

                <button
                  class="text-button delete-post"
                  data-id="${escapeHTML(post.id)}"
                  type="button"
                >
                  Delete
                </button>
              </div>
            </div>
          `
        )
        .join("") ||
      `<p class="empty-state">You have not published any posts yet.</p>`;

    list
      .querySelectorAll(".delete-post")
      .forEach((button) => {
        button.addEventListener("click", () => {
          if (!isLoggedIn()) {
            window.location.replace("login.html?next=posts.html");
            return;
          }

          const id = button.dataset.id;

          if (!id) return;

          if (!window.confirm("Delete this post?")) {
            return;
          }

          const updated =
            getPosts().filter(
              (post) => post.id !== id
            );

          savePosts(updated);

          const comments =
            getComments();

          delete comments[id];
          saveComments(comments);

          render();

          showToast(
            "Post deleted",
            "The post has been removed."
          );
        });
      });
  };

  render();
}

function setupEdit() {
  const title =
    document.querySelector("#editTitle");

  const content =
    document.querySelector("#editContent");

  if (!title || !content) return;

  if (!requireAuth("edit-post.html")) return;

  const subtitle =
    document.querySelector("#editSubtitle");

  const category =
    document.querySelector("#editCategory");

  const saveButton =
    document.querySelector("#saveEdit");

  const publishButton =
    document.querySelector("#publishEdit");

  if (!subtitle || !category || !saveButton || !publishButton) {
    return;
  }

  const id =
    new URLSearchParams(
      window.location.search
    ).get("id");

  const posts = getPosts();

  const post =
    posts.find(
      (item) =>
        item.id === id &&
        item.author === "Aung Kha"
    );

  if (!post) {
    window.location.replace("posts.html");
    return;
  }

  title.value = post.title || "";
  subtitle.value = post.subtitle || "";
  category.value =
    post.category || "programming";
  content.innerHTML =
    post.content || "";

  const getUpdatedData = () => ({
    title: title.value.trim(),
    subtitle: subtitle.value.trim(),
    category: category.value,
    content: content.innerHTML
  });

  saveButton.addEventListener("click", () => {
    const data = getUpdatedData();

    if (!data.title || !content.innerText.trim()) {
      showToast(
        "Missing information",
        "Add a title and some content first."
      );
      return;
    }

    Object.assign(post, data);
    savePosts(posts);

    showToast(
      "Changes saved",
      "Your post has been updated."
    );
  });

  publishButton.addEventListener("click", () => {
    const data = getUpdatedData();

    if (!data.title || !content.innerText.trim()) {
      showToast(
        "Missing information",
        "Add a title and some content first."
      );
      return;
    }

    Object.assign(post, data);
    savePosts(posts);

    showToast(
      "Post updated",
      "Your published post has been updated."
    );

    clearTimeout(window.__editTimer);

    window.__editTimer = setTimeout(() => {
      window.location.replace(
        `article.html?id=${encodeURIComponent(post.id)}`
      );
    }, 900);
  });
}

function setupLogin() {
  const form =
    document.querySelector("#loginForm");

  if (!form) return;

  if (isLoggedIn()) {
    const next =
      new URLSearchParams(
        window.location.search
      ).get("next") || "index.html";

    window.location.replace(next);
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const email =
      document.querySelector("#loginEmail");

    const password =
      document.querySelector("#loginPassword");

    if (!email?.value.trim() || !password?.value) {
      return;
    }

    localStorage.setItem(
      AUTH_KEY,
      "true"
    );

    const next =
      new URLSearchParams(
        window.location.search
      ).get("next") || "index.html";

    showToast(
      "Sign in successful",
      "Welcome back to SharingSpace."
    );

    clearTimeout(window.__loginTimer);

    window.__loginTimer = setTimeout(() => {
      window.location.replace(next);
    }, 1000);
  });
}

function setupRegister() {
  const form =
    document.querySelector("#registerForm");

  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const password =
      document.querySelector("#registerPassword");

    const confirmPassword =
      document.querySelector("#registerConfirm");

    if (!password || !confirmPassword) return;

    if (password.value !== confirmPassword.value) {
      showToast(
        "Passwords do not match",
        "Please check both password fields."
      );
      return;
    }

    if (!password.value) return;

    localStorage.setItem(
      AUTH_KEY,
      "true"
    );

    showToast(
      "Account created",
      "Welcome to SharingSpace."
    );

    clearTimeout(window.__registerTimer);

    window.__registerTimer = setTimeout(() => {
      window.location.replace(
        "dashboard.html"
      );
    }, 1000);
  });
}

document.addEventListener(
  "DOMContentLoaded",
  () => {
    setupHeader();
    setupHome();
    setupExplore();
    setupArticle();
    setupCreate();
    setupDashboard();
    setupPosts();
    setupEdit();
    setupLogin();
    setupRegister();
  }
);           
```/* qq */```
