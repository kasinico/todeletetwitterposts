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

const myHandle = "globalimpacthq"; 
console.log(`[tweetdelete] Target initiated: Scanning strictly for replies...`);

let deleteCount = 0;
const replyInterval = setInterval(() => {
    const tweets = document.querySelectorAll('article[data-testid="tweet"]');
    
    if (tweets.length === 0) {
        window.scrollBy(0, 600); 
        return;
    }

    let foundReplyOnScreen = false;

    for (let tweet of tweets) {
        const contextText = tweet.innerText || "";
        const isReply = contextText.includes("Replying to") || contextText.includes("返信先") || contextText.includes("En respuesta a");

        if (isReply) {
            foundReplyOnScreen = true;
            const caret = tweet.querySelector('[data-testid="caret"]');
            if (caret) {
                caret.click();

                setTimeout(() => {
                    const dropdownItems = document.querySelectorAll('[data-testid="Dropdown"] > div');
                    let deleteBtn = Array.from(dropdownItems).find(el => el.innerText.includes('Delete') || el.innerText.includes('削除'));
                    
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

}, 3500); 

window.stopRepliesWipe = () => {
    clearInterval(replyInterval);
    console.log("[tweetdelete] Stopped reply cleanup.");
};

--- STEP 3: CONTROLS & RULES ---
* KEEP WINDOW IN FOCUS: Do not switch browser tabs or minimize the window. If the tab goes idle, the script will stall.
* EMERGENCY STOP: To stop it while running, simply refresh the webpage (F5), close the browser tab, or type stopRepliesWipe() into the console and press Enter.
* FIXING THE "HTTP 429 TOO MANY REQUESTS" ERROR: X allows around 100 automatic actions at a time before a temporary lockout. If the console starts throwing red 429 errors or stops clicking, close the tab, wait 30 to 60 minutes for the platform limit to reset, and repeat from Step 1.
========================================================================
