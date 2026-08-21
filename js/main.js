document.addEventListener("DOMContentLoaded", () => {
  const input = document.querySelector("#searchInput");
  const posts = [...document.querySelectorAll("#explorePosts .post-row")];
  const filters = [...document.querySelectorAll(".filter")];
  function apply() {
    if (!posts.length) return;
    const q = (input?.value || "").toLowerCase();
    const active =
      document.querySelector(".filter.active")?.dataset.filter || "all";
    posts.forEach((p) => {
      const matchText = p.innerText.toLowerCase().includes(q);
      const matchCat = active === "all" || p.dataset.category === active;
      p.style.display = matchText && matchCat ? "flex" : "none";
    });
  }
  input?.addEventListener("input", apply);
  filters.forEach((f) =>
    f.addEventListener("click", () => {
      filters.forEach((x) => x.classList.remove("active"));
      f.classList.add("active");
      apply();
    }),
  );
});
