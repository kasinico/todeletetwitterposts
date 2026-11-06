========================================================================
             X (TWITTER) AUTOMATED REPLIES DELETION GUIDE
========================================================================

--- STEP 1: PREPARATION ---
1. Open Google Chrome or Firefox on your computer. | brave is better
2. Go to your X login && profile page and click exactly on the "Replies" tab.
   The URL must look like: https://x.com
3. Open the Developer Tools Console:
   - On Windows: Press F12 (or Ctrl + Shift + J)
   - On Mac: Press Cmd + Option + J

--- STEP 2: THE AUTOMATION SCRIPT ---
Copy the code block below entirely and paste it into the console command line, then press ENTER:
//  if pasting not allowed, (type: 'allow pasting' on that termina below error)

//  code 1, if this fails use second code below ********************************************
==========================================================================================================
==========================================================================================================
(async () => {
    if (typeof window.stopDeleting === "function") {
        window.stopDeleting();
    }

    let running = true;
    let deleted = 0;

    const attempted = new Set();

    window.stopDeleting = () => {
        running = false;
        console.log(`[tweetdelete] STOPPED — deleted ${deleted}`);
    };

    const sleep = ms => new Promise(r => setTimeout(r, ms));

    const username =
        location.pathname.split("/")[1]?.replace("@", "").toLowerCase();

    if (!username) {
        console.error("[tweetdelete] Cannot determine account username.");
        return;
    }

    console.log(`[tweetdelete] Account: @${username}`);
    console.log("[tweetdelete] Emergency stop: window.stopDeleting()");

    function visible(el) {
        if (!el) return false;

        const r = el.getBoundingClientRect();
        const s = getComputedStyle(el);

        return (
            r.width > 0 &&
            r.height > 0 &&
            s.display !== "none" &&
            s.visibility !== "hidden"
        );
    }

    function txt(el) {
        return (
            el.innerText ||
            el.textContent ||
            el.getAttribute("aria-label") ||
            ""
        ).trim();
    }

    function ownArticle(article) {
        const u = username.toLowerCase();

        return [...article.querySelectorAll("a[href]")].some(a => {
            const href = (a.getAttribute("href") || "")
                .split("?")[0]
                .split("#")[0]
                .toLowerCase();

            return href === `/${u}` || href === `/${u}/`;
        });
    }

    function articleKey(article) {
        const link = [...article.querySelectorAll('a[href*="/status/"]')]
            .find(a => /\/status\/\d+/.test(a.href));

        if (link) return link.href;

        return txt(article).replace(/\s+/g, " ").slice(0, 250);
    }

    function menu(article) {
        const candidates = [
            ...article.querySelectorAll('[data-testid="caret"]'),
            ...article.querySelectorAll('[aria-label*="More"]'),
            ...article.querySelectorAll('[aria-label*="more"]')
        ];

        return candidates.find(visible);
    }

    function deleteOption() {
        const candidates = [
            ...document.querySelectorAll('[role="menuitem"]'),
            ...document.querySelectorAll('button'),
            ...document.querySelectorAll('[role="button"]')
        ];

        return candidates.find(el => {
            if (!visible(el)) return false;

            const t = txt(el).toLowerCase();

            return (
                t === "delete" ||
                t === "delete post" ||
                t === "delete reply"
            );
        });
    }

    function confirmButton() {
        const dialogs = [
            ...document.querySelectorAll('[role="dialog"]'),
            ...document.querySelectorAll('[data-testid*="confirmation"]')
        ].filter(visible);

        const scopes = dialogs.length ? dialogs : [document];

        for (const scope of scopes) {
            const buttons = [
                ...scope.querySelectorAll("button"),
                ...scope.querySelectorAll('[role="button"]')
            ];

            const btn = buttons.find(el => {
                if (!visible(el)) return false;

                const t = txt(el).toLowerCase();

                return (
                    t === "delete" ||
                    t === "delete post" ||
                    t === "delete reply"
                );
            });

            if (btn) return btn;
        }

        return null;
    }

    async function deleteArticle(article) {
        const key = articleKey(article);

        if (attempted.has(key)) return false;

        attempted.add(key);

        if (!ownArticle(article)) return false;

        const m = menu(article);

        if (!m) return false;

        console.log(
            "[tweetdelete] Opening:",
            txt(article).replace(/\n+/g, " ").slice(0, 120)
        );

        m.click();
        await sleep(600);

        const d = deleteOption();

        if (!d) {
            console.log("[tweetdelete] Delete option unavailable.");
            document.dispatchEvent(
                new KeyboardEvent("keydown", {
                    key: "Escape",
                    bubbles: true
                })
            );
            return false;
        }

        d.click();
        await sleep(600);

        let c = null;

        for (let i = 0; i < 10 && running; i++) {
            c = confirmButton();

            if (c) break;

            await sleep(250);
        }

        if (!c) {
            console.log("[tweetdelete] Confirmation not found.");
            return false;
        }

        c.click();

        deleted++;

        console.log(
            `[tweetdelete] DELETED #${deleted}`,
            txt(article).replace(/\n+/g, " ").slice(0, 100)
        );

        await sleep(1500);

        return true;
    }

    async function scanVisible() {
        const articles = [...document.querySelectorAll("article")];

        let didDelete = false;

        for (const article of articles) {
            if (!running) return true;

            if (!ownArticle(article)) continue;

            if (!menu(article)) continue;

            const result = await deleteArticle(article);

            if (result) {
                didDelete = true;

                // Important: stop this scan and rebuild the DOM list.
                await sleep(500);
                break;
            }
        }

        return didDelete;
    }

    let scrollDistance = 900;
    let noProgress = 0;

    while (running) {
        const deletedSomething = await scanVisible();

        if (!running) break;

        if (deletedSomething) {
            noProgress = 0;
            continue;
        }

        noProgress++;

        console.log(
            `[tweetdelete] No new deletion (${noProgress}/2). Loading older replies...`
        );

        if (noProgress >= 2) {
            const before = window.scrollY;

            window.scrollBy({
                top: scrollDistance,
                behavior: "smooth"
            });

            await sleep(2000);

            const after = window.scrollY;

            console.log(
                `[tweetdelete] Scroll: ${Math.round(before)} → ${Math.round(after)}`
            );

            scrollDistance = Math.min(scrollDistance + 500, 3000);

            // If we're near the bottom, wait longer for X to load.
            if (after === before) {
                console.log("[tweetdelete] Waiting for timeline to load...");
                await sleep(3000);
            }

            noProgress = 0;
        }

        await sleep(700);
    }

    console.log(
        `[tweetdelete] Finished. Total deleted: ${deleted}`
    );
})();

