import {Plugin} from 'obsidian';
import {DEFAULT_SETTINGS, HierarchicalEmbedsSettings, HierarchicalEmbedsSettingTab} from "./settings";

export default class HierarchicalEmbedsPlugin extends Plugin {
	settings: HierarchicalEmbedsSettings;

	async onload() {
		await this.loadSettings();

		this.registerMarkdownPostProcessor((element, context) => {
			const internalEmbed = element.querySelector(".internal-embed");
			if (internalEmbed) {
				observeForMarkdownEmbed(element);
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

function observeForElementsAdded(element: HTMLElement) {
	const markdownEmbedObserver = new MutationObserver((records, observer) => {
		for (const record of records) {
			if (record.target instanceof HTMLElement) {
				const markdownEmbedAncestors = findAllMarkdownEmbedAncestors(record.target);
				console.debug("HierarchicalEmbedsPlugin: We have markdown-embed ancestors", markdownEmbedAncestors);
			}
		}
	});
	markdownEmbedObserver.observe(
		element,
		{
			subtree: true,
			childList: true
		}
	);
}

function findAllMarkdownEmbedAncestors(element: HTMLElement) {
	const ancestors: HTMLElement[] = [];
	let currentElement: HTMLElement | null = element.parentElement;
	while (currentElement) {
		if (currentElement.classList.contains("markdown-embed")) {
			ancestors.push(currentElement);
		}
		currentElement = currentElement.parentElement;
	}
	return ancestors;
}

function observeForMarkdownEmbed(element: HTMLElement) {
	const internalEmbedObserver = new MutationObserver((records, observer) => {
		for (const record of records) {
			if (record.target instanceof HTMLElement &&
				record.target.classList.contains("markdown-embed")) {
				
				observer.disconnect();
				//console.debug("HierarchicalEmbedsPlugin: We have a markdown-embed!", record);
				//console.debug("HierarchicalEmbedsPlugin: Does markdown-embed element have a grandparent?", record.target.parentElement?.parentElement);
				observeForElementsAdded(record.target);
				break;
			}
		}
	});
	internalEmbedObserver.observe(
		element,
		{
			subtree: true,
			attributes: true,
			attributeFilter: ["class"],
			attributeOldValue: true
		}
	);
}
