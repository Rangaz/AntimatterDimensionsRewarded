<script>
import { openExternalLink } from "@/utility/open-external-link";
import { STEAM } from "@/env";
import ModalConfirmationCheck from "../modals/ModalConfirmationCheck.vue";

export default {
  name: "NewsTicker",
  data() {
    return {
      isModern: false,
      enableAnimation: false,
      timeAtNewsUpdate: new Date(),
      fastForward: false,
      showFForward: false,
      showSkip: false,
    };
  },
  computed: {
    lineClass() {
      return this.enableAnimation ? undefined : "c-disable-ticker-animation";
    },
    isFastForward() {
      return this.fastForward ? "fa-play" : "fa-forward";
    },
    oldFForwardPosition() {
      return this.showSkip ? "left: calc(10% - 32px)" : "left: 10%";
    }
  },
  beforeCreate() {
    this.recentTickers = [];
  },
  mounted() {
    document.addEventListener("visibilitychange", () => this.restart.bind(this));
    this.restart();
  },
  beforeDestroy() {
    this.clearTimeouts();
  },
  methods: {
    update() {
      if (this.currentNews?.dynamic) {
        this.$refs.line.innerHTML = this.currentNews.text;
      }
      this.isModern = player.options.newUI;
      this.enableAnimation = player.options.news.includeAnimated;
      this.showFForward = Achievement(22).isUnlocked && player.options.news.showFForward;
      this.showSkip = Achievement(22).isEnhanced;
    },
    restart() {
      if (!GameUI.initialized) {
        setTimeout(this.restart.bind(this), 100);
        return;
      }
      this.clearTimeouts();
      if (document.hidden) {
        return;
      }
      this.prepareNextMessage();
    },
    clearTimeouts() {
      clearTimeout(this.delayTimeout);
      clearTimeout(this.scrollTimeout);
    },
    prepareNextMessage() {
      const line = this.$refs.line;
      if (line === undefined) return;

      // Prevent tickers from repeating if they aren't unlocked or were seen recently
      const canShow = news => (news.unlocked ?? true) && !this.recentTickers.includes(news.id);

      if (nextNewsMessageId && GameDatabase.news.find(message => message.id === nextNewsMessageId)) {
        this.currentNews = GameDatabase.news.find(message => message.id === nextNewsMessageId);
        nextNewsMessageId = undefined;
      } else if (this.currentNews && this.currentNews.id === "a236") {
        this.currentNews = GameDatabase.news
          .filter(message => message.isAdvertising && canShow(message))
          .randomElement();
      } else {
        const isAI = Math.random() < player.options.news.AIChance;
        this.currentNews = GameDatabase.news
          .filter(message => message.id.includes("ai") === isAI)
          .filter(message => canShow(message))
          .randomElement();
      }

      this.recentTickers.push(this.currentNews.id);
      while (this.recentTickers.length > player.options.news.repeatBuffer) this.recentTickers.shift();

      if (this.currentNews.reset) {
        this.currentNews.reset();
      }

      let text = this.currentNews.text;
      if (STEAM) {
        window.openNewsLink = openExternalLink;
        text = text.replace(
          /href=['"]([^"']+)['"]/gu,
          "href onClick='window.openNewsLink(\"$1\"); return false;'"
        );
      }
      line.innerHTML = text;

      line.style["transition-duration"] = "0ms";
      if (this.currentNews?.id === "a244" || this.currentNews?.id === "ai63") {
        line.style.transform = "translateX(-100%)";
      } else {
        line.style.transform = "translateX(0)";
      }

      const DELAY = 1000;
      this.delayTimeout = setTimeout(this.scrollMessage.bind(this), DELAY);
    },
    scrollMessage() {
      const line = this.$refs.line;

      this.timeAtNewsUpdate = Date.now();

      // SCROLL_SPEED is in pixels per second. Fast forward will double it.
      const SCROLL_SPEED = player.options.news.speed * 100 * (1 + player.news.isFastForward);
      const scrollDuration = (this.$refs.ticker.clientWidth + line.clientWidth) / SCROLL_SPEED;

      line.style["transition-duration"] = `${scrollDuration}s`;
      if (this.currentNews && this.currentNews.id === "a244") {
        line.style.transform = "translateX(0)";
      } else {
        line.style.transform = "translateX(-100%)";
      }

      NewsHandler.addSeenNews(this.currentNews.id);
      if (NewsHandler.uniqueTickersSeen >= 50) Achievement(22).unlock();

      this.scrollTimeout = setTimeout(this.prepareNextMessage.bind(this), scrollDuration * 1000);
    },
    onLineClick() {
      if (this.currentNews.onClick === undefined) {
        return;
      }
      SecretAchievement(24).unlock();
      const updatedText = this.currentNews.onClick();
      if (updatedText !== undefined) {
        this.$refs.line.innerHTML = updatedText;
      }
    },
    onFastForward() {
      const line = this.$refs.line;
      player.news.isFastForward = !player.news.isFastForward;
      this.fastForward = player.news.isFastForward;

      // If the transition duration is 0 ms, it means that it's preparing the next news.
      if (Number.parseFloat(line.style["transition-duration"]) <= 0) return;

      // The time passed since the news ticker puts a new news, or when its state has changed.
      const timePassed = (Date.now() - this.timeAtNewsUpdate) / 1000;

      // We want to take into account the time that has transcurred since the last change in 
      // either news or speed, and wheter we are fast forwarding or disabling it.
      const scrollDuration = player.news.isFastForward ? 
      (Number.parseFloat(line.style["transition-duration"]) - timePassed) / 2 :
      (Number.parseFloat(line.style["transition-duration"]) - timePassed) * 2;

      line.style["transition-duration"] = `${scrollDuration}s`;

      this.timeAtNewsUpdate = Date.now();

      // I think this has to have different values every time in order to update the speed.
      const randVar = Math.random() / 10;
      if (this.currentNews && this.currentNews.id === "a244") {
        line.style.transform = `translateX(${randVar - 0.1})`;
      } else {
        line.style.transform = `translateX(-${randVar + 100}%)`;
      }
      this.clearTimeouts();
      this.scrollTimeout = setTimeout(this.prepareNextMessage.bind(this), scrollDuration * 1000);
    },
    onSkip() {
      // Skip inmediately skips the current news and starts preparing the next one.
      const line = this.$refs.line;
      this.timeAtNewsUpdate = Date.now();

      line.style["transition-duration"] = "0s";
      this.clearTimeouts();
      this.prepareNextMessage();
    }
  }
};
</script>

