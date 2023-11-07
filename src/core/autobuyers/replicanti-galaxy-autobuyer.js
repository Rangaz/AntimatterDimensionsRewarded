import { AutobuyerState } from "./autobuyer";

export class ReplicantiGalaxyAutobuyerState extends AutobuyerState {
  get data() {
    return player.auto.replicantiGalaxies;
  }

  get name() {
    return `Replicanti Galaxy`;
  }

  get isUnlocked() {
    return EternityMilestone.autobuyerReplicantiGalaxy.isReached;
  }

  get isEnabled() { // This will be spared from Cursed Row 13
    return Achievement(138).isUnlocked || !TimeStudy(131).isBought;
  }

  get hasUnlimitedBulk() { // This won't get spared
    return Achievement(126).isUnlocked && !Achievement(126).isCursed;
  }

  tick() {
    if (!this.isEnabled) return;
    replicantiGalaxy(true);
  }
}
