import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { countries } from './Countries/countries';

export class InternationalTelephoneControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private container: HTMLDivElement;
    private wrapper: HTMLDivElement;
    private inputElement: HTMLInputElement;
    private selectedOption: HTMLDivElement;
    private modal: HTMLDivElement;
    private modalContent: HTMLDivElement;
    private currentValue= "";
    private notifyOutputChanged: () => void;
    private defaultCountryCode = "+92";

    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary,
        container: HTMLDivElement
    ): void {
        this.container = container;
        this.notifyOutputChanged = notifyOutputChanged;

        this.createUI();
        this.createModal();
        this.populateModalOptions();
    }

    /**
     * Create input UI with selected country and toggle button
     */
    private createUI(): void {
        this.wrapper = document.createElement("div");
        this.wrapper.className = "phone-input-wrapper";

        const row = document.createElement("div");
        row.className = "phone-row-container";

        this.selectedOption = document.createElement("div");
        this.selectedOption.className = "selected-option";

        const placeholderFlag = document.createElement("div");
        placeholderFlag.className = "loading-icon";
        placeholderFlag.textContent = "⏳";

        const toggleButton = this.createModalToggleButton();

        this.selectedOption.appendChild(placeholderFlag);
        this.selectedOption.appendChild(toggleButton);

        this.inputElement = document.createElement("input");
        this.inputElement.type = "tel";
        this.inputElement.className = "phone-number-input";
        this.inputElement.placeholder = "Please Enter Phone Number";
        this.inputElement.addEventListener("input", this.onInputChange.bind(this));

        row.appendChild(this.selectedOption);
        row.appendChild(this.inputElement);
        this.wrapper.appendChild(row);
        this.container.appendChild(this.wrapper);
    }

    /**
     * Create a modal that shows all countries
     */
    private createModal(): void {
        this.modal = document.createElement("div");
        this.modal.className = "country-modal";

        const overlay = document.createElement("div");
        overlay.className = "modal-overlay";
        overlay.addEventListener("click", () => {
            this.modal.classList.remove("show");
        });

        this.modalContent = document.createElement("div");
        this.modalContent.className = "modal-content";

        this.modal.appendChild(overlay);
        this.modal.appendChild(this.modalContent);

        document.body.appendChild(this.modal);
    }

    /**
     * Create toggle button to open modal
     */
    private createModalToggleButton(): HTMLButtonElement {
        const toggleButton = document.createElement("button");
        toggleButton.className = "modal-toggle-button";
        toggleButton.type = "button";
        toggleButton.innerText = "🌐";
        toggleButton.addEventListener("pointerdown", (e) => {
            e.stopPropagation();
            this.modal.classList.add("show");
        });
        return toggleButton;
    }

    /**
     * Populate modal with country options
     */
    private populateModalOptions(): void {
        countries.forEach((country) => {
            const option = document.createElement("div");
            option.className = "modal-country-option";

            const flagImg = document.createElement("img");
            flagImg.src = country.flag;
            flagImg.alt = country.name;
            flagImg.className = "dropdown-flag";

            const text = document.createElement("div");
            text.className = "dropdown-text";
            text.textContent = `${country.name} (${country.nativeName}) ${country.code}`;

            option.appendChild(flagImg);
            option.appendChild(text);

            option.addEventListener("click", () => {
                this.setSelectedCountry(country.code, country.flag);
                this.modal.classList.remove("show");
                this.onInputChange();
            });

            this.modalContent.appendChild(option);

            if (country.code === this.defaultCountryCode) {
                this.setSelectedCountry(country.code, country.flag);
            }
        });
    }

    /**
     * Set selected country in control
     */
    private setSelectedCountry(code: string, flagUrl: string): void {
        this.selectedOption.innerHTML = "";

        const wrapper = document.createElement("div");
        wrapper.className = "selected-wrapper";

        const flag = document.createElement("img");
        flag.src = flagUrl;
        flag.alt = code;
        flag.className = "flag-icon";

        const codeText = document.createElement("span");
        codeText.textContent = code;
        codeText.className = "code-text";

        wrapper.appendChild(flag);
        wrapper.appendChild(codeText);

        this.selectedOption.appendChild(wrapper);
        this.selectedOption.appendChild(this.createModalToggleButton());
        this.selectedOption.setAttribute("data-code", code);
    }

    /**
     * Update phone number output
     */
    private onInputChange(): void {
        const code = this.selectedOption.getAttribute("data-code") || "";
        const number = this.inputElement.value.trim();
        this.currentValue = `${code} ${number}`;
        this.notifyOutputChanged();
    }

    public updateView(context: ComponentFramework.Context<IInputs>): void {
        //
    }
    //

    public getOutputs(): IOutputs {
        return {
            phoneNumber: this.currentValue
        };
    }

    public destroy(): void {
        // Clean up modal if needed
        if (this.modal && this.modal.parentElement) {
            document.body.removeChild(this.modal);
        }
    }
}
