const Payments = {
  interval: null,
  windowReference: null,
  // This is here to prevent notification spam; purchase canceling can be called multiple times before the first
  // call's Promise is settled
  hasCanceled: false,
  init: () => {
    // We have unfinished checkouts from when the page was last closed
    if (player.IAP.checkoutSession.id) {
      Payments.pollForPurchases();
    }
  },

  // Only called from clicking the "Buy More" button in the Shop tab

  buyMoreSTD: async STD => {
    GameUI.notify.error("Nah, I won't let you do that.", 10000);
  },
    
  // Starts a purchase-checking loop and adds a listener which cancels any ongoing purchases if the page is closed.
  // Any unresolved purchases will be reopened when the page is opened again in init()
  
  pollForPurchases: () => {
    GameUI.notify.error("What??", 10000);
  },
  
  // Sends a request to purchase a STD upgrade, returning true if successful (and syncs data), false if not
  async buyUpgrade(upgradeKey, cosmeticName) {
    GameUI.notify.error("You won't buy anything, ever.", 10000);
  },

  // Explicitly cancels purchases if the player chooses to, they take too long to resolve, or the page is closed
  async cancelPurchase(isTimeout) {
      GameUI.notify.error("Could not contact payment server! I wonder why...", 10000);
  },

  // Removes the repeating checker and page-close listener for if payments have been resolved
  clearInterval() {
   return;
  }
  
};

export default Payments;
