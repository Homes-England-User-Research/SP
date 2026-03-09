/**
 * year-tabs.js
 *
 * WAI-ARIA Authoring Practices Guide tab pattern for navigating between
 * financial year panels.
 *
 * Spec: https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
 *
 * Expected HTML structure:
 *
 *   <div data-module="year-tabs">
 *     <ul role="tablist" aria-label="Financial years">
 *       <li role="presentation">
 *         <button role="tab" id="tab-2024" aria-controls="panel-2024"
 *                 aria-selected="true" tabindex="0">2024-25</button>
 *       </li>
 *       <li role="presentation">
 *         <button role="tab" id="tab-2023" aria-controls="panel-2023"
 *                 aria-selected="false" tabindex="-1">2023-24</button>
 *       </li>
 *     </ul>
 *     <div role="tabpanel" id="panel-2024" aria-labelledby="tab-2024">
 *       ...content...
 *     </div>
 *     <div role="tabpanel" id="panel-2023" aria-labelledby="tab-2023" hidden>
 *       ...content...
 *     </div>
 *   </div>
 *
 * Graceful degradation: without JavaScript all panels remain visible.
 * JavaScript adds the `hidden` attribute to non-active panels on init.
 *
 * Vanilla JS only — no jQuery or framework dependency.
 */

(function () {
  'use strict';

  /**
   * Initialise a single year-tabs widget.
   * @param {HTMLElement} container - Element with data-module="year-tabs"
   */
  function initYearTabs(container) {
    var tabList = container.querySelector('[role="tablist"]');
    if (!tabList) { return; }

    var tabs = Array.prototype.slice.call(container.querySelectorAll('[role="tab"]'));
    var panels = Array.prototype.slice.call(container.querySelectorAll('[role="tabpanel"]'));

    if (tabs.length === 0) { return; }

    // On init: hide all panels except the currently selected tab's panel.
    // If no tab has aria-selected="true", default to the first tab.
    var selectedTab = tabs.filter(function (t) {
      return t.getAttribute('aria-selected') === 'true';
    })[0] || tabs[0];

    tabs.forEach(function (tab) {
      var isSelected = tab === selectedTab;
      tab.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      tab.setAttribute('tabindex', isSelected ? '0' : '-1');
    });

    panels.forEach(function (panel) {
      var controlledBy = tabs.filter(function (t) {
        return t.getAttribute('aria-controls') === panel.id;
      })[0];
      if (controlledBy === selectedTab) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', '');
      }
    });

    // ── Event handlers ──────────────────────────────────────────────────────

    /**
     * Activate a tab and show its panel.
     * @param {HTMLElement} tab
     */
    function activateTab(tab) {
      tabs.forEach(function (t) {
        t.setAttribute('aria-selected', 'false');
        t.setAttribute('tabindex', '-1');
      });
      panels.forEach(function (panel) {
        panel.setAttribute('hidden', '');
      });

      tab.setAttribute('aria-selected', 'true');
      tab.setAttribute('tabindex', '0');
      tab.focus();

      var panelId = tab.getAttribute('aria-controls');
      var targetPanel = document.getElementById(panelId);
      if (targetPanel) {
        targetPanel.removeAttribute('hidden');
      }
    }

    /**
     * Get the index of a tab in the tabs array.
     * @param {HTMLElement} tab
     * @returns {number}
     */
    function indexOfTab(tab) {
      return tabs.indexOf(tab);
    }

    // Click: activate the clicked tab
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        activateTab(tab);
      });
    });

    // Keyboard: arrow keys, Home, End
    tabList.addEventListener('keydown', function (event) {
      var currentTab = document.activeElement;
      var currentIndex = indexOfTab(currentTab);

      if (currentIndex === -1) { return; }

      var newIndex;

      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault();
          newIndex = (currentIndex + 1) % tabs.length;
          activateTab(tabs[newIndex]);
          break;

        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault();
          newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
          activateTab(tabs[newIndex]);
          break;

        case 'Home':
          event.preventDefault();
          activateTab(tabs[0]);
          break;

        case 'End':
          event.preventDefault();
          activateTab(tabs[tabs.length - 1]);
          break;

        // Enter and Space are handled naturally by the click event on <button>
        default:
          break;
      }
    });
  }

  /**
   * Find and initialise all year-tabs widgets on the page.
   */
  function init() {
    var containers = document.querySelectorAll('[data-module="year-tabs"]');
    Array.prototype.forEach.call(containers, initYearTabs);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());
