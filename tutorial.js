/* ============================================================
   PassionFruits — Shared Tutorial System
   Include this script on every page:
     <script src="tutorial.js"></script>
   Then call PFTutorial.trigger('step_id') at the right moment
   on each page (see comments at the bottom for where each ID
   should be called from).
   ============================================================ */

(function () {
    const SEEN_KEY = 'pf_tutorial_seen';

    function getSeen() {
        return JSON.parse(localStorage.getItem(SEEN_KEY) || '[]');
    }
    function markSeen(id) {
        const seen = getSeen();
        if (!seen.includes(id)) {
            seen.push(id);
            localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
        }
    }
    function hasSeen(id) {
        return getSeen().includes(id);
    }

    // ── Step definitions ──────────────────────────────────────
    // type: 'next'   -> shown centered, advances only on Next tap
    // type: 'arrow'  -> points at a target element, advances on Next tap
    //                   OR automatically when waitFor condition fires
    // selector: CSS selector for the arrow target (only for type 'arrow')
    // direction: which way the arrow points relative to the box ('up','down','left','right')
    // waitForEvent: optional custom event name that auto-advances this step
    const STEPS = {
        landing_intro: {
            type: 'next',
            text: "This is the landing page. Where we show you what we are all about!",
        },
        login_intro: {
            type: 'next',
            text: "Log in to make an account, or skip that and continue as a guest.",
        },
        fruitbowl_intro: {
            type: 'next',
            text: "Here is where you pick your interest areas!",
        },
        fruitbowl_fruit: {
            type: 'arrow',
            selector: '.card',
            direction: 'down',
            text: "Each fruit represents an interest area! Click a fruit (or a few) that particularly interest you!",
        },
        swipe_intro: {
            type: 'next',
            text: "Swipe through activities you like or dislike.",
        },
        tree_intro: {
            type: 'arrow',
            selector: '.node',
            direction: 'down',
            text: "Click a bud on your smaller tree to get started!",
        },
        tree_second_bud: {
            type: 'arrow',
            selector: '.node',
            direction: 'down',
            text: "Click on another bud to start an activity.",
        },
        fruit_harvest_tip: {
            type: 'next',
            text: "You completed an activity! Well done! You can harvest a fruit to start a new activity.",
        },
        tree_book_pointer: {
            type: 'arrow',
            selector: '.book-btn',
            direction: 'up',
            text: "The book keeps a record of your completed activities.",
        },
        tree_quilt_pointer: {
            type: 'arrow',
            selector: '.quilt-btn',
            direction: 'up',
            text: "The quilt has any activities that you've uploaded a photo to.",
        },
        orchard_intro: {
            type: 'next',
            text: "Any friend's activity you want to see is contained in their book! Make sure to congratulate them!",
        },
        farmers_market_intro: {
            type: 'next',
            text: "Scroll through some videos that other users have posted to get some inspiration!",
        },
    };

    // ── Overlay DOM (created once, reused for every step) ───────
    let overlayEl, boxEl, nextBtnEl, arrowEl;

    function ensureOverlay() {
        if (overlayEl) return;

        overlayEl = document.createElement('div');
        overlayEl.id = 'pf-tutorial-overlay';
        overlayEl.style.cssText = `
            position:fixed; inset:0; z-index:9999;
            background:rgba(20,10,40,0.55);
            display:none; pointer-events:none;
            font-family:'Press Start 2P', monospace;
        `;

        boxEl = document.createElement('div');
        boxEl.id = 'pf-tutorial-box';
        boxEl.style.cssText = `
            position:absolute; max-width:260px;
            background:#2a0e5e; border:3px solid #F7C948; border-radius:14px;
            padding:14px 16px; color:#fff; font-size:0.42rem; line-height:1.8;
            letter-spacing:0.04em; pointer-events:auto;
            box-shadow:0 6px 18px rgba(0,0,0,0.4);
        `;

        arrowEl = document.createElement('img');
        arrowEl.id = 'pf-tutorial-arrow';
        arrowEl.src = 'tutorial_arrow.png';
        arrowEl.style.cssText = `
            position:absolute; width:38px; height:auto; image-rendering:pixelated;
            display:none; pointer-events:none;
            filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5));
        `;

        nextBtnEl = document.createElement('button');
        nextBtnEl.id = 'pf-tutorial-next';
        nextBtnEl.textContent = 'Next →';
        nextBtnEl.style.cssText = `
            position:fixed; left:50%; bottom:34px; transform:translateX(-50%);
            font-family:'Press Start 2P', monospace; font-size:0.5rem;
            color:#38167d; background:#F7C948; border:none; border-radius:12px;
            padding:13px 26px; cursor:pointer; pointer-events:auto;
            box-shadow:0 4px 12px rgba(0,0,0,0.35); z-index:10000;
        `;
        nextBtnEl.onmouseenter = () => nextBtnEl.style.background = '#ffe066';
        nextBtnEl.onmouseleave = () => nextBtnEl.style.background = '#F7C948';
        nextBtnEl.onclick = () => advanceCurrentStep();

        overlayEl.appendChild(boxEl);
        document.body.appendChild(overlayEl);
        document.body.appendChild(arrowEl);
        document.body.appendChild(nextBtnEl);
    }

    let currentStepId = null;
    let waitListenerCleanup = null;
    let stepQueue = [];

    function positionNear(target, direction) {
        const rect = target.getBoundingClientRect();
        const margin = 16;
        let arrowTop, arrowLeft, arrowRotate, boxTop, boxLeft;

        if (direction === 'down') {
            // arrow above target, pointing down at it
            arrowRotate = 90;
            arrowTop = rect.top - 46;
            arrowLeft = rect.left + rect.width/2 - 19;
            boxTop = arrowTop - 70;
            boxLeft = rect.left + rect.width/2 - 130;
        } else if (direction === 'up') {
            // arrow below target, pointing up at it
            arrowRotate = -90;
            arrowTop = rect.bottom + margin;
            arrowLeft = rect.left + rect.width/2 - 19;
            boxTop = arrowTop + 44;
            boxLeft = rect.left + rect.width/2 - 130;
        } else if (direction === 'left') {
            arrowRotate = 180;
            arrowTop = rect.top + rect.height/2 - 19;
            arrowLeft = rect.right + margin;
            boxTop = arrowTop - 20;
            boxLeft = arrowLeft + 46;
        } else { // right
            arrowRotate = 0;
            arrowTop = rect.top + rect.height/2 - 19;
            arrowLeft = rect.left - margin - 38;
            boxTop = arrowTop - 20;
            boxLeft = arrowLeft - 270;
        }

        // Clamp box within viewport
        boxLeft = Math.max(12, Math.min(boxLeft, window.innerWidth - 280));
        boxTop = Math.max(12, Math.min(boxTop, window.innerHeight - 100));

        arrowEl.style.top = arrowTop + 'px';
        arrowEl.style.left = arrowLeft + 'px';
        arrowEl.style.transform = `rotate(${arrowRotate}deg)`;
        arrowEl.style.display = 'block';

        boxEl.style.top = boxTop + 'px';
        boxEl.style.left = boxLeft + 'px';
    }

    function positionCentered() {
        arrowEl.style.display = 'none';
        boxEl.style.left = '50%';
        boxEl.style.top = '40%';
        boxEl.style.transform = 'translate(-50%, -50%)';
        boxEl.style.maxWidth = '300px';
    }

    function showStep(id) {
        const step = STEPS[id];
        if (!step) return;
        ensureOverlay();

        // If a step is already showing, queue this one to run after Next.
        if (currentStepId) {
            if (!stepQueue.includes(id)) stepQueue.push(id);
            return;
        }

        currentStepId = id;
        boxEl.textContent = step.text;
        boxEl.style.transform = '';
        boxEl.style.maxWidth = '260px';
        overlayEl.style.display = 'block';
        overlayEl.style.pointerEvents = 'none';
        nextBtnEl.style.display = 'block';

        if (step.type === 'arrow') {
            const target = document.querySelector(step.selector);
            if (target) {
                positionNear(target, step.direction || 'down');
            } else {
                // Target not on page (e.g. no buds yet) — fall back to centered text only
                positionCentered();
            }
        } else {
            positionCentered();
        }
    }

    function hideOverlay() {
        if (overlayEl) overlayEl.style.display = 'none';
        if (nextBtnEl) nextBtnEl.style.display = 'none';
        if (arrowEl) arrowEl.style.display = 'none';
        currentStepId = null;
        if (waitListenerCleanup) { waitListenerCleanup(); waitListenerCleanup = null; }
    }

    function advanceCurrentStep() {
        if (currentStepId) markSeen(currentStepId);
        hideOverlay();
        // Pop the next queued step, if any, and show it.
        if (stepQueue.length > 0) {
            const next = stepQueue.shift();
            // Re-check seen status in case it was marked seen another way
            // while queued (defensive, shouldn't normally happen).
            if (!hasSeen(next)) showStep(next);
        }
    }

    // ── Public API ────────────────────────────────────────────
    // trigger(id): show this tutorial step if it hasn't been seen yet.
    // force(id): show it regardless of seen state (used by the ? help menu).
    function trigger(id) {
        if (hasSeen(id)) return;
        showStep(id);
    }
    function force(id) {
        showStep(id);
    }

    // ── "?" Help button — lets the user replay any past step ───
    function buildHelpButton() {
        const btn = document.createElement('button');
        btn.id = 'pf-tutorial-help';
        btn.textContent = '?';
        btn.title = 'Replay tutorial tips';
        btn.style.cssText = `
            position:fixed; top:14px; left:14px; z-index:9998;
            width:30px; height:30px; border-radius:50%;
            background:#F7C948; color:#38167d; border:2px solid #3A1E00;
            font-family:'Press Start 2P', monospace; font-size:0.6rem;
            cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.3);
        `;
        btn.onclick = openHelpMenu;
        document.body.appendChild(btn);
    }

    function openHelpMenu() {
        const existing = document.getElementById('pf-tutorial-help-menu');
        if (existing) { existing.remove(); return; }

        const menu = document.createElement('div');
        menu.id = 'pf-tutorial-help-menu';
        menu.style.cssText = `
            position:fixed; top:50px; left:14px; z-index:9998;
            background:#2a0e5e; border:3px solid #F7C948; border-radius:12px;
            padding:10px; max-width:240px; max-height:60vh; overflow-y:auto;
            box-shadow:0 6px 18px rgba(0,0,0,0.4);
        `;

        const availableHere = Object.keys(STEPS).filter(id => {
            const step = STEPS[id];
            return step.type !== 'arrow' || document.querySelector(step.selector);
        });

        if (availableHere.length === 0) {
            menu.innerHTML = '<p style="color:rgba(255,255,255,0.5);font-size:0.36rem;font-family:\'Press Start 2P\',monospace;line-height:1.8;">No tips for this page.</p>';
        } else {
            availableHere.forEach(id => {
                const item = document.createElement('button');
                item.textContent = STEPS[id].text.slice(0, 34) + (STEPS[id].text.length > 34 ? '…' : '');
                item.style.cssText = `
                    display:block; width:100%; text-align:left;
                    background:#4a2090; border:none; border-radius:8px;
                    color:#fff; font-family:'Press Start 2P',monospace; font-size:0.32rem;
                    padding:8px 10px; margin-bottom:6px; cursor:pointer; line-height:1.6;
                `;
                item.onmouseenter = () => item.style.background = '#5a30a8';
                item.onmouseleave = () => item.style.background = '#4a2090';
                item.onclick = () => { menu.remove(); force(id); };
                menu.appendChild(item);
            });
        }
        document.body.appendChild(menu);
    }

    document.addEventListener('DOMContentLoaded', buildHelpButton);

    window.PFTutorial = { trigger, force, hasSeen };
})();

