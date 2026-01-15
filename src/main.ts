import {Plugin} from 'obsidian';
import {DEFAULT_SETTINGS, HierarchicalEmbedsSettings, HierarchicalEmbedsSettingTab} from "./settings";

export default class HierarchicalEmbedsPlugin extends Plugin {
	settings: HierarchicalEmbedsSettings;

	async onload() {
		await this.loadSettings();

		this.registerMarkdownPostProcessor((element, context) => {
			// At the time we see "element", it will only have the class "internal-embed".
			// We need to observe it for class changes to detect when it becomes a "markdown-embed".
			const internalEmbedSpanElement = element.querySelector("span.internal-embed");
			if (internalEmbedSpanElement) {
				observeForMarkdownEmbeds(internalEmbedSpanElement);
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

function observeForMarkdownEmbeds(internalEmbedSpanElement: Element) {
	const mutationObserver = new MutationObserver((records, observer) => {
		for (const record of records) {
			if (isMarkdownEmbedRecord(record)) {
				// Now we know it's a markdown embed, we can process it.

				//observer.disconnect(); // Stop observing once we've detected the change.

				const markdownEmbedSpanElement = record.target as HTMLElement;

				const markdownPreviewSection = markdownEmbedSpanElement.querySelector("div.markdown-preview-section")!;
				observerForChildrenChanges(markdownPreviewSection);

				// Get all <div> descendants WITHOUT any of the classes "markdown-preview-pusher", "mod-header", or "mod-ui".

				// replaceWith() takes multiple arguments and replaces the element with all of them
				//markdownEmbedSpanElement.closest("div")?.replaceWith(...Array.from(divDescendants));

				//break;
			}
		}
	});
	mutationObserver.observe(internalEmbedSpanElement, {attributes: true, attributeFilter: ["class"]});
}

function isMarkdownEmbedRecord(record: MutationRecord): boolean {
	return record.type === "attributes"
		&& record.attributeName === "class"
		&& record.target instanceof HTMLElement
		&& record.target.matches(".markdown-embed");
}

function observerForChildrenChanges(element: Element) {
	const mutationObserver = new MutationObserver((records, observer) => {
		for (const record of records) {
			if (record.type === "childList") {
				console.debug("HierarchicalEmbedsPlugin: Child list changed:", record);
			}
		}
	});
	mutationObserver.observe(element, {childList: true});
}