<template>
  <div
    ref="ticker"
    class="c-news-ticker"
  >
    <button
      :class="isFastForward"
      class="o-primary-btn c-fforward-button l-fforward-button fas"
      @click="onFastForward"
      v-if="showFForward && isModern"
      >
    </button>
    <button
      :class="isFastForward"
      class="o-primary-btn c-old-fforward-button l-old-fforward-button fas"
      :style="oldFForwardPosition"
      @click="onFastForward"
      v-if="showFForward && !isModern"
      >
    </button>
    <button
      class="o-primary-btn c-skip-button l-skip-button fas fa-fast-forward"
      @click="onSkip"
      v-if="showSkip && isModern"
      >
    </button>
    <button
      class="o-primary-btn c-old-skip-button l-old-skip-button fas fa-fast-forward"
      @click="onSkip"
      v-if="showSkip && !isModern"
      >
    </button>
    <span
      ref="line"
      class="c-news-line c-news-ticker__line"
      :class="lineClass"
      @click="onLineClick"
    />
  </div>
</template>

<style scoped>
.c-fforward-button {
  z-index: 9;
  width: 32px;
}
.c-old-fforward-button {
  z-index: 9;
  width: 32px;
}
.l-fforward-button {
  position: absolute;
  left: 12.8rem; /* This is the same width as the modern sidebar. */
}
.l-old-fforward-button {
  position: absolute;
  /*left: 10%; /* This is good enough for most zoom levels. */
}
.c-skip-button {
  z-index: 9;
  width: 32px;
}
.c-old-skip-button {
  z-index: 9;
  width: 32px;
}
.l-skip-button {
  position: absolute;
  left: calc(12.8rem + 32px);
}
.l-old-skip-button {
  position: absolute;
  left: 10%;
}
</style>