/* ============================================================
   WHERE TO CALL trigger() FROM ON EACH PAGE
   (add a <script> tag at the bottom of each page's body)

   index.html / Landing Page.html:
     PFTutorial.trigger('landing_intro');

   Login Page.html:
     PFTutorial.trigger('login_intro');

   fruitbowl.html:
     PFTutorial.trigger('fruitbowl_intro');
     // after rendering the subject cards:
     PFTutorial.trigger('fruitbowl_fruit');

   Swipe Page.html:
     PFTutorial.trigger('swipe_intro');

   tree.html (after render() places bud nodes):
     // tree_second_bud fires here if they've clicked one bud before and
     // still have more left. tree_book_pointer / tree_quilt_pointer fire
     // here too, but only right after returning from completing an activity
     // (driven by the pf_just_completed_activity flag set in subject-tree.html).

   subject-tree.html (after render(), only if an unclicked bud exists):
     PFTutorial.trigger('tree_intro');
     // Inside markDone(), right after a slot becomes 'fruit':
     PFTutorial.trigger('fruit_harvest_tip');
     // markDone() also sets pf_just_completed_activity so the NEXT time
     // tree.html loads, it knows to show the book/quilt pointers once.

   orchard.html (on load):
     PFTutorial.trigger('orchard_intro');

   farmers-market.html (on load):
     PFTutorial.trigger('farmers_market_intro');
   ============================================================ */
