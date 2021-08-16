"use strict";

// Primary is lifted from the study tree (mostly),
// secondary is primary -15% l in hsl, apart from reality which is -10%
const perkColors = {
  [PERK_FAMILY.ANTIMATTER]: {
    primary: "#22aa48",
    secondary: "#156a2d"
  },
  [PERK_FAMILY.INFINITY]: {
    primary: "#b67f33",
    secondary: "#7b5623"
  },
  [PERK_FAMILY.ETERNITY]: {
    primary: "#b241e3",
    secondary: "#8b1cba"
  },
  [PERK_FAMILY.DILATION]: {
    primary: "#64dd17",
    secondary: "#449810"
  },
  [PERK_FAMILY.REALITY]: {
    primary: "#0b600e",
    secondary: "#063207"
  },
  [PERK_FAMILY.AUTOMATION]: {
    primary: "#ff0000",
    secondary: "#b30000"
  },
  [PERK_FAMILY.ACHIEVEMENT]: {
    primary: "#fdd835",
    secondary: "#e3ba02"
  },
};

const PerkNetwork = {
  container: undefined,
  network: undefined,
  nodes: undefined,
  minScale: 0.2,
  maxScale: 4,
  lastPerkNotation: "",
  pulseTimer: 0,
  initializeIfNeeded() {
    const notation = Notations.current.name;
    if (this.container !== undefined && notation === this.lastPerkNotation) return;
    this.lastPerkNotation = notation;

    this.nodes = new vis.DataSet(Perks.all.map(perk => ({
      id: perk.id,
      label: perk.config.label,
      title: perk.config.description
    })));

    const edges = [];
    for (const perk of Perks.all) {
      for (const connectedPerk of perk.connectedPerks) {
        const from = Math.min(perk.id, connectedPerk.id);
        const to = Math.max(perk.id, connectedPerk.id);
        if (edges.find(edge => edge.from === from && edge.to === to)) continue;
        edges.push({ from, to });
      }
    }

    const nodeData = {
      nodes: this.nodes,
      edges
    };

    const nodeOptions = {
      interaction: {
        hover: true,
        hoverConnectedEdges: false,
        selectConnectedEdges: false,
        tooltipDelay: 0,
      },
      nodes: {
        shape: "dot",
        size: 18,
        font: {
          size: 0
        },
        borderWidth: 2,
        shadow: true
      },
      edges: {
        width: 2,
        shadow: true,
        hoverWidth: width => width,
        selectionWidth: width => width,
        color: {
          inherit: "to"
        }
      },
    };

    const container = document.createElement("div");
    container.className = "vis-network c-perk-network";
    container.tabIndex = 900;
    const canvas = document.createElement("canvas");
    canvas.className = "c-perk-network__canvas";
    canvas.width = 900;
    canvas.height = 500;
    container.appendChild(canvas);
    this.container = container;

    const network = new vis.Network(container, nodeData, nodeOptions);
    this.network = network;

    network.on("click", params => {
      const id = params.nodes[0];
      if (!isFinite(id)) return;
      Perks.find(id).purchase();
      this.updatePerkColor();
    });

    network.on("dragStart", () => {
      const tooltip = container.getElementsByClassName("vis-tooltip")[0];
      if (tooltip !== undefined) {
        tooltip.style.visibility = "hidden";
      }
    });

    // Change node side while dragging on Cancer theme, but skip the method otherwise because it's mildly intensive
    network.on("dragging", () => {
      SecretAchievement(45).tryUnlock();
      if (Theme.current().name !== "S4") return;
      PerkNetwork.updatePerkSize();
    });

    network.on("zoom", () => {
      const scale = network.getScale();
      const clampedScale = Math.clamp(scale, this.minScale, this.maxScale);
      if (scale !== clampedScale) {
        network.moveTo({ scale: clampedScale });
      }
    });
  },
  resetPosition() {
    this.network.moveTo({ position: { x: -600, y: -300 }, scale: 0.8, offset: { x: 0, y: 0 } });
  },
  setLabelVisibility(areVisible) {
    const options = {
      nodes: {
        font: {
          size: areVisible ? 20 : 0,
          color: Theme.current().isDark ? "#DDDDDD" : "#222222",
        }
      }
    };
    this.network.setOptions(options);
  },
  updatePerkColor() {
    function nodeColor(perk) {
      const canBeBought = perk.canBeBought;
      const isBought = perk.isBought;

      const perkColor = perkColors[perk.config.family];
      const primaryColor = perkColor.primary;
      const secondaryColor = perkColor.secondary;

      let backgroundColor;
      if (canBeBought) {
        if (Theme.current().isDark) backgroundColor = "#DDDDDD";
        else backgroundColor = "#222222";
      } else if (isBought) backgroundColor = primaryColor;
      else backgroundColor = "#65656550";

      const hoverColor = canBeBought || isBought ? primaryColor : "#656565";
      const borderColor = `${secondaryColor}50`;

      return {
        background: backgroundColor,
        border: borderColor,
        hover: {
          background: hoverColor,
          border: borderColor
        },
        highlight: {
          background: backgroundColor,
          border: borderColor
        }
      };
    }

    const data = Perks.all
      .map(perk => ({ id: perk.id, color: nodeColor(perk) }));
    this.nodes.update(data);
  },
  updatePerkSize() {
    function nodeSize(perk) {
      PerkNetwork.pulseTimer += 0.1;
      // Make the nodes pulse continuously on Cancer theme
      const mod = Theme.current().name === "S4"
        ? 10 * Math.sin(5 * PerkNetwork.pulseTimer + 0.1 * perk._config.id)
        : 0;
      if (perk._config.label === "START") return 30 + mod;
      if (perk.isBought) return 20 + mod;
      return 15 + mod;
    }

    const data = Perks.all
      .map(perk => ({ id: perk.id, size: nodeSize(perk) }));
    this.nodes.update(data);
  }
};

Vue.component("perks-tab", {
  watch: {
    showHintText(newValue) {
      if (ui.view.theme === "S9") PerkNetwork.setLabelVisibility(false);
      else PerkNetwork.setLabelVisibility(newValue);
    }
  },
  created() {
    EventHub.ui.on(GAME_EVENT.PERK_BOUGHT, () => PerkNetwork.updatePerkColor());
  },
  mounted() {
    PerkNetwork.initializeIfNeeded();
    if (ui.view.theme === "S9") PerkNetwork.setLabelVisibility(false);
    else PerkNetwork.setLabelVisibility(ui.view.shiftDown || player.options.showHintText.perks);
    PerkNetwork.updatePerkColor();
    PerkNetwork.updatePerkSize();
    PerkNetwork.resetPosition();
    this.$refs.tab.appendChild(PerkNetwork.container);
  },
  computed: {
    showHintText() {
      return ui.view.shiftDown || player.options.showHintText.perks;
    }
  },
  template: `
    <div ref="tab" class="c-perk-tab">
      <pp-label />
    </div>`
});
