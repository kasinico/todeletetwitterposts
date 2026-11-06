// This is a read-only browser-console tool. It examines the posts currently loaded on your X page and tries to collect:
// - Post text and date.
// - Replies, reposts and likes.
// - Views, where displayed.
// - Links to individual posts.
// - A CSV report you can save and analyze.

// It does not like, follow, reply, repost or delete anything.

// Open your @user-handle profile's Posts tab, scroll to load the posts you want to analyze, then paste this into the browser console.


(() => {
  const rows = [];
  const seen = new Set();

  const parseNumber = value => {
    if (!value) return 0;
    const s = value.replace(/,/g, "").trim().toUpperCase();
    const match = s.match(/(\d+(?:\.\d+)?)\s*([KM])?/);
    if (!match) return 0;
    const n = Number(match[1]);
    return Math.round(n * (match[2] === "K" ? 1000 : match[2] === "M" ? 1000000 : 1));
  };

  const getMetric = (article, pattern) => {
    const elements = [...article.querySelectorAll(
      'button,[role="button"],[aria-label],[title]'
    )];

    for (const el of elements) {
      const label = [
        el.getAttribute("aria-label"),
        el.getAttribute("title"),
        el.innerText
      ].filter(Boolean).join(" ");

      if (pattern.test(label)) {
        const match = label.match(/(\d+(?:[,.]\d+)?\s*[KM]?)/i);
        if (match) return parseNumber(match[1]);
      }
    }
    return 0;
  };

  const articles = [...document.querySelectorAll("article")];

  for (const article of articles) {
    const link = [...article.querySelectorAll('a[href*="/status/"]')]
      .map(a => a.href.split("?")[0])
      .find(href => /\/status\/\d+/.test(href));

    if (!link || seen.has(link)) continue;
    seen.add(link);

    const text = (article.innerText || "")
      .replace(/\n+/g, " ")
      .trim();

    const date = article.querySelector("time");
    const postText = date
      ? text.split(date.innerText)[0].trim()
      : text.slice(0, 250);

    rows.push({
      post: postText.slice(0, 250),
      date: date?.getAttribute("datetime") || date?.innerText || "",
      replies: getMetric(article, /repl(y|ies)/i),
      reposts: getMetric(article, /repost/i),
      likes: getMetric(article, /like/i),
      views: getMetric(article, /view/i),
      url: link
    });
  }

  if (!rows.length) {
    console.warn("No posts found. Open your profile Posts tab and try again.");
    return;
  }

  console.table(rows);

  const totals = rows.reduce((a, r) => ({
    replies: a.replies + r.replies,
    reposts: a.reposts + r.reposts,
    likes: a.likes + r.likes,
    views: a.views + r.views
  }), { replies: 0, reposts: 0, likes: 0, views: 0 });

  console.log("GLOBALIMPACTHQ ENGAGEMENT REPORT");
  console.log("Posts scanned:", rows.length);
  console.table([totals]);

  const headers = ["post", "date", "replies", "reposts", "likes", "views", "url"];
  const csv = [
    headers.join(","),
    ...rows.map(r => headers.map(h =>
      '"' + String(r[h] ?? "").replace(/"/g, '""') + '"'
    ).join(","))
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "GlobalimpactHQ-Engagement-Report.csv";
  a.click();
  URL.revokeObjectURL(url);

  console.log("CSV report exported successfully.");
})();


// excel will be exported