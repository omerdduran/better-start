// Settings Panel Styles
// This file contains all CSS styles for the settings panel component

const SETTINGS_STYLES = `
        * {
          box-sizing: border-box;
        }

        .settings-panel {
          animation: slideUp 200ms ease-out;
          background: var(--color-background);
          border-radius: var(--border-radius);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          display: none;
          max-height: 70vh;
          overflow-y: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          padding: 1.5rem;
          position: fixed;
          right: var(--space);
          bottom: calc(var(--space) * 4);
          width: min(90vw, 360px);
          z-index: 99;
        }

        .settings-panel::-webkit-scrollbar {
          display: none;
        }

        .settings-panel.open {
          display: block;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(136, 136, 136, 0.2);
        }

        .header h2 {
          color: var(--color-text);
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .close-btn {
          background: none;
          border: none;
          color: var(--color-text-subtle);
          cursor: pointer;
          font-size: 1.5rem;
          line-height: 1;
          padding: 0;
          transition: color 150ms;
        }

        .close-btn:hover {
          color: var(--color-text);
        }

        .section {
          margin-bottom: 1.5rem;
        }

        .section:last-child {
          margin-bottom: 0;
        }

        .section-title {
          color: var(--color-text-subtle);
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin: 0 0 0.75rem 0;
        }

        .option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem 0;
        }

        .option-label {
          color: var(--color-text);
          font-size: 0.9rem;
        }

        /* Toggle Switch */
        .toggle {
          position: relative;
          width: 40px;
          height: 22px;
        }

        .toggle input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          inset: 0;
          background: rgba(136, 136, 136, 0.3);
          border-radius: 11px;
          cursor: pointer;
          transition: background 150ms;
        }

        .toggle-slider::before {
          content: '';
          position: absolute;
          height: 18px;
          width: 18px;
          left: 2px;
          bottom: 2px;
          background: white;
          border-radius: 50%;
          transition: transform 150ms;
        }

        .toggle input:checked + .toggle-slider {
          background: var(--color-accent);
        }

        .toggle input:checked + .toggle-slider::before {
          transform: translateX(18px);
        }

        /* Select */
        select {
          appearance: none;
          background: rgba(136, 136, 136, 0.1);
          border: 1px solid rgba(136, 136, 136, 0.2);
          border-radius: 6px;
          color: var(--color-text);
          cursor: pointer;
          font-size: 0.85rem;
          padding: 0.4rem 2rem 0.4rem 0.75rem;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23888' d='M6 8L2 4h8z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.5rem center;
        }

        select:focus {
          outline: none;
          border-color: var(--color-accent);
        }

        /* Text Input */
        input[type="text"],
        input[type="url"],
        input[type="number"] {
          background: rgba(136, 136, 136, 0.1);
          border: 1px solid rgba(136, 136, 136, 0.2);
          border-radius: 6px;
          color: var(--color-text);
          font-size: 0.85rem;
          padding: 0.5rem 0.75rem;
          width: 100%;
        }

        input[type="text"]:focus,
        input[type="url"]:focus,
        input[type="number"]:focus {
          outline: none;
          border-color: var(--color-accent);
        }

        input[type="number"] {
          width: 60px;
          text-align: center;
          -moz-appearance: textfield;
        }

        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        input::placeholder {
          color: var(--color-text-subtle);
        }

        /* Commands List */
        .commands-list {
          margin-top: 0.5rem;
        }

        .command-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 0;
          border-bottom: 1px solid rgba(136, 136, 136, 0.1);
        }

        .command-item:last-child {
          border-bottom: none;
        }

        .command-item.dragging {
          opacity: 0.5;
          background: rgba(136, 136, 136, 0.1);
        }

        .command-item.drag-over {
          border-top: 2px solid var(--color-accent);
        }

        .drag-handle {
          cursor: grab;
          color: var(--color-text-subtle);
          opacity: 0.4;
          font-size: 0.9rem;
          padding: 0.25rem;
          user-select: none;
        }

        .drag-handle:hover {
          opacity: 0.8;
        }

        .drag-handle:active {
          cursor: grabbing;
        }

        .command-key {
          background: rgba(136, 136, 136, 0.15);
          border-radius: 4px;
          color: var(--color-text);
          font-size: 0.8rem;
          font-weight: 600;
          padding: 0.2rem 0.5rem;
          min-width: 2rem;
          text-align: center;
        }

        .command-name {
          color: var(--color-text-subtle);
          font-size: 0.85rem;
          flex: 1;
        }

        .delete-btn {
          background: none;
          border: none;
          color: var(--color-text-subtle);
          cursor: pointer;
          font-size: 1rem;
          padding: 0.25rem;
          opacity: 0.5;
          transition: opacity 150ms, color 150ms;
        }

        .delete-btn:hover {
          color: #ff4a4a;
          opacity: 1;
        }

        .edit-btn {
          background: none;
          border: none;
          color: var(--color-text-subtle);
          cursor: pointer;
          font-size: 0.85rem;
          padding: 0.25rem;
          opacity: 0.5;
          transition: opacity 150ms, color 150ms;
        }

        .edit-btn:hover {
          color: var(--color-accent);
          opacity: 1;
        }

        .command-actions {
          display: flex;
          gap: 0.25rem;
        }

        /* Add Command Form */
        .add-form {
          display: grid;
          gap: 0.5rem;
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(136, 136, 136, 0.1);
        }

        .form-row {
          display: grid;
          grid-template-columns: 3rem 1fr;
          gap: 0.5rem;
        }

        .add-btn {
          background: var(--color-accent);
          border: none;
          border-radius: 6px;
          color: white;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 500;
          padding: 0.5rem 1rem;
          transition: opacity 150ms;
        }

        .add-btn:hover {
          opacity: 0.9;
        }

        .cancel-btn {
          background: rgba(136, 136, 136, 0.3);
          border: none;
          border-radius: 6px;
          color: var(--color-text);
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 500;
          padding: 0.5rem 1rem;
          transition: opacity 150ms;
          display: none;
        }

        .cancel-btn.visible {
          display: block;
        }

        .cancel-btn:hover {
          opacity: 0.8;
        }

        .form-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .form-buttons .add-btn {
          flex: 1;
        }
          transition: opacity 150ms;
        }

        .add-btn:hover {
          opacity: 0.9;
        }

        .input-small {
          text-align: center;
        }

        .subsection {
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(136, 136, 136, 0.1);
        }

        .subsection-title {
          color: var(--color-text-subtle);
          font-size: 0.8rem;
          margin: 0 0 0.5rem 0;
        }

        /* Info tooltip */
        .info-wrapper {
          position: relative;
          display: inline-block;
        }

        .info-btn {
          background: rgba(136, 136, 136, 0.2);
          border: none;
          border-radius: 50%;
          color: var(--color-text-subtle);
          cursor: help;
          font-size: 0.7rem;
          font-weight: 600;
          width: 16px;
          height: 16px;
          padding: 0;
          line-height: 16px;
          text-align: center;
          margin-left: 0.5rem;
        }

        .info-tooltip {
          display: none;
          position: fixed;
          right: calc(var(--space) + 380px);
          bottom: 150px;
          background: var(--color-background);
          border: 1px solid rgba(136, 136, 136, 0.3);
          border-radius: 8px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
          padding: 0.75rem;
          width: 260px;
          z-index: 1001;
          font-size: 0.75rem;
          color: var(--color-text);
        }

        .info-wrapper:hover .info-tooltip {
          display: block;
        }

        .info-tooltip h4 {
          margin: 0 0 0.5rem 0;
          font-size: 0.8rem;
          color: var(--color-text);
        }

        .info-tooltip code {
          background: rgba(136, 136, 136, 0.15);
          padding: 0.1rem 0.3rem;
          border-radius: 3px;
          font-size: 0.7rem;
        }

        .info-tooltip ul {
          margin: 0;
          padding-left: 1rem;
        }

        .info-tooltip li {
          margin-bottom: 0.3rem;
          color: var(--color-text-subtle);
        }

        .optional-label {
          color: var(--color-text-subtle);
          font-size: 0.7rem;
          margin-left: 0.25rem;
        }

        /* Confirm Modal */
        .confirm-modal {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          z-index: 2000;
          align-items: center;
          justify-content: center;
        }

        .confirm-modal.visible {
          display: flex;
        }

        .confirm-box {
          background: var(--color-background);
          border-radius: 12px;
          padding: 1.5rem;
          max-width: 350px;
          text-align: center;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        }

        .confirm-box h3 {
          margin: 0 0 0.75rem;
          color: var(--color-text);
          font-size: 1rem;
        }

        .confirm-box p {
          margin: 0 0 1.25rem;
          color: var(--color-text-subtle);
          font-size: 0.85rem;
          line-height: 1.4;
        }

        .confirm-buttons {
          display: flex;
          gap: 0.75rem;
        }

        .confirm-buttons button {
          flex: 1;
          padding: 0.6rem 1rem;
          border: none;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
        }

        .confirm-cancel {
          background: rgba(136, 136, 136, 0.3);
          color: var(--color-text);
        }

        .confirm-ok {
          background: #dc3545;
          color: white;
        }

        /* Location Autocomplete */
        .location-wrapper {
          position: relative;
          flex: 1;
        }

        .location-suggestions {
          display: none;
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: var(--color-background);
          border: 1px solid rgba(136, 136, 136, 0.3);
          border-top: none;
          border-radius: 0 0 6px 6px;
          max-height: 200px;
          overflow-y: auto;
          z-index: 100;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .location-suggestions.visible {
          display: block;
        }

        .location-suggestion {
          padding: 0.5rem 0.75rem;
          cursor: pointer;
          font-size: 0.85rem;
          color: var(--color-text);
          border-bottom: 1px solid rgba(136, 136, 136, 0.1);
        }

        .location-suggestion:last-child {
          border-bottom: none;
        }

        .location-suggestion:hover {
          background: rgba(136, 136, 136, 0.15);
        }

        .location-suggestion .country {
          color: var(--color-text-subtle);
          font-size: 0.75rem;
          margin-left: 0.5rem;
        }
`;