============================================================================================================
============================================================================================================

// code 2 is below

(() => {
    // Automatically detects the username from the active profile screen
    const profileNameElement = document.querySelector('[data-testid="UserName"]');
    const currentAccount = profileNameElement ? profileNameElement.innerText.split('\n')[1] || "@Account" : "@Account";
    
    console.log(`[tweetdelete] Target initiated: Universal reply scan started for ${currentAccount}...`);

    let deleteCount = 0;
    const replyInterval = setInterval(() => {
        const tweets = document.querySelectorAll('article[data-testid="tweet"]');
        
        if (tweets.length === 0) {
            window.scrollBy(0, 600); 
            return;
        }

        let foundReplyOnScreen = false;

        for (let tweet of tweets) {
            // Checks for X's generic reply container structure rather than language text
            const replyContext = tweet.querySelector('[data-testid="socialContext"]');
            const isReply = replyContext !== null || (tweet.innerText && tweet.innerText.toLowerCase().includes("replying to"));

            if (isReply) {
                foundReplyOnScreen = true;
                const caret = tweet.querySelector('[data-testid="caret"]');
                if (caret) {
                    caret.click();

                    setTimeout(() => {
                        const dropdownItems = document.querySelectorAll('[data-testid="Dropdown"] > div');
                        // Finds 'Delete' or any localized language equivalent in the popup menu
                        let deleteBtn = Array.from(dropdownItems).find(el => {
                            const t = el.innerText.toLowerCase();
                            return t.includes('delete') || t.includes('삭제') || t.includes('eliminar') || t.includes('supprimer') || t.includes('löschen') || t.includes('del');
                        });
                        
                        if (deleteBtn) {
                            deleteBtn.click();
                            
                            setTimeout(() => {
                                const confirmBtn = document.querySelector('[data-testid="confirmationSheetConfirm"]');
                                if (confirmBtn) {
                                    confirmBtn.click();
                                    deleteCount++;
                                    console.log(`[tweetdelete] Successfully deleted reply #${deleteCount}`);
                                }
                            }, 400);
                        }
                    }, 400);
                    
                    break; 
                }
            }
        }

        if (!foundReplyOnScreen) {
            window.scrollBy(0, 500);
        }

    }, 4000); // 4-second delay to safely minimize 429 rate limits

    window.stopRepliesWipe = () => {
        clearInterval(replyInterval);
        console.log("[tweetdelete] Stopped reply cleanup.");
    };
})();

--- STEP 3: CONTROLS & RULES ---
* KEEP WINDOW IN FOCUS: Do not switch browser tabs or minimize the window. If the tab goes idle, the script will stall.
* EMERGENCY STOP: To stop it while running, simply refresh the webpage (F5), close the browser tab, or type stopRepliesWipe() into the console and press Enter.
* FIXING THE "HTTP 429 TOO MANY REQUESTS" ERROR: X allows around 100 automatic actions at a time before a temporary lockout. If the console starts throwing red 429 errors or stops clicking, close the tab, wait 30 to 60 minutes for the platform limit to reset, and repeat from Step 1.
========================================================================
