import {Plugin} from 'obsidian';
import {DEFAULT_SETTINGS, HierarchicalEmbedsSettings, HierarchicalEmbedsSettingTab} from "./settings";

export default class HierarchicalEmbedsPlugin extends Plugin {
	settings: HierarchicalEmbedsSettings;

	async onload() {
		await this.loadSettings();

		this.registerMarkdownPostProcessor((element, context) => {
			const spanNode = element.querySelector("span.internal-embed");
			if (spanNode) {
				const mo = new MutationObserver((records, observer) => {
					console.log("Hierarchical Embeds Plugin: detected mutation in embed:", records);
				});
				mo.observe(spanNode, {attributes: true, attributeFilter: ["class"]});
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new HierarchicalEmbedsSettingTab(this.app, this));
	}

	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<HierarchicalEmbedsSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
