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
