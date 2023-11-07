<script>
import ResetModal from "@/components/modals/prestige/ResetModal";

export default {
  name: "BigCrunchModal",
  components: {
    ResetModal
  },
  data() {
    return {
      gainedInfinities: new Decimal(),
      gainedInfinityPoints: new Decimal(),
      startingBoosts: 0,
      startingAM: 10,
      startingGalaxies: 0
    };
  },
  computed: {
    isFirstInfinity() {
      return !PlayerProgress.infinityUnlocked();
    },
    message() {
      const info = this.isFirstInfinity ? this.firstInfinityInfo : ``;
      return `Upon Infinity, all Dimensions, Dimension Boosts, and Antimatter Galaxies are reset. ${info}`;
    },
    firstInfinityInfo() {
      return `In return, you gain an Infinity Point (IP). This allows you to buy multiple upgrades that you can
        find in the Infinity tab. You will also gain one Infinity, which is the stat shown in the Statistics tab.`;
    },
    ipGainInfo() {
      return `You will gain ${quantify("Infinity", this.gainedInfinities, 2, 0)}
        and ${quantify("Infinity Point", this.gainedInfinityPoints, 2, 0)}.`;
    },
    startingResources() {
      const gainedResources = [];
      if (this.startingAM.gte(10)) gainedResources.push(`${quantify("Antimatter", this.startingAM, 2, 1)}`);
      if (this.startingBoosts > 0) gainedResources.push(`${quantify("Dimension Boost", this.startingBoosts)}`);
      if (this.startingGalaxies) gainedResources.push(`${quantify("Galaxy", this.startingGalaxies)}`);

      return `You will start your next Infinity with ${makeEnumeration(gainedResources)}.`;
    },
    // Achievement 115 won't keep dim boosts or galaxies if their respective autobuyers are off.
    autobuyerWarning() {
      if (player.auto.autobuyersOn && Autobuyer.dimboost.isActive && Autobuyer.galaxy.isActive) return;
      if (!Achievement(115).canBeApplied) return;
      const unkeptResources = [];
      if (!Autobuyer.dimboost.isActive) unkeptResources.push("Dimension Boosts");
      if (!Autobuyer.galaxy.isActive) unkeptResources.push("Antimatter Galaxies");
      if (unkeptResources.length >= 2) {
        return `Note that, because you disabled the autobuyers for ${unkeptResources[0]} and 
          ${unkeptResources[1]}, Achievement 115 won't keep those resources.`;
      } else {
        return `Note that, because you disabled the autobuyer for ${unkeptResources[0]}, 
          Achievement 115 won't keep that resource.`;
      }
    }
  },
  methods: {
    update() {
      this.gainedInfinities = gainedInfinities().round();
      this.gainedInfinityPoints = gainedInfinityPoints().round();
      // r115 will keep up to 200 Dim Boosts and 50 Galaxies, but only if
      // their autobuyer is active.
      if (Achievement(115).canBeApplied) {
        this.startingBoosts = Autobuyer.dimboost.isActive && player.auto.autobuyersOn ? 
          Math.clamp(player.dimensionBoosts, DimBoost.startingDimensionBoosts, 200) : 
          DimBoost.startingDimensionBoosts;
        this.startingGalaxies = Autobuyer.galaxy.isActive && player.auto.autobuyersOn ? 
          Math.clamp(player.galaxies, InfinityUpgrade.skipResetGalaxy.isBought, 50) : 
          (InfinityUpgrade.skipResetGalaxy.isBought ? 1 : 0);
      } else {
        this.startingBoosts = DimBoost.startingDimensionBoosts;
        this.startingGalaxies = InfinityUpgrade.skipResetGalaxy.isBought ? 1 : 0;
      }
      this.startingAM = Currency.antimatter.startingValue;
    },
    handleYesClick() {
      bigCrunchResetRequest();
      EventHub.ui.offAll(this);
      if (this.isFirstInfinity) {
        setTimeout(() => Modal.message.show(`This animation will occur after every manually-triggered Infinity. If
          you would like to disable it, there is a setting to do so in the Options tab. This can be done for any
          visual animation effect in the game after seeing it for the first time.`, {}, 3), 2000);
      }
    }
  },
};
</script>

<template>
  <ResetModal
    header="You are about to Infinity"
    :message="message"
    :gained-resources="ipGainInfo"
    :starting-resources="startingResources"
    :autobuyerWarning="autobuyerWarning"
    :confirm-fn="handleYesClick"
    :alternate-condition="isFirstInfinity"
    :alternate-text="message"
    :confirm-option="isFirstInfinity ? undefined : 'bigCrunch'"
  />
</template>
